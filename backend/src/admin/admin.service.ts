import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from '../colleges/entities/college.entity';
import { CollegeStaff } from '../colleges/entities/college-staff.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { User, UserRole } from '../users/user.entity';
import { Submission } from '../dsa/entities/submission.entity';
import { SqlSubmission } from '../sql/entities/sql-submission.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { ProjectLabSubmission } from '../project-labs/entities/project-lab-submission.entity';
import { Placement } from '../placements/entities/placement.entity';
import { Application } from '../applications/entities/application.entity';

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
        @InjectRepository(Submission)
        private dsaSubmissionsRepo: Repository<Submission>,
        @InjectRepository(SqlSubmission)
        private sqlSubmissionsRepo: Repository<SqlSubmission>,
        @InjectRepository(InterviewSession)
        private interviewSessionsRepo: Repository<InterviewSession>,
        @InjectRepository(ProjectLabSubmission)
        private projectLabSubmissionsRepo: Repository<ProjectLabSubmission>,
        @InjectRepository(Placement)
        private placementsRepo: Repository<Placement>,
        @InjectRepository(Application)
        private applicationsRepo: Repository<Application>,
    ) { }

    async getOverview() {
        const totalColleges = await this.collegesRepo.count();
        const totalStudents = await this.collegesRepo
            .createQueryBuilder('college')
            .select('COALESCE(SUM(college.studentCount), 0)', 'total')
            .getRawOne();
        const recentLogs = await this.logRepo.find({ order: { createdAt: 'DESC' }, take: 5 });
        const recentSignups = await this.staffRepo.find({ order: { createdAt: 'DESC' }, take: 5 });

        const activePartners = await this.collegesRepo.count({ where: { status: 'Active' } });

        const totalDrives = await this.placementsRepo.count();
        const totalApplications = await this.applicationsRepo.count();

        return {
            totalColleges,
            totalStudents: Number(totalStudents?.total || 0),
            partners: activePartners,
            totalDrives,
            totalApplications,
            uptime: `${Math.floor(process.uptime() / 3600)}h`,
            recentLogs,
            recentSignups,
        };
    }

    async getAnalytics(range?: string) {
        const now = Date.now();
        const windowMs = range === '24h' ? 24 * 60 * 60 * 1000 : range === '30d' ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
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

        const dsaCount = await this.dsaSubmissionsRepo
            .createQueryBuilder('submission')
            .where('submission.submittedAt >= :since', { since })
            .getCount();
        const sqlCount = await this.sqlSubmissionsRepo
            .createQueryBuilder('submission')
            .where('submission.submittedAt >= :since', { since })
            .getCount();
        const interviewCount = await this.interviewSessionsRepo
            .createQueryBuilder('session')
            .where('session.createdAt >= :since', { since })
            .getCount();
        const projectCount = await this.projectLabSubmissionsRepo
            .createQueryBuilder('submission')
            .where('submission.submittedAt >= :since', { since })
            .getCount();

        const totalEngagement = dsaCount + sqlCount + interviewCount + projectCount || 1;
        const percent = (count: number) => Math.round((count / totalEngagement) * 100);

        return {
            visitors,
            subscribers,
            activeNow,
            funnels: [
                { stage: 'Registered', count: String(visitors), percentage: 100 },
                { stage: 'Started Training', count: String(dsaCount + sqlCount), percentage: percent(dsaCount + sqlCount) },
                { stage: 'Submitted Project', count: String(projectCount), percentage: percent(projectCount) },
                { stage: 'Subscribed', count: String(subscribers), percentage: percent(subscribers) },
            ],
            featureEngagement: [
                { name: 'DSA Training', time: `${dsaCount} submissions`, percentage: percent(dsaCount), color: 'bg-blue-500' },
                { name: 'SQL Training', time: `${sqlCount} submissions`, percentage: percent(sqlCount), color: 'bg-emerald-500' },
                { name: 'Mock Interviews', time: `${interviewCount} sessions`, percentage: percent(interviewCount), color: 'bg-rose-500' },
                { name: 'Project Labs', time: `${projectCount} submissions`, percentage: percent(projectCount), color: 'bg-amber-500' },
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
        return this.logRepo.save(log);
    }

    async getStudents() {
        const students = await this.usersRepo.find({
            where: { role: UserRole.STUDENT },
            order: { createdAt: 'DESC' },
        });
        const colleges = await this.collegesRepo.find();
        const collegeMap = new Map(colleges.map((c) => [c.id, c.name]));

        const premiumUsers = students.filter((s) => s.subscriptionPlan !== 'free' && s.subscriptionStatus === 'active').length;
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const newThisWeek = students.filter((s) => s.createdAt && new Date(s.createdAt).getTime() >= weekAgo).length;

        return {
            totalStudents: students.length,
            premiumUsers,
            newThisWeek,
            students: students.map((s) => ({
                id: s.id,
                name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email,
                email: s.email,
                mobile: '',
                college: s.collegeId ? collegeMap.get(s.collegeId) || 'Unknown' : 'Independent Learner',
                subscription: s.subscriptionPlan,
                joinedAt: s.createdAt,
                status: s.isActive ? 'active' : 'disabled',
                avatarBase: s.firstName || s.email?.split('@')[0] || 'Student',
            })),
        };
    }

    async disableStudent(id: string) {
        const student = await this.usersRepo.findOne({ where: { id, role: UserRole.STUDENT } });
        if (!student) {
            return { success: false };
        }
        student.isActive = false;
        await this.usersRepo.save(student);
        return { success: true };
    }

    async deleteStudent(id: string) {
        const student = await this.usersRepo.findOne({ where: { id, role: UserRole.STUDENT } });
        if (!student) {
            return { success: false };
        }
        await this.usersRepo.remove(student);
        return { success: true };
    }
}
