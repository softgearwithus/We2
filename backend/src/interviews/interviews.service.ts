import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    InterviewSession,
    InterviewStatus,
} from './entities/interview-session.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
    constructor(
        @InjectRepository(InterviewSession)
        private interviewsRepo: Repository<InterviewSession>,
    ) { }

    async create(dto: CreateInterviewDto): Promise<InterviewSession> {
        const interview = this.interviewsRepo.create({
            ...dto,
            status: InterviewStatus.SCHEDULED,
            aiInterviewerId: 'Gemini Pro',
        });
        return this.interviewsRepo.save(interview);
    }

    /**
     * Get all interview sessions for a user
     */
    async findByUser(userId: string): Promise<InterviewSession[]> {
        return this.interviewsRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Get a single interview session
     */
    async findOne(id: string, userId: string): Promise<InterviewSession> {
        const interview = await this.interviewsRepo.findOne({ where: { id } });
        if (!interview) {
            throw new NotFoundException(`Interview session ${id} not found`);
        }

        // Verify ownership
        if (interview.userId !== userId) {
            throw new ForbiddenException('Access denied to this interview session');
        }

        return interview;
    }

    /**
     * Update interview session (used by AI to update scores)
     */
    async update(
        id: string,
        userId: string,
        dto: UpdateInterviewDto,
    ): Promise<InterviewSession> {
        const interview = await this.findOne(id, userId);

        if (interview.status === InterviewStatus.COMPLETED) {
            throw new BadRequestException('Cannot update completed interview');
        }

        Object.assign(interview, dto);

        // Auto-set completion timestamp
        if (dto.status === InterviewStatus.COMPLETED) {
            interview.completedAt = new Date();
        }

        return this.interviewsRepo.save(interview);
    }

    /**
     * Start an interview session
     */
    async start(id: string, userId: string): Promise<InterviewSession> {
        const interview = await this.findOne(id, userId);

        if (interview.status !== InterviewStatus.SCHEDULED) {
            throw new BadRequestException('Interview already started or completed');
        }

        interview.status = InterviewStatus.IN_PROGRESS;
        interview.startedAt = new Date();

        return this.interviewsRepo.save(interview);
    }

    /**
     * Get interview statistics for a user
     */
    async getStats(userId: string) {
        const interviews = await this.findByUser(userId);

        const completed = interviews.filter(
            (i) => i.status === InterviewStatus.COMPLETED,
        );

        return {
            total: interviews.length,
            completed: completed.length,
            inProgress: interviews.filter(
                (i) => i.status === InterviewStatus.IN_PROGRESS,
            ).length,
            averageScore:
                completed.length > 0
                    ? Math.round(
                        (completed.reduce((sum, i) => sum + (i.overallScore || 0), 0) /
                            completed.length) *
                        10,
                    ) / 10
                    : 0,
            byType: this.groupByType(completed),
        };
    }

    private groupByType(interviews: InterviewSession[]) {
        const result: Record<string, { count: number; avgScore: number }> = {};

        for (const interview of interviews) {
            if (!result[interview.type]) {
                result[interview.type] = { count: 0, avgScore: 0 };
            }
            result[interview.type].count++;
            result[interview.type].avgScore += interview.overallScore || 0;
        }

        // Calculate averages
        Object.keys(result).forEach((type) => {
            result[type].avgScore =
                Math.round((result[type].avgScore / result[type].count) * 10) / 10;
        });

        return result;
    }

    /**
     * Admin: Get all interviews
     */
    async findAll(): Promise<InterviewSession[]> {
        return this.interviewsRepo.find({
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }
}
