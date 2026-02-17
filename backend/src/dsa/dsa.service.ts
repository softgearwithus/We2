import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DsaProblem, Difficulty } from './entities/dsa-problem.entity';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { DsaUserState } from './entities/dsa-user-state.entity';
import { DsaTrainingSession } from './entities/dsa-training-session.entity';
import { DsaProblemInsight } from './entities/dsa-problem-insight.entity';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { CreateDsaProblemDto } from './dto/create-dsa-problem.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { LeetCodeService } from './services/leetcode.service';

@Injectable()
export class DsaService {
    constructor(
        @InjectRepository(DsaProblem)
        private problemsRepository: Repository<DsaProblem>,
        @InjectRepository(Submission)
        private submissionsRepository: Repository<Submission>,
        @InjectRepository(DsaUserState)
        private userStatesRepository: Repository<DsaUserState>,
        @InjectRepository(DsaTrainingSession)
        private trainingSessionsRepository: Repository<DsaTrainingSession>,
        @InjectRepository(DsaProblemInsight)
        private problemInsightsRepository: Repository<DsaProblemInsight>,
        private leetCodeService: LeetCodeService,
        private configService: ConfigService,
    ) { }

    private getReviewWindowEnd(): Date {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end;
    }

    private async ensureUserStates(userId: string) {
        const totalProblems = await this.problemsRepository.count({ where: { isActive: true } });
        if (totalProblems === 0) {
            return;
        }

        const existingStates = await this.userStatesRepository.find({
            where: { userId },
            select: ['problemId'],
        });
        const existingIds = new Set(existingStates.map((state) => state.problemId));
        const problems = await this.problemsRepository.find({ where: { isActive: true } });

        const newStates = problems
            .filter((problem) => !existingIds.has(problem.id))
            .map((problem) =>
                this.userStatesRepository.create({
                    userId,
                    problemId: problem.id,
                    mastery: 0,
                    nextReviewAt: null,
                    lastReviewedAt: null,
                    lastScore: null,
                }),
            );

        if (newStates.length) {
            await this.userStatesRepository.save(newStates);
        }
    }

    private computeNextReviewDate(mastery: number, score: number): Date {
        const baseDays = score >= 90 ? 8 : score >= 75 ? 5 : score >= 60 ? 3 : 1;
        const masteryBoost = mastery >= 80 ? 4 : mastery >= 60 ? 2 : mastery >= 40 ? 1 : 0;
        const days = Math.min(baseDays + masteryBoost, 21);
        const next = new Date();
        next.setDate(next.getDate() + days);
        return next;
    }

    private buildEvaluationPrompt(problem: DsaProblem, code: string, language: string) {
        return `You are a strict but fair DSA evaluator.\n\nProblem Title: ${problem.title}\nDifficulty: ${problem.difficulty}\nDescription:\n${problem.description}\n\nEvaluate the student's solution in ${language}.\n- Score 0-100 for correctness and clarity.\n- Provide a concise feedback summary.\n- Determine if the solution is acceptable overall.\nReturn JSON only in this format:\n{\n  "score": number,\n  "status": "accepted" | "rejected",\n  "summary": "short feedback",\n  "strengths": ["..."],\n  "improvements": ["..."]\n}\n\nStudent Code:\n${code}`;
    }

