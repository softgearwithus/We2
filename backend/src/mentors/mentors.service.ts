import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MentorProfile } from './entities/mentor-profile.entity';
import { MentorApplication } from './entities/mentor-application.entity';
import { MentorSession } from './entities/mentor-session.entity';
import { MentorPayout } from './entities/mentor-payout.entity';
import { MentorPaymentOrder } from './entities/mentor-payment-order.entity';
import { CreateMentorApplicationDto } from './dto/create-mentor-application.dto';
import { CreateMentorPaymentOrderDto, VerifyMentorPaymentDto } from './dto/mentor-payment.dto';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Injectable()
export class MentorsService {
    constructor(
        @InjectRepository(MentorProfile)
        private mentorRepo: Repository<MentorProfile>,
        @InjectRepository(MentorApplication)
        private applicationRepo: Repository<MentorApplication>,
        @InjectRepository(MentorSession)
        private sessionRepo: Repository<MentorSession>,
        @InjectRepository(MentorPayout)
        private payoutRepo: Repository<MentorPayout>,
        @InjectRepository(MentorPaymentOrder)
        private mentorPaymentOrderRepo: Repository<MentorPaymentOrder>,
        private usersService: UsersService,
    ) { }

    async listMentors() {
        return this.mentorRepo.find({ where: { isActive: true }, order: { updatedAt: 'DESC' } });
    }

    async listApplications() {
        return this.applicationRepo.find({ order: { createdAt: 'DESC' } });
    }

    async createApplication(payload: CreateMentorApplicationDto) {
        const application = this.applicationRepo.create({
            name: payload.name,
            email: payload.email.toLowerCase().trim(),
            phone: payload.phone,
            headline: payload.headline || null,
            bio: payload.bio || null,
            feePerMinuteInr: payload.feePerMinuteInr,
            expertise: payload.expertise || null,
            offerings: payload.offerings || null,
            linkedin: payload.linkedin || null,
            totalExperience: payload.totalExperience || null,
            status: 'Pending',
        });
        return this.applicationRepo.save(application);
    }

    async approveApplication(applicationId: string) {
        const application = await this.applicationRepo.findOne({ where: { id: applicationId } });
        if (!application) throw new NotFoundException('Application not found');

        const user = await this.usersService.findByEmail(application.email);
        if (!user) {
            throw new NotFoundException('User account not found for this application email');
        }
        await this.usersService.setRole(user.id, UserRole.MENTOR);

        const profile = this.mentorRepo.create({
            userId: user.id,
            name: application.name,
            headline: application.headline || null,
            companies: application.offerings || null,
            experience: application.totalExperience || null,
            about: application.bio || null,
            pricePerMinute: application.feePerMinuteInr,
            tags: application.expertise ? application.expertise.split(',').map((t) => t.trim()).filter(Boolean) : [],
            avatarUrl: null,
            rating: 0,
            sessionsCount: 0,
            isActive: true,
        });

        application.status = 'Approved';
        await this.applicationRepo.save(application);
        return this.mentorRepo.save(profile);
    }

    async rejectApplication(applicationId: string) {
        const application = await this.applicationRepo.findOne({ where: { id: applicationId } });
        if (!application) throw new NotFoundException('Application not found');
        application.status = 'Rejected';
        return this.applicationRepo.save(application);
    }

    async setMentorStatus(mentorId: string, isActive: boolean) {
        const mentor = await this.mentorRepo.findOne({ where: { id: mentorId } });
        if (!mentor) throw new NotFoundException('Mentor not found');
        mentor.isActive = isActive;
        return this.mentorRepo.save(mentor);
    }

