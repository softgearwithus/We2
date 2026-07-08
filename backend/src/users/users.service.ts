import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  buildTotpUri,
  generateTotpSecret,
  verifyTotpCode,
} from '../common/totp.util';
import {
  InterviewSession,
  InterviewStatus,
} from '../interviews/entities/interview-session.entity';
import { Resume } from '../resume/entities/resume.entity';
import { MentorSession } from '../mentors/entities/mentor-session.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';
import { PlatformSettings } from '../admin-settings/entities/platform-settings.entity';
import { PendingUpgradeOrder } from './entities/pending-upgrade-order.entity';
import { UserRole } from './user.entity';

const SUBSCRIPTION_PLAN_IDENTIFIER = /^pro_1m$/;

const DEFAULT_SUBSCRIPTION_PRICES_IN_PAISE: Record<string, number> = {
  pro_1m: 79900,
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(InterviewSession)
    private interviewsRepository: Repository<InterviewSession>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(MentorSession)
    private mentorSessionsRepository: Repository<MentorSession>,
    @InjectRepository(UserGamification)
    private gamificationRepository: Repository<UserGamification>,
    @InjectRepository(PlatformSettings)
    private platformSettingsRepository: Repository<PlatformSettings>,
    @InjectRepository(PendingUpgradeOrder)
    private pendingUpgradeOrdersRepository: Repository<PendingUpgradeOrder>,
  ) {}

  async create(
    email: string,
    password: string,
    role: UserRole = UserRole.STUDENT,
    firstName?: string,
    lastName?: string,
    timezone?: string,
  ): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const normalizedRole = String(role || UserRole.STUDENT).toLowerCase();
    const allowedRoles = new Set<string>([
      UserRole.STUDENT,
      UserRole.MENTOR,
      UserRole.COMPANY_ADMIN,
      UserRole.COLLEGE_ADMIN,
      UserRole.SUPER_ADMIN,
    ]);
    if (!allowedRoles.has(normalizedRole)) {
      throw new BadRequestException('Invalid role specified');
    }

    const user = this.usersRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole as UserRole,
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      subscriptionEndDate: null,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      timezone: timezone || null,
      isActive: true,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: [
        'id',
        'email',
        'password',
        'role',
        'isActive',
        'isTwoFactorEnabled',
        'twoFactorSecret',
        'subscriptionPlan',
        'subscriptionStatus',
        'subscriptionEndDate',
        'sessionVersion',
        'firstName',
        'lastName',
        'timezone',
        'avatarUrl',
      ],
    });

    if (!user) return null;

    // --- Exact Millisecond Expiration & Unpausing Logic ---
    if (
      user.subscriptionStatus === 'active' &&
      user.subscriptionEndDate &&
      user.subscriptionEndDate.getTime() <= Date.now()
    ) {
      if (
        user.pausedSubscriptionPlan &&
        user.pausedSubscriptionRemainingDays > 0
      ) {
        // Resume the paused plan
        user.subscriptionPlan = user.pausedSubscriptionPlan;
        user.subscriptionEndDate = new Date(
          Date.now() +
            user.pausedSubscriptionRemainingDays * 24 * 60 * 60 * 1000,
        );

        // Clear the paused state
        user.pausedSubscriptionPlan = null;
        user.pausedSubscriptionRemainingDays = 0;
      } else {
        // Downgrade to free
        user.subscriptionPlan = 'free';
        user.subscriptionStatus = 'expired';
      }
      // Save the automated transition to the DB immediately
      await this.usersRepository.save(user);
    }

    return user;
  }

  async findByCredentialId(credentialId: string): Promise<User | null> {
    const normalizedId = credentialId.trim();
    return this.usersRepository.findOne({
      where: { credentialId: normalizedId },
      select: [
        'id',
        'email',
        'password',
        'role',
        'isActive',
        'isTwoFactorEnabled',
        'twoFactorSecret',
        'subscriptionPlan',
        'subscriptionStatus',
        'subscriptionEndDate',
        'sessionVersion',
        'firstName',
        'lastName',
        'timezone',
        'avatarUrl',
        'credentialId',
        'collegeId',
        'department',
        'year',
      ],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];
    return this.usersRepository.findBy({ id: In(ids) });
  }

  async findAll(role?: string): Promise<User[]> {
    if (role) {
      return this.usersRepository.find({ where: { role: role as UserRole } });
    }
    return this.usersRepository.find();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email) {
      user.email = updateUserDto.email.toLowerCase().trim();
    }

    if (updateUserDto.firstName !== undefined) {
      user.firstName = updateUserDto.firstName?.trim() || null;
    }

    if (updateUserDto.lastName !== undefined) {
      user.lastName = updateUserDto.lastName?.trim() || null;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    if (updateUserDto.timezone !== undefined) {
      user.timezone = updateUserDto.timezone || null;
    }

    if (updateUserDto.avatarUrl !== undefined) {
      user.avatarUrl = updateUserDto.avatarUrl || null;
    }

    if (updateUserDto.username !== undefined) {
      user.username = updateUserDto.username || null;
    }

    if (updateUserDto.roleTitle !== undefined) {
      user.roleTitle = updateUserDto.roleTitle || null;
    }

    if (updateUserDto.location !== undefined) {
      user.location = updateUserDto.location || null;
    }

    if (updateUserDto.bio !== undefined) {
      user.bio = updateUserDto.bio || null;
    }

    if (updateUserDto.websiteUrl !== undefined) {
      user.websiteUrl = updateUserDto.websiteUrl || null;
    }

    if (updateUserDto.githubUrl !== undefined) {
      user.githubUrl = updateUserDto.githubUrl || null;
    }

    if (updateUserDto.linkedinUrl !== undefined) {
      user.linkedinUrl = updateUserDto.linkedinUrl || null;
    }

    if (updateUserDto.isActive !== undefined) {
      user.isActive = Boolean(updateUserDto.isActive);
    }

    return this.usersRepository.save(user);
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.findById(id);
    user.avatarUrl = avatarUrl;
    return this.usersRepository.save(user);
  }

  async setRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return this.usersRepository.save(user);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async rotateSessionVersion(
    userId: string,
    loginIp?: string | null,
    loginUserAgent?: string | null,
  ): Promise<number> {
    const trimmedIp = loginIp ? String(loginIp).slice(0, 64) : null;
    const trimmedUserAgent = loginUserAgent
      ? String(loginUserAgent).slice(0, 512)
      : null;

    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        sessionVersion: () => '"sessionVersion" + 1',
        lastLoginAt: () => 'CURRENT_TIMESTAMP',
        lastLoginIp: trimmedIp,
        lastLoginUserAgent: trimmedUserAgent,
      })
      .where('id = :id', { id: userId })
      .execute();

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'sessionVersion'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.sessionVersion || 0;
  }

  async revokeAllSessions(userId: string): Promise<number> {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ sessionVersion: () => '"sessionVersion" + 1' })
      .where('id = :id', { id: userId })
      .execute();

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'sessionVersion'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.sessionVersion || 0;
  }

  async updatePasswordAndRevokeSessions(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const result = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        password: hashedPassword,
        sessionVersion: () => '"sessionVersion" + 1',
      })
      .where('id = :id', { id: userId })
      .execute();

    if (!result.affected) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findById(userId);
    const userWithPassword = await this.findByEmail(user.email);
    if (!userWithPassword) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const isValid = await this.validatePassword(
      currentPassword,
      userWithPassword.password,
    );
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect.');
    }
    await this.updatePasswordAndRevokeSessions(userId, newPassword);
    return { success: true };
  }

  async setupTwoFactor(userId: string) {
    const user = await this.findById(userId);
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled. Disable it before starting a new setup.',
      );
    }
    if (user.twoFactorSecret) {
      return {
        secret: user.twoFactorSecret,
        otpauthUrl: buildTotpUri({
          issuer: 'Emble',
          accountName: user.email,
          secret: user.twoFactorSecret,
        }),
      };
    }
    const secret = generateTotpSecret();
    user.twoFactorSecret = secret;
    user.isTwoFactorEnabled = false;
    await this.usersRepository.save(user);

    return {
      secret,
      otpauthUrl: buildTotpUri({
        issuer: 'Emble',
        accountName: user.email,
        secret,
      }),
    };
  }

  async verifyTwoFactorCode(userId: string, code: string) {
    const user = await this.findById(userId);
    if (!user.twoFactorSecret) {
      return false;
    }
    return verifyTotpCode(user.twoFactorSecret, code);
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.findById(userId);
    if (!user.twoFactorSecret) {
      throw new BadRequestException('Two-factor setup has not been started.');
    }
    if (!verifyTotpCode(user.twoFactorSecret, code)) {
      throw new BadRequestException('Invalid two-factor code.');
    }
    user.isTwoFactorEnabled = true;
    await this.usersRepository.save(user);
    return { success: true };
  }

  async disableTwoFactor(
    userId: string,
    currentPassword: string,
    code?: string,
  ) {
    const user = await this.findById(userId);
    const userWithPassword = await this.findByEmail(user.email);
    if (!userWithPassword) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const isValid = await this.validatePassword(
      currentPassword,
      userWithPassword.password,
    );
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect.');
    }
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      if (!code) {
        throw new BadRequestException('Two-factor code is required.');
      }
      if (!user.twoFactorSecret || !verifyTotpCode(user.twoFactorSecret, code)) {
        throw new BadRequestException('Invalid two-factor code.');
      }
    }
    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.usersRepository.save(user);
    return { success: true };
  }

  async getDashboardStats(userId: string) {
    const [interviewStats, resume, mentorSessions, gamification] =
      await Promise.all([
        this.interviewsRepository.find({
          where: { userId, status: InterviewStatus.COMPLETED },
          select: ['id', 'overallScore', 'completedAt', 'createdAt'],
          order: { completedAt: 'DESC' },
        }),
        this.resumeRepository.findOne({ where: { userId } }),
        this.mentorSessionsRepository.find({
          where: { studentId: userId },
          select: ['id', 'status', 'createdAt', 'updatedAt'],
        }),
        this.gamificationRepository.findOne({ where: { userId } }),
      ]);

    const problemsSolved = 0;
    const interviewsCompleted = interviewStats.length;
    const projectCompleted = 0;
    const resumeUpdated = !!resume?.updatedAt;

    const streakDays = gamification?.currentStreak ?? 0;

    const skillProficiency = [
      0,
      0,
      0,
      Math.min(100, interviewsCompleted * 10),
      Math.min(100, interviewsCompleted * 8),
      Math.min(100, projectCompleted * 15),
    ];

    const readinessScore = Math.min(
      1000,
      Math.round(
        (interviewsCompleted * 10 +
          projectCompleted * 20 +
          (resumeUpdated ? 50 : 0)) *
          10,
      ),
    );

    const recentActivity: Array<{
      title: string;
      time: string;
      icon: string;
      color: string;
    }> = [];

    const latestInterview = interviewStats[0];
    
    const latestMentor = mentorSessions.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
    )[0];

    if (latestInterview?.completedAt || latestInterview?.createdAt) {
      recentActivity.push({
        title: 'Mock interview completed',
        time: (
          latestInterview.completedAt || latestInterview.createdAt
        ).toISOString(),
        icon: 'chat',
        color: 'text-indigo-500',
      });
    }
    if (resume?.updatedAt) {
      recentActivity.push({
        title: 'Resume updated',
        time: resume.updatedAt.toISOString(),
        icon: 'edit',
        color: 'text-slate-400',
      });
    }
    if (latestMentor?.createdAt) {
      recentActivity.push({
        title: 'Mentor session booked',
        time: latestMentor.createdAt.toISOString(),
        icon: 'group',
        color: 'text-emerald-600',
      });
    }

    return {
      readinessScore,
      problemsSolved,
      interviewsCompleted,
      streakDays,
      skillProficiency,
      recentActivity: recentActivity.slice(0, 5),
    };
  }

  private parseUpgradePlan(plan: string) {
    const normalizedPlan = String(plan || '')
      .trim()
      .toLowerCase();
    if (!SUBSCRIPTION_PLAN_IDENTIFIER.test(normalizedPlan)) {
      throw new BadRequestException('Only pro_1m subscription is available.');
    }

    return {
      normalizedPlan,
      targetPlan: 'pro' as const,
      durationKey: '1m' as const,
      durationDays: 30,
    };
  }

  private normalizeConfigPriceInPaise(value: unknown): number | null {
    const rupees = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      return null;
    }
    return Math.round(rupees * 100);
  }

  private async resolvePlanPriceInPaise(plan: string): Promise<number> {
    const parsed = this.parseUpgradePlan(plan);
    const fallbackPrice =
      DEFAULT_SUBSCRIPTION_PRICES_IN_PAISE[parsed.normalizedPlan];
    const settings = await this.platformSettingsRepository.findOne({
      where: {},
    });
    const configuredValue =
      settings?.subscriptionPrices?.[parsed.targetPlan]?.[parsed.durationKey];
    const configuredPrice = this.normalizeConfigPriceInPaise(configuredValue);
    return configuredPrice || fallbackPrice;
  }

  async getUserCredits(userId: string) {
    const user = await this.findById(userId);
    const plan = user.subscriptionPlan || 'free';

    let maxAudio = 1;
    let maxVideo = 0;
    let maxResume = 0;

    if (plan === 'pro' && user.subscriptionStatus === 'active') {
      maxAudio = 15;
      maxVideo = 3;
      maxResume = 12;
    }

    return {
      plan,
      audioDrills: {
        used: user.audioDrillUsage,
        limit: maxAudio,
        remaining: Math.max(0, maxAudio - user.audioDrillUsage),
      },
      videoSimulations: {
        used: user.videoInterviewUsage,
        limit: maxVideo,
        remaining: Math.max(0, maxVideo - user.videoInterviewUsage),
      },
      resumeScans: {
        used: user.resumeScanUsage,
        limit: maxResume,
        remaining: Math.max(0, maxResume - user.resumeScanUsage),
      },
    };
  }

  async upgradeSubscription(
    id: string,
    plan: string,
    paymentId?: string,
    providerOrderId?: string,
  ): Promise<User> {
    const parsedPlan = this.parseUpgradePlan(plan);
    if (!paymentId || !providerOrderId) {
      throw new BadRequestException(
        'Verified payment details are required to upgrade subscription.',
      );
    }

    const expectedAmountInPaise = await this.resolvePlanPriceInPaise(
      parsedPlan.normalizedPlan,
    );
    const now = new Date();
    const currentMs = now.getTime();

    return this.usersRepository.manager.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const pendingOrdersRepository =
        manager.getRepository(PendingUpgradeOrder);

      const user = await userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const pendingOrder = await pendingOrdersRepository.findOne({
        where: {
          userId: id,
          providerOrderId,
        },
      });

      if (!pendingOrder) {
        throw new BadRequestException(
          'Pending payment order not found. Please create a new order.',
        );
      }

      if (pendingOrder.plan !== parsedPlan.normalizedPlan) {
        throw new BadRequestException('Plan mismatch for payment order.');
      }

      if (pendingOrder.userId !== user.id) {
        throw new BadRequestException(
          'Payment order does not belong to this user.',
        );
      }

      if (pendingOrder.amountInPaise !== expectedAmountInPaise) {
        throw new BadRequestException('Price mismatch for payment order.');
      }

      if (pendingOrder.status === 'paid') {
        const samePayment = pendingOrder.paymentId === paymentId;
        if (samePayment) {
          return user;
        }
        throw new BadRequestException('This order has already been used.');
      }

      if (
        pendingOrder.expiresAt &&
        pendingOrder.expiresAt.getTime() <= currentMs
      ) {
        pendingOrder.status = 'expired';
        await pendingOrdersRepository.save(pendingOrder);
        throw new BadRequestException(
          'This payment order has expired. Please create a new order.',
        );
      }

      pendingOrder.status = 'paid';
      pendingOrder.paymentId = paymentId;
      pendingOrder.paidAt = now;
      await pendingOrdersRepository.save(pendingOrder);

      let newEndDateMs =
        currentMs + parsedPlan.durationDays * 24 * 60 * 60 * 1000;

      const currentPlanTier: 'free' | 'pro' =
        user.subscriptionPlan === 'pro' ? 'pro' : 'free';

      if (
        user.subscriptionStatus === 'active' &&
        currentPlanTier !== 'free' &&
        user.subscriptionEndDate &&
        user.subscriptionEndDate.getTime() > currentMs
      ) {
        if (currentPlanTier === parsedPlan.targetPlan) {
          newEndDateMs =
            user.subscriptionEndDate.getTime() +
            parsedPlan.durationDays * 24 * 60 * 60 * 1000;
        } else {
          const remainingMs = user.subscriptionEndDate.getTime() - currentMs;
          const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
          user.pausedSubscriptionPlan = user.subscriptionPlan;
          user.pausedSubscriptionRemainingDays = remainingDays;
        }
      }

      user.subscriptionPlan = parsedPlan.targetPlan;
      user.subscriptionStatus = 'active';
      user.subscriptionEndDate = new Date(newEndDateMs);
      user.usageLastReset = now;

      return userRepository.save(user);
    });
  }

  async createUpgradeOrder(userId: string, plan: string) {
    const parsedPlan = this.parseUpgradePlan(plan);
    const amountInPaise = await this.resolvePlanPriceInPaise(
      parsedPlan.normalizedPlan,
    );
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay keys are not configured');
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `upgrade_${userId.slice(0, 8)}_${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      },
    );

    const orderId: string | undefined = response?.data?.id;
    if (!orderId) {
      throw new BadRequestException('Unable to create payment order.');
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const pendingOrder = this.pendingUpgradeOrdersRepository.create({
      userId,
      plan: parsedPlan.normalizedPlan,
      amountInPaise,
      currency: 'INR',
      providerOrderId: orderId,
      paymentId: null,
      status: 'created',
      expiresAt,
      paidAt: null,
    });
    await this.pendingUpgradeOrdersRepository.save(pendingOrder);

    return {
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      plan: parsedPlan.normalizedPlan,
    };
  }

  async getMySubscriptionPayments(userId: string, limit = 25) {
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 25));

    const orders = await this.pendingUpgradeOrdersRepository.find({
      where: {
        userId,
        status: 'paid',
      },
      order: {
        paidAt: 'DESC',
        createdAt: 'DESC',
      },
      take: safeLimit,
    });

    return orders.map((order) => ({
      id: order.id,
      plan: order.plan,
      amountInPaise: order.amountInPaise,
      amount: Number((order.amountInPaise / 100).toFixed(2)),
      currency: order.currency,
      paymentId: order.paymentId,
      orderId: order.providerOrderId,
      status: order.status,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    }));
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleSubscriptionExpirations() {
    this.logger.log('Running subscription expiration check...');
    try {
      const now = new Date();
      // Use QueryBuilder to fetch users with active, expired subscriptions
      const expiredUsers = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.subscriptionStatus = :status', { status: 'active' })
        .andWhere('user.subscriptionEndDate <= :now', { now })
        .getMany();

      if (expiredUsers.length === 0) {
        this.logger.log('No expired subscriptions found.');
        return;
      }

      this.logger.log(
        `Found ${expiredUsers.length} expired subscriptions to process.`,
      );

      for (const user of expiredUsers) {
        if (
          user.pausedSubscriptionPlan &&
          user.pausedSubscriptionRemainingDays > 0
        ) {
          // Resume the paused plan
          user.subscriptionPlan = user.pausedSubscriptionPlan;
          user.subscriptionEndDate = new Date(
            now.getTime() +
              user.pausedSubscriptionRemainingDays * 24 * 60 * 60 * 1000,
          );
          user.pausedSubscriptionPlan = null;
          user.pausedSubscriptionRemainingDays = 0;
          this.logger.log(`Resumed paused plan for user ${user.id}`);
        } else {
          // Downgrade to free
          user.subscriptionPlan = 'free';
          user.subscriptionStatus = 'expired';
          this.logger.log(`Downgraded user ${user.id} to free plan`);
        }
        await this.usersRepository.save(user);
      }
      this.logger.log('Subscription expiration check completed successfully.');
    } catch (error) {
      this.logger.error('Error during subscription expiration check', error);
    }
  }
}