    private async evaluateWithGemini(prompt: string) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new InternalServerErrorException('Gemini API not configured.');
        }
        const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonString = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            throw new InternalServerErrorException('Failed to parse Gemini response.');
        }
    }

    private async generateGeminiText(prompt: string) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            throw new InternalServerErrorException('Gemini API not configured.');
        }
        const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    private async ensureProblemTemplates(problem: DsaProblem): Promise<DsaProblem> {
        if ((!problem.languageMeta || !problem.codeTemplates) && problem.leetcodeSlug) {
            try {
                const editorData = await this.leetCodeService.fetchEditorData(problem.leetcodeSlug);
                problem.languageMeta = editorData.languageMeta;
                problem.codeTemplates = editorData.templates;
                await this.problemsRepository.save(problem);
            } catch (error) {
                // ignore LeetCode fetch failures
            }
        }

        return problem;
    }

    // ── Problem Management ────────────────────────────────

    async createProblem(dto: CreateDsaProblemDto): Promise<DsaProblem> {
        let languageMeta = dto.languageMeta || null;
        let codeTemplates = dto.codeTemplates || null;
        const leetcodeSlug = dto.leetcodeSlug || dto.slug;

        if ((!languageMeta || !codeTemplates) && leetcodeSlug) {
            try {
                const editorData = await this.leetCodeService.fetchEditorData(leetcodeSlug);
                languageMeta = editorData.languageMeta;
                codeTemplates = editorData.templates;
            } catch (error) {
                // fall back to provided templates if LeetCode fetch fails
            }
        }

        const problem = this.problemsRepository.create({
            ...dto,
            leetcodeSlug,
            leetcodeUrl: dto.leetcodeUrl || (leetcodeSlug ? `https://leetcode.com/problems/${leetcodeSlug}/` : null),
            languageMeta,
            codeTemplates,
        });
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

    // ── Training Flow ─────────────────────────────────────

    async getNextTrainingTask(userId: string) {
        await this.ensureUserStates(userId);
        const end = this.getReviewWindowEnd();

        const activeSession = await this.trainingSessionsRepository.findOne({ where: { userId } });
        if (activeSession) {
            if (activeSession.expiresAt && activeSession.expiresAt < new Date()) {
                await this.trainingSessionsRepository.delete({ id: activeSession.id });
            } else if (activeSession.submitted) {
                await this.trainingSessionsRepository.delete({ id: activeSession.id });
            } else {
                let problem = await this.getProblemById(activeSession.problemId);
                problem = await this.ensureProblemTemplates(problem);
                const userState = await this.userStatesRepository.findOne({
                    where: { userId, problemId: activeSession.problemId },
                });
                return {
                    sessionId: activeSession.id,
                    problem,
                    mastery: userState?.mastery ?? 0,
                    nextReviewAt: userState?.nextReviewAt ?? null,
                    canSubmit: !activeSession.submitted,
                };
            }
        }

        const dueState = await this.userStatesRepository
            .createQueryBuilder('state')
            .innerJoin(DsaProblem, 'problem', 'problem.id = state.problemId')
            .where('state.userId = :userId', { userId })
            .andWhere('(state.nextReviewAt IS NULL OR state.nextReviewAt <= :end)', { end })
            .andWhere('problem.isActive = :isActive', { isActive: true })
            .orderBy('state.mastery', 'ASC')
            .addOrderBy('state.nextReviewAt', 'ASC')
            .getOne();

        if (!dueState) {
            return { message: 'No problems due right now. Check back later.' };
        }

        let problem = await this.getProblemById(dueState.problemId);
        problem = await this.ensureProblemTemplates(problem);
        const session = this.trainingSessionsRepository.create({
            userId,
            problemId: dueState.problemId,
            assignedAt: new Date(),
            expiresAt: end,
            submitted: false,
        });
        const savedSession = await this.trainingSessionsRepository.save(session);

        return {
            sessionId: savedSession.id,
            problem,
            mastery: dueState.mastery,
            nextReviewAt: dueState.nextReviewAt,
            canSubmit: true,
        };
    }

    async submitTrainingSolution(userId: string, payload: { sessionId: string; code: string; language: string }) {
        const session = await this.trainingSessionsRepository.findOne({
            where: { id: payload.sessionId, userId },
        });
        if (!session) {
            throw new NotFoundException('Training session not found.');
        }
        if (session.expiresAt && session.expiresAt < new Date()) {
            await this.trainingSessionsRepository.delete({ id: session.id });
            throw new NotFoundException('Training session expired.');
        }
        if (session.submitted) {
            return { message: 'Submission already received for this review window.' };
        }

        const problem = await this.getProblemById(session.problemId);
        const evaluation = await this.evaluateWithGemini(
            this.buildEvaluationPrompt(problem, payload.code, payload.language),
        );

        const score = Math.max(0, Math.min(100, Number(evaluation.score || 0)));
        const accepted = evaluation.status === 'accepted' || score >= 70;
        const submissionStatus = accepted ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER;
        const userState = await this.userStatesRepository.findOne({
            where: { userId, problemId: session.problemId },
        });
        if (!userState) {
            throw new NotFoundException('User state not found.');
        }

        const masteryDelta = accepted ? Math.max(5, Math.round(score / 20)) : -5;
        const nextMastery = Math.max(0, Math.min(100, userState.mastery + masteryDelta));
        userState.mastery = nextMastery;
        userState.lastReviewedAt = new Date();
        userState.lastScore = score;
        userState.nextReviewAt = this.computeNextReviewDate(nextMastery, score);
        await this.userStatesRepository.save(userState);

        session.submitted = true;
        await this.trainingSessionsRepository.save(session);

        await this.createSubmission(userId, {
            problemId: session.problemId,
            language: payload.language,
            code: payload.code,
            status: submissionStatus,
            passedTests: 0,
            totalTests: 0,
        });

        return {
            status: accepted ? 'accepted' : 'rejected',
            score,
            summary: evaluation.summary || '',
            strengths: evaluation.strengths || [],
            improvements: evaluation.improvements || [],
            nextReviewAt: userState.nextReviewAt,
            mastery: userState.mastery,
        };
    }

    async getLearningInsight(problemId: string) {
        const insight = await this.problemInsightsRepository.findOne({ where: { problemId } });
        if (!insight) {
            return { message: 'No insight available for this problem yet.' };
        }
        return insight;
    }

    async generateInsightForProblem(problemId: string) {
        const existing = await this.problemInsightsRepository.findOne({ where: { problemId } });
        if (existing) {
            return existing;
        }

        const problem = await this.getProblemById(problemId);
        const prompt = `You are an expert DSA mentor. Provide a concise learning guide for this problem.
Include: key idea, approach outline, time/space complexity, and 1-2 pitfalls.
Return markdown only.

Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description:
${problem.description}`;

        const content = await this.generateGeminiText(prompt);
        if (!content) {
            throw new InternalServerErrorException('Gemini did not return insight content.');
        }

        const insight = this.problemInsightsRepository.create({
            problemId,
            content,
            model: this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash',
            generatedAt: new Date(),
        });
        return this.problemInsightsRepository.save(insight);
    }

    async seedProblemsFromDataset() {
        const datasetCandidates = [
            path.resolve(process.cwd(), 'dataset.json'),
            path.resolve(process.cwd(), '..', 'dataset.json'),
        ];
        const datasetPath = datasetCandidates.find((candidate) => fs.existsSync(candidate));
        if (!datasetPath) {
            return { message: 'dataset.json not found.' };
        }

        const raw = fs.readFileSync(datasetPath, 'utf-8');
        const dataset = JSON.parse(raw) as Array<any>;
        const created: string[] = [];
        const updated: string[] = [];

        for (const entry of dataset) {
            const slug = (entry.leetcode_slug || entry.title || '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-+|-+$)/g, '');
            if (!slug) continue;

            const existing = await this.problemsRepository.findOne({ where: { slug } });
            const rawDifficulty = String(entry.difficulty || 'easy').toLowerCase();
            const difficulty =
                rawDifficulty === 'hard'
                    ? Difficulty.HARD
                    : rawDifficulty === 'medium'
                        ? Difficulty.MEDIUM
                        : Difficulty.EASY;
            const baseProblem = {
                title: entry.title,
                slug,
                leetcodeSlug: entry.leetcode_slug || slug,
                leetcodeUrl: entry.leetcode_slug ? `https://leetcode.com/problems/${entry.leetcode_slug}/` : null,
                difficulty,
                description: entry.description || '<p>Description not available yet.</p>',
                examples: [],
                constraints: [],
                starterCode: {},
                codeTemplates: null,
                languageMeta: null,
                testCases: [],
                categories: entry.patterns || [],
                hints: [],
                solution: null,
                isActive: true,
            } as Partial<DsaProblem>;

            if (existing) {
                Object.assign(existing, baseProblem);
                await this.problemsRepository.save(existing);
                updated.push(slug);
            } else {
                const createdProblem = this.problemsRepository.create(baseProblem);
                await this.problemsRepository.save(createdProblem);
                created.push(slug);
            }
        }

        return { createdCount: created.length, updatedCount: updated.length };
    }
}
