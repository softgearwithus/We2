import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
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
        const user = await this.usersRepository.findOne({
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

        if (!user) return null;

        // --- Exact Millisecond Expiration & Unpausing Logic ---
        if (
            user.subscriptionStatus === 'active' &&
            user.subscriptionEndDate &&
            user.subscriptionEndDate.getTime() <= Date.now()
        ) {
            if (user.pausedSubscriptionPlan && user.pausedSubscriptionRemainingDays > 0) {
                // Resume the paused plan
                user.subscriptionPlan = user.pausedSubscriptionPlan;
                user.subscriptionEndDate = new Date(Date.now() + (user.pausedSubscriptionRemainingDays * 24 * 60 * 60 * 1000));

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

        // --- Exact Millisecond Expiration & Unpausing Logic ---
        if (
            user.subscriptionStatus === 'active' &&
            user.subscriptionEndDate &&
            user.subscriptionEndDate.getTime() <= Date.now()
        ) {
            if (user.pausedSubscriptionPlan && user.pausedSubscriptionRemainingDays > 0) {
                // Resume the paused plan
                user.subscriptionPlan = user.pausedSubscriptionPlan;
                user.subscriptionEndDate = new Date(Date.now() + (user.pausedSubscriptionRemainingDays * 24 * 60 * 60 * 1000));

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

    async findByIds(ids: string[]): Promise<User[]> {
        if (!ids.length) return [];
        return this.usersRepository.findBy({ id: In(ids) });
    }

    async findAll(role?: string): Promise<User[]> {
        if (role) {
            return this.usersRepository.find({ where: { role: role as any } });
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

    async getUserCredits(userId: string) {
        const user = await this.findById(userId);
        const plan = user.subscriptionPlan || 'free';

        let maxAudio = 1;
        let maxVideo = 0;
        let maxResume = 0;

        if (plan === 'standard' || plan === 'placement_plus' || plan.includes('standard')) {
            maxAudio = 5;
            maxVideo = 1;
            maxResume = 5;
        } else if (plan === 'pro' || plan === 'we2_max' || plan.includes('pro')) {
            maxAudio = 15;
            maxVideo = 3;
            maxResume = 12;
        }

        return {
            plan,
            audioDrills: {
                used: user.audioDrillUsage,
                limit: maxAudio,
                remaining: Math.max(0, maxAudio - user.audioDrillUsage)
            },
            videoSimulations: {
                used: user.videoInterviewUsage,
                limit: maxVideo,
                remaining: Math.max(0, maxVideo - user.videoInterviewUsage)
            },
            resumeScans: {
                used: user.resumeScanUsage,
                limit: maxResume,
                remaining: Math.max(0, maxResume - user.resumeScanUsage)
            }
        };
    }

    async upgradeSubscription(id: string, plan: string, paymentId?: string): Promise<User> {
        const user = await this.findById(id);

        let targetPlan = 'free';
        let durationDays = 0;

        // Map frontend plan IDs to backend enum values and durations
        if (plan.includes('standard')) {
            targetPlan = 'standard';
        } else if (plan.includes('pro')) {
            targetPlan = 'pro';
        }

        if (plan.includes('_12m')) durationDays = 365;
        else if (plan.includes('_1m')) durationDays = 30;
        else if (plan.includes('_3m')) durationDays = 90;
        else if (plan.includes('_6m')) durationDays = 180;

        if (targetPlan === 'free' || durationDays === 0) {
            throw new BadRequestException('Invalid subscription plan selected.');
        }

        const now = new Date();
        const currentMs = now.getTime();

        let newEndDateMs = currentMs + (durationDays * 24 * 60 * 60 * 1000);

        // Check if user has an active, non-expired plan
        if (
            user.subscriptionStatus === 'active' &&
            user.subscriptionPlan !== 'free' &&
            user.subscriptionEndDate &&
            user.subscriptionEndDate.getTime() > currentMs
        ) {
            if (user.subscriptionPlan === targetPlan) {
                // Extending the same plan: just add time to the existing end date
                newEndDateMs = user.subscriptionEndDate.getTime() + (durationDays * 24 * 60 * 60 * 1000);
            } else {
                // Switching to a different plan: pause the current active plan
                const remainingMs = user.subscriptionEndDate.getTime() - currentMs;
                const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

                // If they already have a paused plan, we should decide what to do. 
                // For now, we overwrite the paused plan with the Active plan being paused.
                user.pausedSubscriptionPlan = user.subscriptionPlan;
                user.pausedSubscriptionRemainingDays = remainingDays;

                // End date is calculated from NOW since it's a new tier
            }
        }

        user.subscriptionPlan = targetPlan;
        user.subscriptionStatus = 'active';
        user.subscriptionEndDate = new Date(newEndDateMs);
        user.usageLastReset = now;

        // Optionally store the paymentId in a transactions table or notes if needed.

        return this.usersRepository.save(user);
    }

    async createUpgradeOrder(userId: string, amountInPaise: number) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            throw new Error('Razorpay keys are not configured');
        }

        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await axios.post('https://api.razorpay.com/v1/orders',
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
        return {
            orderId: response.data.id,
            amount: response.data.amount,
            currency: response.data.currency,
        };
    }
}
