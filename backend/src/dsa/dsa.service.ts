import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DsaProblem, Difficulty, DsaPlatform } from './entities/dsa-problem.entity';
import { Submission, SubmissionSource, SubmissionStatus } from './entities/submission.entity';
import { DsaUserState } from './entities/dsa-user-state.entity';
import { DsaTrainingSession } from './entities/dsa-training-session.entity';
import { DsaProblemInsight } from './entities/dsa-problem-insight.entity';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { CreateDsaProblemDto } from './dto/create-dsa-problem.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { AdminDsaProblemQueryDto, ProblemOrder } from './dto/admin-dsa-problem-query.dto';
import { LeetCodeService } from './services/leetcode.service';
import { HackerRankService } from './services/hackerrank.service';
import { CodeForcesService } from './services/codeforces.service';

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
        private hackerRankService: HackerRankService,
        private codeForcesService: CodeForcesService,
        private configService: ConfigService,
    ) { }

    private getReviewWindowEnd(): Date {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return end;
    }

    private isReviewDue(nextReviewAt: Date | null, end: Date): boolean {
        if (!nextReviewAt) {
            return true;
        }
        return nextReviewAt <= end;
    }

    private async ensureUserStates(userId: string, platform?: DsaPlatform) {
        const whereClause: Record<string, any> = { isActive: true };
        if (platform) whereClause.platform = platform;
        const totalProblems = await this.problemsRepository.count({ where: whereClause });
        if (totalProblems === 0) {
            return;
        }

        const existingStates = await this.userStatesRepository.find({
            where: { userId },
            select: ['problemId'],
        });
        const existingIds = new Set(existingStates.map((state) => state.problemId));
        const problems = await this.problemsRepository.find({ where: whereClause });

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
        const platform = problem.platform || DsaPlatform.LEETCODE;

        if (platform === DsaPlatform.LEETCODE) {
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

            if ((this.isEmptyContent(problem.description) || !problem.constraints?.length) && problem.leetcodeSlug) {
                try {
                    const questionData = await this.leetCodeService.fetchQuestionContent(problem.leetcodeSlug);
                    if (this.isEmptyContent(problem.description) && questionData.content) {
                        problem.description = questionData.content;
                    }
                    if ((!problem.constraints || problem.constraints.length === 0) && questionData.constraints.length > 0) {
                        problem.constraints = questionData.constraints;
                    }
                    await this.problemsRepository.save(problem);
                } catch (error) {
                    // ignore LeetCode fetch failures
                }
            }
        } else if (platform === DsaPlatform.HACKERRANK) {
            const externalId = problem.externalId || problem.leetcodeSlug;
            if (externalId && (this.isEmptyContent(problem.description) || !problem.languageMeta?.length)) {
                try {
                    const detail = await this.hackerRankService.fetchProblemDetail(externalId);
                    if (detail) {
                        if (this.isEmptyContent(problem.description)) {
                            problem.description = detail.description;
                        }
                        if (!problem.languageMeta?.length) {
                            problem.languageMeta = detail.languageMeta;
                            problem.starterCode = detail.starterCode;
                            problem.codeTemplates = detail.starterCode;
                        }
                        if (!problem.externalUrl) {
                            problem.externalUrl = detail.externalUrl;
                        }
                        await this.problemsRepository.save(problem);
                    }
                } catch (error) {
                    // ignore HackerRank fetch failures
                }
            }
        } else if (platform === DsaPlatform.CODEFORCES) {
            const externalId = problem.externalId;
            if (externalId && (this.isEmptyContent(problem.description) || !problem.languageMeta?.length)) {
                try {
                    const detail = await this.codeForcesService.getProblemDetail(externalId);
                    if (detail) {
                        if (this.isEmptyContent(problem.description)) {
                            problem.description = detail.description;
                        }
                        if (!problem.languageMeta?.length) {
                            problem.languageMeta = detail.languageMeta;
                            problem.starterCode = detail.starterCode;
                            problem.codeTemplates = detail.starterCode;
                        }
                        if (!problem.externalUrl) {
                            problem.externalUrl = detail.externalUrl;
                        }
                        if (!problem.companyTags?.length && detail.tags?.length) {
                            problem.companyTags = detail.tags;
                        }
                        await this.problemsRepository.save(problem);
                    }
                } catch (error) {
                    // ignore Codeforces fetch failures
                }
            }
        }

        return problem;
    }

    private isEmptyContent(content?: string | null): boolean {
        if (!content) return true;
        const trimmed = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return trimmed.length === 0 || trimmed.toLowerCase().includes('description not available');
    }

    // ── Problem Management ────────────────────────────────

    async createProblem(dto: CreateDsaProblemDto): Promise<DsaProblem> {
        const platform = dto.platform || DsaPlatform.LEETCODE;
        let languageMeta = dto.languageMeta || null;
        let codeTemplates = dto.codeTemplates || null;
        const leetcodeSlug = dto.leetcodeSlug || (platform === DsaPlatform.LEETCODE ? dto.slug : null);
        const externalId = dto.externalId || leetcodeSlug;

        if (platform === DsaPlatform.LEETCODE && (!languageMeta || !codeTemplates) && leetcodeSlug) {
            try {
                const editorData = await this.leetCodeService.fetchEditorData(leetcodeSlug);
                languageMeta = editorData.languageMeta;
                codeTemplates = editorData.templates;
            } catch (error) {
                // fall back to provided templates if LeetCode fetch fails
            }
        }

        let externalUrl = dto.externalUrl || null;
        if (!externalUrl) {
            if (platform === DsaPlatform.LEETCODE && leetcodeSlug) {
                externalUrl = `https://leetcode.com/problems/${leetcodeSlug}/`;
            } else if (platform === DsaPlatform.HACKERRANK && externalId) {
                externalUrl = `https://www.hackerrank.com/challenges/${externalId}/problem`;
            } else if (platform === DsaPlatform.CODEFORCES && externalId) {
                const match = externalId.match(/^(\d+)([A-Z0-9]+)$/i);
                if (match) {
                    externalUrl = `https://codeforces.com/problemset/problem/${match[1]}/${match[2].toUpperCase()}`;
                }
            }
        }

        const problem = this.problemsRepository.create({
            ...dto,
            platform,
            leetcodeSlug: leetcodeSlug || null,
            leetcodeUrl: platform === DsaPlatform.LEETCODE && leetcodeSlug
                ? `https://leetcode.com/problems/${leetcodeSlug}/`
                : (dto.leetcodeUrl || null),
            externalId: externalId || null,
            externalUrl,
            languageMeta,
            codeTemplates,
        });
        return this.problemsRepository.save(problem);
    }

    async adminListProblems(query: AdminDsaProblemQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const order = query.order || ProblemOrder.LATEST;

        const qb = this.problemsRepository.createQueryBuilder('problem');

        if (query.difficulty) {
            qb.andWhere('problem.difficulty = :difficulty', { difficulty: query.difficulty });
        }
        if (query.category) {
            qb.andWhere(':category = ANY(problem.categories)', { category: query.category });
        }
        if (query.search) {
            qb.andWhere('(problem.title ILIKE :search OR problem.slug ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        if ((query as any).platform) {
            qb.andWhere('problem.platform = :platform', { platform: (query as any).platform });
        }

        if (order === ProblemOrder.OLDEST) {
            qb.orderBy('problem.createdAt', 'ASC');
        } else {
            qb.orderBy('problem.createdAt', 'DESC');
        }

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
            hasNext: page * limit < total,
        };
    }

    async getAllProblems(difficulty?: Difficulty, platform?: DsaPlatform): Promise<DsaProblem[]> {
        const query = this.problemsRepository
            .createQueryBuilder('problem')
            .where('problem.isActive = :isActive', { isActive: true })
            .orderBy('problem.createdAt', 'ASC');

        if (difficulty) {
            query.andWhere('problem.difficulty = :difficulty', { difficulty });
        }
        if (platform) {
            query.andWhere('problem.platform = :platform', { platform });
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

    async getTrainingProblem(userId: string, problemId: string) {
        await this.ensureUserStates(userId);
        let problem = await this.getProblemById(problemId);
        problem = await this.ensureProblemTemplates(problem);
        const userState = await this.userStatesRepository.findOne({
            where: { userId, problemId },
        });
        if (!userState) {
            throw new NotFoundException('User state not found.');
        }

        const end = this.getReviewWindowEnd();
        const canSubmit = this.isReviewDue(userState.nextReviewAt, end);

        const activeSession = await this.trainingSessionsRepository.findOne({
            where: { userId },
        });

        let session = activeSession;
        if (session) {
            session.problemId = problemId;
            session.assignedAt = new Date();
            session.expiresAt = end;
            session.submitted = false;
            session.mode = 'manual';
            session = await this.trainingSessionsRepository.save(session);
        } else {
            session = this.trainingSessionsRepository.create({
                userId,
                problemId,
                assignedAt: new Date(),
                expiresAt: end,
                submitted: false,
                mode: 'manual',
            });
            session = await this.trainingSessionsRepository.save(session);
        }

        return {
            sessionId: session.id,
            problem,
            mastery: userState.mastery,
            nextReviewAt: userState.nextReviewAt,
            canSubmit,
            mode: session.mode || 'manual',
        };
    }

    // ── Submission Management ────────────────────────────

    async createSubmission(
        userId: string,
        dto: CreateSubmissionDto,
    ): Promise<Submission> {
        // Update problem statistics
        const problem = await this.getProblemById(dto.problemId);
        problem.submissions += 1;
        const submissionStatus = dto.status || SubmissionStatus.PENDING;
        if (submissionStatus === SubmissionStatus.ACCEPTED) {
            problem.accepted += 1;
        }
        await this.problemsRepository.save(problem);

        if (submissionStatus === SubmissionStatus.QUEUED || submissionStatus === SubmissionStatus.RUNNING) {
            throw new InternalServerErrorException('Queued execution is disabled.');
        }

        const submission = this.submissionsRepository.create({
            ...dto,
            userId,
            source: dto.source || SubmissionSource.PRACTICE,
            status: submissionStatus,
            passedTests: dto.passedTests ?? 0,
            totalTests: dto.totalTests ?? 0,
        });

        return this.submissionsRepository.save(submission);
    }

    async getSubmission(submissionId: string) {
        const submission = await this.submissionsRepository.findOne({
            where: { id: submissionId },
            relations: ['problem'],
        });

        if (!submission) {
            throw new NotFoundException('Submission not found');
        }

        return {
            id: submission.id,
            problemId: submission.problemId,
            problemTitle: submission.problem.title,
            language: submission.language,
            status: submission.status,
            passedTests: submission.passedTests,
            totalTests: submission.totalTests,
            runtime: submission.runtimeMs,
            memory: submission.memoryKb,
            score: submission.score,
            errorMessage: submission.error,
            failedTestCase: submission.failedTestInput
                ? {
                    input: submission.failedTestInput,
                    expected: submission.failedTestExpected,
                    actual: submission.failedTestActual,
                }
                : null,
            submittedAt: submission.submittedAt,
            completedAt: submission.completedAt,
        };
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

    async getUserTrainingSubmissions(userId: string, problemId?: string): Promise<Submission[]> {
        const where: Record<string, any> = {
            userId,
            source: SubmissionSource.TRAINING,
        };
        if (problemId) {
            where.problemId = problemId;
        }

        return this.submissionsRepository.find({
            where,
            relations: ['problem'],
            order: { submittedAt: 'DESC' },
            take: problemId ? 50 : 100,
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

    async getNextTrainingTask(userId: string, platform?: DsaPlatform) {
        await this.ensureUserStates(userId, platform);
        const end = this.getReviewWindowEnd();

        const activeSession = await this.trainingSessionsRepository.findOne({ where: { userId } });
        if (activeSession) {
            if (activeSession.expiresAt && activeSession.expiresAt < new Date()) {
                await this.trainingSessionsRepository.delete({ id: activeSession.id });
            } else if (activeSession.submitted) {
                await this.trainingSessionsRepository.delete({ id: activeSession.id });
            } else {
                let problem = await this.getProblemById(activeSession.problemId);
                // If platform filter specified, skip sessions from other platforms
                if (platform && problem.platform !== platform) {
                    await this.trainingSessionsRepository.delete({ id: activeSession.id });
                } else {
                    problem = await this.ensureProblemTemplates(problem);
                    const userState = await this.userStatesRepository.findOne({
                        where: { userId, problemId: activeSession.problemId },
                    });
                    const canSubmit = !activeSession.submitted && this.isReviewDue(userState?.nextReviewAt ?? null, end);
                    return {
                        sessionId: activeSession.id,
                        problem,
                        mastery: userState?.mastery ?? 0,
                        nextReviewAt: userState?.nextReviewAt ?? null,
                        canSubmit,
                        mode: activeSession.mode || 'srs',
                    };
                }
            }
        }

        const dueStateQb = this.userStatesRepository
            .createQueryBuilder('state')
            .innerJoin(DsaProblem, 'problem', 'problem.id = state.problemId')
            .where('state.userId = :userId', { userId })
            .andWhere('(state.nextReviewAt IS NULL OR state.nextReviewAt <= :end)', { end })
            .andWhere('problem.isActive = :isActive', { isActive: true });

        if (platform) {
            dueStateQb.andWhere('problem.platform = :platform', { platform });
        }

        const dueState = await dueStateQb
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
            mode: 'srs',
        });
        const savedSession = await this.trainingSessionsRepository.save(session);

        return {
            sessionId: savedSession.id,
            problem,
            mastery: dueState.mastery,
            nextReviewAt: dueState.nextReviewAt,
            canSubmit: true,
            mode: 'srs',
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

        const userState = await this.userStatesRepository.findOne({
            where: { userId, problemId: session.problemId },
        });
        if (!userState) {
            throw new NotFoundException('User state not found.');
        }

        const end = this.getReviewWindowEnd();
        if (!this.isReviewDue(userState.nextReviewAt, end)) {
            return {
                message: `Submission locked until ${userState.nextReviewAt?.toISOString()}`,
            };
        }

        const problem = await this.getProblemById(session.problemId);
        const evaluation = await this.evaluateWithGemini(
            this.buildEvaluationPrompt(problem, payload.code, payload.language),
        );

        const score = Math.max(0, Math.min(100, Number(evaluation.score || 0)));
        const accepted = evaluation.status === 'accepted' || score >= 70;
        const submissionStatus = accepted ? SubmissionStatus.ACCEPTED : SubmissionStatus.WRONG_ANSWER;

        const masteryDelta = accepted ? Math.max(5, Math.round(score / 20)) : -5;
        const nextMastery = Math.max(0, Math.min(100, userState.mastery + masteryDelta));
        userState.mastery = nextMastery;
        userState.lastReviewedAt = new Date();
        userState.lastScore = score;
        userState.nextReviewAt = this.computeNextReviewDate(nextMastery, score);
        await this.userStatesRepository.save(userState);

        session.submitted = true;
        await this.trainingSessionsRepository.save(session);

        const savedSubmission = await this.createSubmission(userId, {
            problemId: session.problemId,
            language: payload.language,
            code: payload.code,
            status: submissionStatus,
            passedTests: 0,
            totalTests: 0,
            score,
            source: SubmissionSource.TRAINING,
        });
        savedSubmission.trainingSessionId = session.id;
        savedSubmission.evaluationSummary = evaluation.summary || null;
        savedSubmission.evaluationStrengths = evaluation.strengths || null;
        savedSubmission.evaluationImprovements = evaluation.improvements || null;
        savedSubmission.evaluationModel = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
        savedSubmission.evaluationRaw = evaluation || null;
        await this.submissionsRepository.save(savedSubmission);

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
        return this.importProblemsFromJson(raw);
    }

    async importProblemsFromJson(raw: string) {
        const dataset = JSON.parse(raw) as Array<any>;
        const created: string[] = [];
        const updated: string[] = [];
        const skipped: string[] = [];

        for (const entry of dataset) {
            const slug = (entry.leetcode_slug || entry.slug || entry.title || '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-+|-+$)/g, '');
            if (!slug) {
                skipped.push(entry.title || 'unknown');
                continue;
            }

            const existing = await this.problemsRepository.findOne({ where: { slug } });
            const rawDifficulty = String(entry.difficulty || 'easy').toLowerCase();
            const difficulty =
                rawDifficulty === 'hard'
                    ? Difficulty.HARD
                    : rawDifficulty === 'medium'
                        ? Difficulty.MEDIUM
                        : Difficulty.EASY;

            const rawPlatform = String(entry.platform || 'leetcode').toLowerCase();
            const platform =
                rawPlatform === 'hackerrank'
                    ? DsaPlatform.HACKERRANK
                    : rawPlatform === 'codeforces'
                        ? DsaPlatform.CODEFORCES
                        : DsaPlatform.LEETCODE;

            const leetcodeSlug = platform === DsaPlatform.LEETCODE ? (entry.leetcode_slug || slug) : null;
            const externalId = entry.external_id || entry.externalId || leetcodeSlug || entry.slug || null;
            const externalUrl = entry.external_url || entry.externalUrl || (leetcodeSlug ? `https://leetcode.com/problems/${leetcodeSlug}/` : null);

            const baseProblem = {
                title: entry.title,
                slug,
                platform,
                leetcodeSlug,
                leetcodeUrl: leetcodeSlug ? `https://leetcode.com/problems/${leetcodeSlug}/` : null,
                externalId,
                externalUrl,
                difficulty,
                description: entry.description || '<p>Description not available yet.</p>',
                examples: [],
                constraints: [],
                starterCode: entry.starterCode || {},
                codeTemplates: null,
                languageMeta: null,
                testCases: [],
                categories: entry.patterns || entry.categories || [],
                hints: [],
                solution: null,
                companyTags: entry.company_tags || entry.companyTags || [],
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

        return { createdCount: created.length, updatedCount: updated.length, skippedCount: skipped.length };
    }
}
