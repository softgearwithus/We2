import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Submission, SubmissionStatus } from '../dsa/entities/submission.entity';
import { SqlSubmission, SqlSubmissionStatus } from '../sql/entities/sql-submission.entity';
import { InterviewSession, InterviewStatus } from '../interviews/entities/interview-session.entity';
import { ProjectLabSubmission, ProjectLabSubmissionStatus } from '../project-labs/entities/project-lab-submission.entity';
import { Resume } from '../resume/entities/resume.entity';
import { MentorSession } from '../mentors/entities/mentor-session.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Submission)
        private dsaSubmissionsRepository: Repository<Submission>,
        @InjectRepository(SqlSubmission)
        private sqlSubmissionsRepository: Repository<SqlSubmission>,
        @InjectRepository(InterviewSession)
        private interviewsRepository: Repository<InterviewSession>,
        @InjectRepository(ProjectLabSubmission)
        private projectLabSubmissionsRepository: Repository<ProjectLabSubmission>,
        @InjectRepository(Resume)
        private resumeRepository: Repository<Resume>,
        @InjectRepository(MentorSession)
        private mentorSessionsRepository: Repository<MentorSession>,
        @InjectRepository(UserGamification)
        private gamificationRepository: Repository<UserGamification>,
    ) { }

    async create(
        email: string,
        password: string,
        role?: string,
        subscriptionPlan?: string,
        firstName?: string,
        lastName?: string,
        timezone?: string,
    ): Promise<User> {
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            throw new ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        let initialStatus = 'inactive';
        let endDate: Date | null = null;

        if (subscriptionPlan && subscriptionPlan !== 'free') {
            initialStatus = 'active';
            endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        }

        const user = this.usersRepository.create({
            email: normalizedEmail,
            password: hashedPassword,
            role: role as any || 'student',
            subscriptionPlan: subscriptionPlan || 'free',
            subscriptionStatus: initialStatus,
            subscriptionEndDate: endDate as Date,
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            timezone: timezone || null,
            isActive: true,
        });
        return this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const normalizedEmail = email.toLowerCase().trim();
        return this.usersRepository.findOne({
            where: { email: normalizedEmail },
            select: [
                'id',
                'email',
                'password',
                'role',
                'isActive',
                'isTwoFactorEnabled',
                'subscriptionPlan',
                'subscriptionStatus',
                'subscriptionEndDate',
                'firstName',
                'lastName',
                'timezone',
                'avatarUrl',
            ],
        });
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
                'subscriptionPlan',
                'subscriptionStatus',
                'subscriptionEndDate',
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

    async findAll(): Promise<User[]> {
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

        if ((updateUserDto as any).role) {
            user.role = (updateUserDto as any).role as any;
        }

        if ((updateUserDto as any).timezone !== undefined) {
            user.timezone = (updateUserDto as any).timezone || null;
        }

        if ((updateUserDto as any).avatarUrl !== undefined) {
            user.avatarUrl = (updateUserDto as any).avatarUrl || null;
        }

        if ((updateUserDto as any).username !== undefined) {
            user.username = (updateUserDto as any).username || null;
        }

        if ((updateUserDto as any).roleTitle !== undefined) {
            user.roleTitle = (updateUserDto as any).roleTitle || null;
        }

        if ((updateUserDto as any).location !== undefined) {
            user.location = (updateUserDto as any).location || null;
        }

        if ((updateUserDto as any).bio !== undefined) {
            user.bio = (updateUserDto as any).bio || null;
        }

        if ((updateUserDto as any).websiteUrl !== undefined) {
            user.websiteUrl = (updateUserDto as any).websiteUrl || null;
        }

        if ((updateUserDto as any).githubUrl !== undefined) {
            user.githubUrl = (updateUserDto as any).githubUrl || null;
        }

        if ((updateUserDto as any).linkedinUrl !== undefined) {
            user.linkedinUrl = (updateUserDto as any).linkedinUrl || null;
        }

        if ((updateUserDto as any).isTwoFactorEnabled !== undefined) {
            user.isTwoFactorEnabled = Boolean((updateUserDto as any).isTwoFactorEnabled);
        }

        if ((updateUserDto as any).isActive !== undefined) {
            user.isActive = Boolean((updateUserDto as any).isActive);
        }

        return this.usersRepository.save(user);
    }

    async validatePassword(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    async getDashboardStats(userId: string) {
        const [dsaStats, sqlStats, interviewStats, projectStats, resume, mentorSessions, gamification] = await Promise.all([
            this.dsaSubmissionsRepository.find({
                where: { userId, status: SubmissionStatus.ACCEPTED },
                select: ['problemId', 'submittedAt'],
            }),
            this.sqlSubmissionsRepository.find({
                where: { userId, status: SqlSubmissionStatus.ACCEPTED },
                select: ['problemId', 'submittedAt'],
            }),
            this.interviewsRepository.find({
                where: { userId, status: InterviewStatus.COMPLETED },
                select: ['id', 'overallScore', 'completedAt', 'createdAt'],
                order: { completedAt: 'DESC' },
            }),
            this.projectLabSubmissionsRepository.find({
                where: { userId },
                select: ['projectId', 'status', 'submittedAt', 'reviewedAt', 'completedAt'],
            }),
            this.resumeRepository.findOne({ where: { userId } }),
            this.mentorSessionsRepository.find({
                where: { studentId: userId },
                select: ['id', 'status', 'createdAt', 'updatedAt'],
            }),
            this.gamificationRepository.findOne({ where: { userId } }),
        ]);

        const uniqueDsaSolved = new Set(dsaStats.map((s) => s.problemId)).size;
        const uniqueSqlSolved = new Set(sqlStats.map((s) => s.problemId)).size;
        const problemsSolved = uniqueDsaSolved + uniqueSqlSolved;
        const interviewsCompleted = interviewStats.length;
        const projectCompleted = projectStats.filter((s) =>
            [ProjectLabSubmissionStatus.APPROVED, ProjectLabSubmissionStatus.COMPLETED].includes(s.status),
        ).length;
        const resumeUpdated = !!resume?.updatedAt;

        const streakDays = gamification?.currentStreak ?? 0;

        const skillProficiency = [
            Math.min(100, uniqueDsaSolved * 2),
            Math.min(100, uniqueSqlSolved * 2),
            Math.min(100, Math.round((problemsSolved / 5) * 10)),
            Math.min(100, interviewsCompleted * 10),
            Math.min(100, interviewsCompleted * 8),
            Math.min(100, projectCompleted * 15),
        ];

        const readinessScore = Math.min(
            1000,
            Math.round(
                (uniqueDsaSolved * 2 + uniqueSqlSolved * 2 + interviewsCompleted * 10 + projectCompleted * 20 + (resumeUpdated ? 50 : 0))
                * 10,
            ),
        );

        const recentActivity: Array<{ title: string; time: string; icon: string; color: string }> = [];

        const latestDsa = dsaStats.sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))[0];
        const latestSql = sqlStats.sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))[0];
        const latestInterview = interviewStats[0];
        const latestProject = projectStats.sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))[0];
        const latestMentor = mentorSessions.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))[0];

        if (latestDsa?.submittedAt) {
            recentActivity.push({
                title: 'Solved a DSA problem',
                time: latestDsa.submittedAt.toISOString(),
                icon: 'check_circle',
                color: 'text-emerald-500',
            });
        }
        if (latestSql?.submittedAt) {
            recentActivity.push({
                title: 'Solved a SQL problem',
                time: latestSql.submittedAt.toISOString(),
                icon: 'database',
                color: 'text-sky-500',
            });
        }
        if (latestInterview?.completedAt || latestInterview?.createdAt) {
            recentActivity.push({
                title: 'Mock interview completed',
                time: (latestInterview.completedAt || latestInterview.createdAt).toISOString(),
                icon: 'chat',
                color: 'text-indigo-500',
            });
        }
        if (latestProject?.submittedAt) {
            recentActivity.push({
                title: 'Project lab submission',
                time: latestProject.submittedAt.toISOString(),
                icon: 'rocket_launch',
                color: 'text-orange-500',
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

    async upgradeSubscription(id: string, plan: string): Promise<User> {
        throw new ForbiddenException('Upgrades are temporarily disabled');
    }
}