    async createSessionFromPayment(studentId: string, payload: VerifyMentorPaymentDto) {
        const mentor = await this.mentorRepo.findOne({ where: { id: payload.mentorId, isActive: true } });
        if (!mentor) throw new NotFoundException('Mentor not found');

        const now = Date.now();
        const expectedAmountInPaise = mentor.pricePerMinute * payload.durationMinutes * 100;

        return this.sessionRepo.manager.transaction(async (manager) => {
            const paymentOrderRepo = manager.getRepository(MentorPaymentOrder);
            const mentorSessionRepo = manager.getRepository(MentorSession);

            const order = await paymentOrderRepo.findOne({
                where: {
                    providerOrderId: payload.orderId,
                    studentId,
                    mentorId: mentor.id,
                },
            });

            if (!order) {
                throw new BadRequestException('Payment order not found. Please create a new order.');
            }

            if (order.durationMinutes !== payload.durationMinutes) {
                throw new BadRequestException('Duration mismatch for payment order.');
            }

            if (order.studentId !== studentId || order.mentorId !== mentor.id) {
                throw new BadRequestException('Payment order does not belong to this booking request.');
            }

            if (order.amountInPaise !== expectedAmountInPaise) {
                throw new BadRequestException('Amount mismatch for payment order.');
            }

            if (order.status === 'paid') {
                const existingSession = await mentorSessionRepo.findOne({
                    where: {
                        paymentOrderId: payload.orderId,
                        paymentId: payload.paymentId,
                    },
                });
                if (existingSession) {
                    return existingSession;
                }
                throw new BadRequestException('This payment order has already been used.');
            }

            if (order.expiresAt && order.expiresAt.getTime() <= now) {
                order.status = 'expired';
                await paymentOrderRepo.save(order);
                throw new BadRequestException('This payment order has expired. Please create a new order.');
            }

            order.status = 'paid';
            order.paymentId = payload.paymentId;
            order.paidAt = new Date(now);
            await paymentOrderRepo.save(order);

            const amountInr = Math.round(order.amountInPaise / 100);
            const session = mentorSessionRepo.create({
                studentId,
                mentorId: mentor.id,
                topic: payload.topic,
                durationMinutes: payload.durationMinutes,
                priceInr: amountInr,
                status: 'requested',
                paymentId: payload.paymentId,
                paymentOrderId: payload.orderId,
                paymentStatus: 'paid',
            });
            return mentorSessionRepo.save(session);
        });
    }

