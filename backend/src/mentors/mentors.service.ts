import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentorProfile } from './entities/mentor-profile.entity';
import { MentorApplication } from './entities/mentor-application.entity';
import { MentorSession } from './entities/mentor-session.entity';
import { MentorPayout } from './entities/mentor-payout.entity';
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
        private usersService: UsersService,
    ) {}

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
        await this.usersService.update(user.id, { role: UserRole.MENTOR } as any);

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
        const amountInr = mentor.pricePerMinute * payload.durationMinutes;
        const session = this.sessionRepo.create({
            studentId,
            mentorId: mentor.id,
            topic: payload.topic,
            durationMinutes: payload.durationMinutes,
            priceInr: amountInr,
            status: 'requested',
            paymentId: payload.paymentId,
            paymentStatus: 'paid',
        });
        return this.sessionRepo.save(session);
    }

    async createPaymentOrder(payload: CreateMentorPaymentOrderDto) {
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
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await axios.post('https://api.razorpay.com/v1/orders',
            {
                amount: amountInr * 100,
                currency: 'INR',
                receipt: `mentor_${Date.now()}`,
            },
            {
                headers: {
                    Authorization: `Basic ${authHeader}`,
                },
            },
        );
        return {
            orderId: response.data.id,
            amountInr,
            currency: response.data.currency,
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
        const mentors = mentorIds.length ? await this.mentorRepo.findBy({ id: mentorIds as any }) : [];
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
        const mentors = mentorIds.length ? await this.mentorRepo.findBy({ id: mentorIds as any }) : [];
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
