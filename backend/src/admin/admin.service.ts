import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { College } from '../colleges/entities/college.entity';
import { CollegeStaff } from '../colleges/entities/college-staff.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { User, UserRole } from '../users/user.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { Placement } from '../placements/entities/placement.entity';
import { Application } from '../applications/entities/application.entity';
import { PendingUpgradeOrder } from '../users/entities/pending-upgrade-order.entity';
import { UsersService } from '../users/users.service';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(College)
    private collegesRepo: Repository<College>,
    @InjectRepository(CollegeStaff)
    private staffRepo: Repository<CollegeStaff>,
    @InjectRepository(AdminActivityLog)
    private logRepo: Repository<AdminActivityLog>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(InterviewSession)
    private interviewSessionsRepo: Repository<InterviewSession>,
    @InjectRepository(Placement)
    private placementsRepo: Repository<Placement>,
    @InjectRepository(Application)
    private applicationsRepo: Repository<Application>,
    @InjectRepository(PendingUpgradeOrder)
    private pendingUpgradeOrdersRepo: Repository<PendingUpgradeOrder>,
    private usersService: UsersService,
  ) {}

  async createCompanyAdmin(
    dto: CreateCompanyAdminDto,
    actor?: {
      id?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    const user = await this.usersService.create(
      dto.email,
      dto.password,
      UserRole.COMPANY_ADMIN,
      dto.firstName,
      dto.lastName,
      dto.timezone,
    );

    const actorName =
      `${actor?.firstName || ''} ${actor?.lastName || ''}`.trim() ||
      actor?.email ||
      'System';

    await this.logAction({
      actorId: actor?.id || null,
      actorName,
      action: 'Company Admin Provisioned',
      target: user.email,
      severity: 'info',
      metadata: {
        userId: user.id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      timezone: user.timezone,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async getAnalytics(range?: string) {
    const now = Date.now();
    const windowMs =
      range === '24h'
        ? 24 * 60 * 60 * 1000
        : range === '30d'
          ? 30 * 24 * 60 * 60 * 1000
          : 7 * 24 * 60 * 60 * 1000;
    const since = new Date(now - windowMs);
    const visitors = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.STUDENT })
      .andWhere('user.createdAt >= :since', { since })
      .getCount();
    const subscribers = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.STUDENT })
      .andWhere('user.subscriptionStatus = :status', { status: 'active' })
      .andWhere('user.subscriptionPlan <> :plan', { plan: 'free' })
      .getCount();
    const activeNow = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.STUDENT })
      .andWhere('user.lastActiveAt >= :threshold', {
        threshold: new Date(Date.now() - 15 * 60 * 1000),
      })
      .getCount();

    const interviewCount = await this.interviewSessionsRepo
      .createQueryBuilder('session')
      .where('session.createdAt >= :since', { since })
      .getCount();
    const driveCount = await this.placementsRepo
      .createQueryBuilder('placement')
      .where('placement.createdAt >= :since', { since })
      .getCount();
    const applicationCount = await this.applicationsRepo
      .createQueryBuilder('application')
      .where('application.appliedAt >= :since', { since })
      .getCount();

    const totalEngagement = interviewCount + driveCount + applicationCount || 1;
    const percent = (count: number) =>
      Math.round((count / totalEngagement) * 100);

    return {
      visitors,
      subscribers,
      activeNow,
      funnels: [
        { stage: 'Registered', count: String(visitors), percentage: 100 },
        {
          stage: 'Started Practice',
          count: String(interviewCount),
          percentage: percent(interviewCount),
        },
        {
          stage: 'Posted Drives',
          count: String(driveCount),
          percentage: percent(driveCount),
        },
        {
          stage: 'Applications',
          count: String(applicationCount),
          percentage: percent(applicationCount),
        },
        {
          stage: 'Subscribed',
          count: String(subscribers),
          percentage: percent(subscribers),
        },
      ],
      featureEngagement: [
        {
          name: 'Mock Interviews',
          time: `${interviewCount} sessions`,
          percentage: percent(interviewCount),
          color: 'bg-rose-500',
        },
        {
          name: 'Placement Drives',
          time: `${driveCount} drives`,
          percentage: percent(driveCount),
          color: 'bg-blue-500',
        },
        {
          name: 'Applications',
          time: `${applicationCount} applications`,
          percentage: percent(applicationCount),
          color: 'bg-emerald-500',
        },
      ],
    };
  }

  async logAction(payload: Partial<AdminActivityLog>) {
    const log = this.logRepo.create({
      actorId: payload.actorId || null,
      actorName: payload.actorName || 'System',
      action: payload.action || 'Action',
      target: payload.target || null,
      severity: payload.severity || 'info',
      metadata: payload.metadata || null,
    });

    try {
      return await this.logRepo.save(log);
    } catch (error) {
      console.error('[admin] Failed to persist activity log:', error);
      return null;
    }
  }

  async getStudents() {
    const students = await this.usersRepo.find({
      where: { role: UserRole.STUDENT },
      order: { createdAt: 'DESC' },
    });
    const colleges = await this.collegesRepo.find();
    const collegeMap = new Map(colleges.map((c) => [c.id, c.name]));

    const premiumUsers = students.filter(
      (s) => s.subscriptionPlan === 'pro' && s.subscriptionStatus === 'active',
    ).length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = students.filter(
      (s) => s.createdAt && new Date(s.createdAt).getTime() >= weekAgo,
    ).length;

    return {
      totalStudents: students.length,
      premiumUsers,
      newThisWeek,
      students: students.map((s) => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email,
        email: s.email,
        mobile: '',
        college: s.collegeId
          ? collegeMap.get(s.collegeId) || 'Unknown'
          : 'Independent Learner',
        subscription: s.subscriptionPlan,
        joinedAt: s.createdAt,
        status: s.isActive ? 'active' : 'disabled',
        avatarBase: s.firstName || s.email?.split('@')[0] || 'Student',
      })),
    };
  }

  async getRecentSubscriptionPayments(limit = 50) {
    const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));

    const orders = await this.pendingUpgradeOrdersRepo.find({
      where: { status: 'paid' },
      order: { paidAt: 'DESC', createdAt: 'DESC' },
      take: safeLimit,
    });

    if (!orders.length) {
      return [];
    }

    const userIds = Array.from(new Set(orders.map((order) => order.userId)));
    const users = await this.usersRepo.find({
      where: { id: In(userIds) },
      select: ['id', 'email', 'firstName', 'lastName'],
    });
    const userMap = new Map(users.map((user) => [user.id, user]));

    return orders.map((order) => {
      const user = userMap.get(order.userId);
      const fullName =
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

      return {
        id: order.id,
        userId: order.userId,
        userEmail: user?.email || null,
        userName: fullName || null,
        plan: order.plan,
        amountInPaise: order.amountInPaise,
        amount: Number((order.amountInPaise / 100).toFixed(2)),
        currency: order.currency,
        paymentId: order.paymentId,
        orderId: order.providerOrderId,
        status: order.status,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      };
    });
  }

  async disableStudent(id: string) {
    const student = await this.usersRepo.findOne({
      where: { id, role: UserRole.STUDENT },
    });
    if (!student) {
      return { success: false };
    }
    student.isActive = false;
    await this.usersRepo.save(student);
    return { success: true };
  }

  async deleteStudent(id: string) {
    const student = await this.usersRepo.findOne({
      where: { id, role: UserRole.STUDENT },
    });
    if (!student) {
      return { success: false };
    }
    await this.usersRepo.remove(student);
    return { success: true };
  }
}