    async createPaymentOrder(studentId: string, payload: CreateMentorPaymentOrderDto) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            throw new Error('Razorpay keys are not configured');
        }
        if (!payload.mentorId) {
            throw new NotFoundException('Mentor is required for payment');
        }
        const mentor = await this.mentorRepo.findOne({ where: { id: payload.mentorId, isActive: true } });
        if (!mentor) throw new NotFoundException('Mentor not found');
        const amountInr = mentor.pricePerMinute * payload.durationMinutes;
        const amountInPaise = amountInr * 100;
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await axios.post('https://api.razorpay.com/v1/orders',
            {
                amount: amountInPaise,
                currency: 'INR',
                receipt: `mentor_${Date.now()}`,
            },
            {
                headers: {
                    Authorization: `Basic ${authHeader}`,
                },
            },
        );

        const providerOrderId: string | undefined = response?.data?.id;
        if (!providerOrderId) {
            throw new BadRequestException('Unable to create payment order.');
        }

        const order = this.mentorPaymentOrderRepo.create({
            studentId,
            mentorId: mentor.id,
            durationMinutes: payload.durationMinutes,
            amountInPaise,
            currency: 'INR',
            providerOrderId,
            paymentId: null,
            status: 'created',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            paidAt: null,
        });
        await this.mentorPaymentOrderRepo.save(order);

        return {
            orderId: providerOrderId,
            amountInr,
            amountInPaise,
            currency: 'INR',
        };
    }

    async listAllMentors() {
        const mentors = await this.mentorRepo.find({ order: { updatedAt: 'DESC' } });
        if (mentors.length === 0) return [];
        const userIds = mentors.map((m) => m.userId).filter(Boolean);
        const users = await this.usersService.findByIds(userIds);
        const userMap = new Map(users.map((u) => [u.id, u]));
        return mentors.map((mentor) => {
            const user = userMap.get(mentor.userId);
            return {
                ...mentor,
                userEmail: user?.email || null,
            };
        });
    }

    async listAllSessions() {
        const sessions = await this.sessionRepo.find({ order: { createdAt: 'DESC' } });
        if (sessions.length === 0) return [];
        const mentorIds = Array.from(new Set(sessions.map((s) => s.mentorId)));
        const studentIds = Array.from(new Set(sessions.map((s) => s.studentId)));
        const mentors = mentorIds.length ? await this.mentorRepo.findBy({ id: In(mentorIds) }) : [];
        const users = studentIds.length ? await this.usersService.findByIds(studentIds) : [];
        const mentorMap = new Map(mentors.map((m) => [m.id, m]));
        const userMap = new Map(users.map((u) => [u.id, u]));
        return sessions.map((session) => {
            const mentor = mentorMap.get(session.mentorId);
            const user = userMap.get(session.studentId);
            return {
                ...session,
                mentorName: mentor?.name || null,
                mentorUserId: mentor?.userId || null,
                studentName: user?.email?.split('@')[0] || null,
            };
        });
    }

    async listAllPayouts() {
        const payouts = await this.payoutRepo.find({ order: { createdAt: 'DESC' } });
        if (payouts.length === 0) return [];
        const mentorIds = Array.from(new Set(payouts.map((p) => p.mentorId)));
        const mentors = mentorIds.length ? await this.mentorRepo.findBy({ id: In(mentorIds) }) : [];
        const mentorMap = new Map(mentors.map((m) => [m.id, m]));
        return payouts.map((payout) => {
            const mentor = mentorMap.get(payout.mentorId);
            return {
                ...payout,
                mentorName: mentor?.name || null,
                mentorUserId: mentor?.userId || null,
            };
        });
    }

    async listStudentSessions(studentId: string) {
        const sessions = await this.sessionRepo.find({ where: { studentId }, order: { createdAt: 'DESC' } });
        const mentors = await this.mentorRepo.find();
        return sessions.map((session) => {
            const mentor = mentors.find((m) => m.id === session.mentorId);
            return {
                ...session,
                mentorName: mentor?.name || 'Mentor',
                avatarUrl: mentor?.avatarUrl || null,
            };
        });
    }

    async listMentorRequests(mentorUserId: string) {
        const mentorProfile = await this.mentorRepo.findOne({ where: { userId: mentorUserId } });
        if (!mentorProfile) throw new NotFoundException('Mentor profile not found');
        return this.sessionRepo.find({ where: { mentorId: mentorProfile.id, status: 'requested' }, order: { createdAt: 'DESC' } });
    }

    async acceptRequest(mentorUserId: string, sessionId: string, meetingLink: string) {
        const mentorProfile = await this.mentorRepo.findOne({ where: { userId: mentorUserId } });
        if (!mentorProfile) throw new NotFoundException('Mentor profile not found');
        const session = await this.sessionRepo.findOne({ where: { id: sessionId, mentorId: mentorProfile.id } });
        if (!session) throw new NotFoundException('Session not found');
        session.status = 'accepted';
        session.meetingLink = meetingLink;
        return this.sessionRepo.save(session);
    }

    async declineRequest(mentorUserId: string, sessionId: string) {
        const mentorProfile = await this.mentorRepo.findOne({ where: { userId: mentorUserId } });
        if (!mentorProfile) throw new NotFoundException('Mentor profile not found');
        const session = await this.sessionRepo.findOne({ where: { id: sessionId, mentorId: mentorProfile.id } });
        if (!session) throw new NotFoundException('Session not found');
        session.status = 'declined';
        session.paymentStatus = 'refunded';
        return this.sessionRepo.save(session);
    }

    async listMentorSessions(mentorUserId: string) {
        const mentorProfile = await this.mentorRepo.findOne({ where: { userId: mentorUserId } });
        if (!mentorProfile) throw new NotFoundException('Mentor profile not found');
        return this.sessionRepo.find({ where: { mentorId: mentorProfile.id }, order: { createdAt: 'DESC' } });
    }

    async listMentorPayouts(mentorUserId: string) {
        const mentorProfile = await this.mentorRepo.findOne({ where: { userId: mentorUserId } });
        if (!mentorProfile) throw new NotFoundException('Mentor profile not found');
        return this.payoutRepo.find({ where: { mentorId: mentorProfile.id }, order: { createdAt: 'DESC' } });
    }

    async recordPayout(mentorId: string, amountInr: number, referenceId: string) {
        const payout = this.payoutRepo.create({
            mentorId,
            amountInr,
            referenceId,
            status: 'Paid',
            paidAt: new Date(),
        });
        return this.payoutRepo.save(payout);
    }
}
