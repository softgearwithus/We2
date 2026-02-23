import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

import { SqlProblem, SqlDifficulty } from './entities/sql-problem.entity';
import { SqlSubmission, SqlSubmissionSource, SqlSubmissionStatus } from './entities/sql-submission.entity';
import { SqlUserState } from './entities/sql-user-state.entity';
import { SqlTrainingSession } from './entities/sql-training-session.entity';
import { SqlProblemInsight } from './entities/sql-problem-insight.entity';
import { CreateSqlProblemDto } from './dto/create-sql-problem.dto';
import { CreateSqlSubmissionDto } from './dto/create-sql-submission.dto';
import { AdminSqlProblemQueryDto, SqlProblemOrder } from './dto/admin-sql-problem-query.dto';
import { LeetCodeService } from '../dsa/services/leetcode.service';

@Injectable()
export class SqlService {
    constructor(
        @InjectRepository(SqlProblem)
        private problemsRepository: Repository<SqlProblem>,
        @InjectRepository(SqlSubmission)
        private submissionsRepository: Repository<SqlSubmission>,
        @InjectRepository(SqlUserState)
        private userStatesRepository: Repository<SqlUserState>,
        @InjectRepository(SqlTrainingSession)
        private trainingSessionsRepository: Repository<SqlTrainingSession>,
        @InjectRepository(SqlProblemInsight)
        private problemInsightsRepository: Repository<SqlProblemInsight>,
        private leetCodeService: LeetCodeService,
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

    private computeNextReviewDate(mastery: number, score: number): Date {
        const baseDays = score >= 90 ? 8 : score >= 75 ? 5 : score >= 60 ? 3 : 1;
        const masteryBoost = mastery >= 80 ? 4 : mastery >= 60 ? 2 : mastery >= 40 ? 1 : 0;
        const days = Math.min(baseDays + masteryBoost, 21);
        const next = new Date();
        next.setDate(next.getDate() + days);
        return next;
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

    private isEmptyContent(content?: string | null): boolean {
        if (!content) return true;
        const trimmed = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        return trimmed.length === 0 || trimmed.toLowerCase().includes('description not available');
    }

    private async ensureProblemTemplates(problem: SqlProblem): Promise<SqlProblem> {
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

        return problem;
    }

    private buildEvaluationPrompt(problem: SqlProblem, code: string) {
        return `You are a strict but fair SQL evaluator.\n\nProblem Title: ${problem.title}\nDifficulty: ${problem.difficulty}\nDescription:\n${problem.description}\n\nEvaluate the student's SQL query.\n- Score 0-100 for correctness and clarity.\n- Provide a concise feedback summary.\n- Determine if the solution is acceptable overall.\nReturn JSON only in this format:\n{\n  "score": number,\n  "status": "accepted" | "rejected",\n  "summary": "short feedback",\n  "strengths": ["..."],\n  "improvements": ["..."]\n}\n\nStudent SQL:\n${code}`;
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

    // ── Problem Management ────────────────────────────────

    async createProblem(dto: CreateSqlProblemDto): Promise<SqlProblem> {
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

    async adminListProblems(query: AdminSqlProblemQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const order = query.order || SqlProblemOrder.LATEST;

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

        if (order === SqlProblemOrder.OLDEST) {
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

    async getAllProblems(difficulty?: SqlDifficulty): Promise<SqlProblem[]> {
        const query = this.problemsRepository
            .createQueryBuilder('problem')
            .where('problem.isActive = :isActive', { isActive: true })
            .orderBy('problem.createdAt', 'ASC');

        if (difficulty) {
            query.andWhere('problem.difficulty = :difficulty', { difficulty });
        }

        return query.getMany();
    }

    async getProblemBySlug(slug: string): Promise<SqlProblem> {
        const problem = await this.problemsRepository.findOne({
            where: { slug, isActive: true },
        });

        if (!problem) {
            throw new NotFoundException(`SQL problem with slug ${slug} not found`);
        }

        return problem;
    }

    async getProblemById(id: string): Promise<SqlProblem> {
        const problem = await this.problemsRepository.findOne({
            where: { id, isActive: true },
        });

        if (!problem) {
            throw new NotFoundException(`SQL problem with ID ${id} not found`);
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

        const dueState = await this.userStatesRepository
            .createQueryBuilder('state')
            .innerJoin(SqlProblem, 'problem', 'problem.id = state.problemId')
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

    // ── Submissions ────────────────────────────────

    async createSubmission(userId: string, dto: CreateSqlSubmissionDto): Promise<SqlSubmission> {
        const problem = await this.getProblemById(dto.problemId);
        problem.submissions += 1;
        if (dto.status === SqlSubmissionStatus.ACCEPTED) {
            problem.accepted += 1;
        }
        await this.problemsRepository.save(problem);

        const submission = this.submissionsRepository.create({
            ...dto,
            userId,
            source: dto.source || SqlSubmissionSource.PRACTICE,
        });

        return this.submissionsRepository.save(submission);
    }

    async getUserSubmissions(userId: string): Promise<SqlSubmission[]> {
        return this.submissionsRepository.find({
            where: { userId },
            relations: ['problem'],
            order: { submittedAt: 'DESC' },
            take: 50,
        });
    }

    async getUserSubmissionsForProblem(userId: string, problemId: string): Promise<SqlSubmission[]> {
        return this.submissionsRepository.find({
            where: { userId, problemId },
            order: { submittedAt: 'DESC' },
        });
    }

    async getUserTrainingSubmissions(userId: string, problemId?: string): Promise<SqlSubmission[]> {
        const where: Record<string, any> = {
            userId,
            source: SqlSubmissionSource.TRAINING,
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

    // ── Training submit / insight ─────────────────

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
            this.buildEvaluationPrompt(problem, payload.code),
        );

        const score = Math.max(0, Math.min(100, Number(evaluation.score || 0)));
        const accepted = evaluation.status === 'accepted' || score >= 70;
        const submissionStatus = accepted ? SqlSubmissionStatus.ACCEPTED : SqlSubmissionStatus.WRONG_ANSWER;

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
            source: SqlSubmissionSource.TRAINING,
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
        const prompt = `You are an expert SQL mentor. Provide a concise learning guide for this problem.
Include: key idea, approach outline, and 1-2 pitfalls.
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
            path.resolve(process.cwd(), 'sql_dataset.json'),
            path.resolve(process.cwd(), '..', 'sql_dataset.json'),
        ];
        const datasetPath = datasetCandidates.find((candidate) => fs.existsSync(candidate));
        if (!datasetPath) {
            return { message: 'sql_dataset.json not found.' };
        }

        const raw = fs.readFileSync(datasetPath, 'utf-8');
        return this.importProblemsFromJson(raw);
    }

    async importProblemsFromJson(raw: string) {
        const dataset = JSON.parse(raw) as any;
        const groups = dataset?.data?.studyPlanV2Detail?.planSubGroups || [];
        const created: string[] = [];
        const updated: string[] = [];
        const skipped: string[] = [];

        let questions: Array<any> = [];
        if (Array.isArray(dataset)) {
            questions = dataset;
        } else {
            for (const group of groups) {
                if (!group?.questions?.length) continue;
                group.questions.forEach((question: any) => {
                    questions.push({
                        ...question,
                        groupName: group.name,
                    });
                });
            }
        }

        for (const entry of questions) {
            const slug = String(entry.titleSlug || entry.title || '')
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
                    ? SqlDifficulty.HARD
                    : rawDifficulty === 'medium'
                        ? SqlDifficulty.MEDIUM
                        : SqlDifficulty.EASY;

            const tags = new Set<string>();
            if (entry.groupName) tags.add(entry.groupName);
            if (Array.isArray(entry.topicTags)) {
                entry.topicTags.forEach((tag: any) => {
                    if (tag?.name) tags.add(tag.name);
                });
            }

            const baseProblem = {
                title: entry.title,
                slug,
                leetcodeSlug: entry.titleSlug || slug,
                leetcodeUrl: entry.titleSlug ? `https://leetcode.com/problems/${entry.titleSlug}/` : null,
                difficulty,
                description: '<p>Description not available yet.</p>',
                examples: [],
                constraints: [],
                starterCode: { sql: '-- Write your SQL query here' },
                codeTemplates: null,
                languageMeta: [{ lang: 'SQL', langSlug: 'sql' }],
                testCases: [],
                categories: Array.from(tags),
                hints: [],
                solution: null,
                isActive: true,
            } as Partial<SqlProblem>;

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
