import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DsaProblem, Difficulty } from './entities/dsa-problem.entity';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { CreateDsaProblemDto } from './dto/create-dsa-problem.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class DsaService {
    constructor(
        @InjectRepository(DsaProblem)
        private problemsRepository: Repository<DsaProblem>,
        @InjectRepository(Submission)
        private submissionsRepository: Repository<Submission>,
    ) { }

    // ── Problem Management ────────────────────────────────

    async createProblem(dto: CreateDsaProblemDto): Promise<DsaProblem> {
        const problem = this.problemsRepository.create(dto);
        return this.problemsRepository.save(problem);
    }

    async getAllProblems(difficulty?: Difficulty): Promise<DsaProblem[]> {
        const query = this.problemsRepository
            .createQueryBuilder('problem')
            .where('problem.isActive = :isActive', { isActive: true })
            .orderBy('problem.createdAt', 'ASC');

        if (difficulty) {
            query.andWhere('problem.difficulty = :difficulty', { difficulty });
        }

        return query.getMany();
    }

    async getProblemBySlug(slug: string): Promise<DsaProblem> {
        const problem = await this.problemsRepository.findOne({
            where: { slug, isActive: true },
        });

        if (!problem) {
            throw new NotFoundException(`Problem with slug ${slug} not found`);
        }

        return problem;
    }

    async getProblemById(id: string): Promise<DsaProblem> {
        const problem = await this.problemsRepository.findOne({
            where: { id, isActive: true },
        });

        if (!problem) {
            throw new NotFoundException(`Problem with ID ${id} not found`);
        }

        return problem;
    }

    // ── Submission Management ────────────────────────────

    async createSubmission(
        userId: string,
        dto: CreateSubmissionDto,
    ): Promise<Submission> {
        // Update problem statistics
        const problem = await this.getProblemById(dto.problemId);
        problem.submissions += 1;
        if (dto.status === SubmissionStatus.ACCEPTED) {
            problem.accepted += 1;
        }
        await this.problemsRepository.save(problem);

        const submission = this.submissionsRepository.create({
            ...dto,
            userId,
        });

        return this.submissionsRepository.save(submission);
    }

    async getUserSubmissions(userId: string): Promise<Submission[]> {
        return this.submissionsRepository.find({
            where: { userId },
            relations: ['problem'],
            order: { submittedAt: 'DESC' },
            take: 50,
        });
    }

    async getUserSubmissionsForProblem(
        userId: string,
        problemId: string,
    ): Promise<Submission[]> {
        return this.submissionsRepository.find({
            where: { userId, problemId },
            order: { submittedAt: 'DESC' },
        });
    }

    // ── Statistics ────────────────────────────────────────

    async getUserStats(userId: string) {
        const submissions = await this.submissionsRepository.find({
            where: { userId },
            relations: ['problem'],
        });

        const uniqueSolved = new Set(
            submissions
                .filter((s) => s.status === SubmissionStatus.ACCEPTED)
                .map((s) => s.problemId),
        ).size;

        const byDifficulty = {
            easy: 0,
            medium: 0,
            hard: 0,
        };

        submissions
            .filter((s) => s.status === SubmissionStatus.ACCEPTED)
            .forEach((s) => {
                if (s.problem) {
                    byDifficulty[s.problem.difficulty] =
                        (byDifficulty[s.problem.difficulty] || 0) + 1;
                }
            });

        return {
            totalSubmissions: submissions.length,
            problemsSolved: uniqueSolved,
            byDifficulty,
            recentSubmissions: submissions.slice(0, 5),
        };
    }

    async getLeaderboard(limit: number = 10) {
        const result = await this.submissionsRepository
            .createQueryBuilder('submission')
            .select('submission.userId', 'userId')
            .addSelect('user.email', 'email')
            .addSelect('COUNT(DISTINCT submission.problemId)', 'problemsSolved')
            .addSelect('COUNT(submission.id)', 'totalSubmissions')
            .leftJoin('submission.user', 'user')
            .where('submission.status = :status', {
                status: SubmissionStatus.ACCEPTED,
            })
            .groupBy('submission.userId')
            .addGroupBy('user.email')
            .orderBy('problemsSolved', 'DESC')
            .limit(limit)
            .getRawMany();

        return result;
    }
}
