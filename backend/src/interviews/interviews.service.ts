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
    InterviewType,
} from './entities/interview-session.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { User } from '../users/user.entity';
import { GeminiService } from '../common/gemini.service';

@Injectable()
export class InterviewsService {
    constructor(
        @InjectRepository(InterviewSession)
        private interviewsRepo: Repository<InterviewSession>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        private geminiService: GeminiService,
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

        if (typeof dto.duration === 'number') {
            interview.duration = dto.duration;
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

    async checkAndIncrementLimit(userId: string, type: 'audio' | 'video'): Promise<{ allowed: boolean, limit: number, usage: number }> {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const now = new Date();
        const lastReset = user.usageLastReset ? new Date(user.usageLastReset) : null;

        // Reset limits if new month
        if (!lastReset || (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear())) {
            user.audioDrillUsage = 0;
            user.videoInterviewUsage = 0;
            user.drillTopicsRefreshCount = 0;
            user.usageLastReset = now;
        }

        const plan = user.subscriptionPlan || 'free';
        let audioLimit = 2; // Default/Free
        let videoLimit = 0; // Default/Free

        switch (plan) {
            case 'standard_tier':
                audioLimit = 5;
                videoLimit = 1;
                break;
            case 'pro_tier':
                audioLimit = 15;
                videoLimit = 3;
                break;
            case 'placement_plus':
            case 'industry_plus':
            case 'we2_max':
                audioLimit = 50;
                videoLimit = 10;
                break;
        }

        const limit = (type === 'audio') ? audioLimit : videoLimit;
        const currentUsage = (type === 'audio') ? user.audioDrillUsage : user.videoInterviewUsage;

        if (currentUsage >= limit) {
            return { allowed: false, limit, usage: currentUsage };
        }

        if (type === 'audio') {
            user.audioDrillUsage++;
        } else {
            user.videoInterviewUsage++;
        }

        await this.usersRepo.save(user);
        return { allowed: true, limit, usage: currentUsage + 1 };
    }

    async generateAudioDrill(userId: string, topic: string) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Check refresh cap
        if (user.drillTopicsRefreshCount >= 20) {
            return this.geminiService.generateDrillContent("Common Interview Questions", { userId, isFallback: true });
        }

        user.drillTopicsRefreshCount++;
        await this.usersRepo.save(user);

        return this.geminiService.generateDrillContent(topic, { userId });
    }

    async generateCommunicationDrill(userId: string, topic?: string) {
        return this.geminiService.generateCommunicationDrill(topic);
    }

    async analyzeAudioDrill(userId: string, audioBase64: string, context: string) {
        // Check limit
        const { allowed, limit, usage } = await this.checkAndIncrementLimit(userId, 'audio');
        if (!allowed) {
            throw new BadRequestException(`Monthly audio drill limit exhausted (${usage}/${limit}). Please upgrade your plan for more.`);
        }

        // Analyze
        const analysis = await this.geminiService.analyzeAudio(audioBase64, context);
        if (!analysis || typeof analysis.overallScore !== 'number') {
            throw new BadRequestException('AI analysis failed. Please try again.');
        }

        // Save session
        const session = this.interviewsRepo.create({
            userId,
            type: InterviewType.TECHNICAL,
            status: InterviewStatus.COMPLETED,
            startedAt: new Date(),
            completedAt: new Date(),
            overallScore: analysis.overallScore,
            analysisProvider: 'gemini',
            analysis: analysis.metrics,
            feedback: analysis.feedback,
            strengths: analysis.strengths,
            improvements: analysis.improvements,
            questions: [{ context }],
        });

        return this.interviewsRepo.save(session);
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
    async submitCommunicationSession(userId: string, theme?: string): Promise<InterviewSession> {
        // Create initial session with IN_PROGRESS status
        const session = this.interviewsRepo.create({
            userId,
            type: InterviewType.BEHAVIORAL,
            status: InterviewStatus.IN_PROGRESS,
            startedAt: new Date(),
            questions: [{ context: theme || "Communication Drill 3-Part" }]
        });
        return this.interviewsRepo.save(session);
    }

    async performBackgroundAnalysis(sessionId: string, files: Array<Express.Multer.File>, metadata: any) {
        console.log(`[Service] Starting background analysis for session ${sessionId}`);
        console.log(`[Service] Files received: ${files.map(f => f.fieldname).join(', ')}`);

        const results = {
            reading: [] as any[],
            listening: [] as any[],
            extempore: null as any,
            technical: [] as any[],
            overallScore: null as number | null
        };

        let totalScoreSum = 0;
        let itemsCount = 0;
        const allStrengths: string[] = [];
        const allImprovements: string[] = [];
        const allCoaching: string[] = [];
        let mainPersona = "Assessment Pending";
        let analysisFailed = false;

        // Helper to find file by field name
        const getFile = (fieldname: string) => files.find(f => f.fieldname === fieldname);

        try {
            // 2. Analyze Reading Sections
            if (metadata.reading) {
                for (let i = 0; i < metadata.reading.length; i++) {
                    try {
                        const file = getFile(`reading_${i}`);
                        if (file) {
                            console.log(`[Service] Analyzing reading_${i}, buffer size: ${file.buffer.length} bytes`);
                            if (file.buffer.length < 1000) { // Very rough silence/empty check (1KB)
                                console.warn(`[Service] reading_${i} buffer too small, skipping AI analysis.`);
                                continue;
                            }
                            const text = metadata.reading[i].text;
                            const audioBase64 = file.buffer.toString('base64');
                            const analysis = await this.geminiService.analyzeAudio(audioBase64, `Reading Task: Read this text clearly: "${text}"`);
                            if (analysis) {
                                console.log(`[Service] reading_${i} score: ${analysis.overallScore}`);
                                results.reading.push({ ...analysis, targetText: text }); // Store target text
                                totalScoreSum += (analysis.overallScore || 0);
                                itemsCount++;
                                if (analysis.strengths) allStrengths.push(...analysis.strengths);
                                if (analysis.improvements) allImprovements.push(...analysis.improvements);
                                if (analysis.actionableCoaching) allCoaching.push(...analysis.actionableCoaching);
                            }
                        } else {
                            console.warn(`[Service] Missing file for reading_${i}`);
                        }
                    } catch (e) {
                        console.error(`[Service] Failed to analyze reading_${i}`, e);
                    }
                }
            }

            // 3. Analyze Listening Sections
            if (metadata.listening) {
                for (let i = 0; i < metadata.listening.length; i++) {
                    try {
                        const file = getFile(`listening_${i}`);
                        if (file) {
                            console.log(`[Service] Analyzing listening_${i}, buffer size: ${file.buffer.length} bytes`);
                            if (file.buffer.length < 1000) {
                                console.warn(`[Service] listening_${i} buffer too small, skipping.`);
                                continue;
                            }
                            const text = metadata.listening[i].text;
                            const audioBase64 = file.buffer.toString('base64');
                            const analysis = await this.geminiService.analyzeAudio(audioBase64, `Listening Task: Repeat this sentence exactly: "${text}"`);
                            if (analysis) {
                                console.log(`[Service] listening_${i} score: ${analysis.overallScore}`);
                                results.listening.push({ ...analysis, targetText: text }); // Store target text
                                totalScoreSum += (analysis.overallScore || 0);
                                itemsCount++;
                                if (analysis.strengths) allStrengths.push(...analysis.strengths);
                                if (analysis.improvements) allImprovements.push(...analysis.improvements);
                                if (analysis.actionableCoaching) allCoaching.push(...analysis.actionableCoaching);
                            }
                        } else {
                            console.warn(`[Service] Missing file for listening_${i}`);
                        }
                    } catch (e) {
                        console.error(`[Service] Failed to analyze listening_${i}`, e);
                    }
                }
            }

            // 4. Analyze Extempore
            if (metadata.extempore) {
                try {
                    const file = getFile('extempore');
                    if (file) {
                        console.log(`[Service] Analyzing extempore, buffer size: ${file.buffer.length} bytes`);
                        if (file.buffer.length < 1000) {
                            console.warn(`[Service] extempore buffer too small, skipping.`);
                        } else {
                            const topic = metadata.extempore.topic;
                            const audioBase64 = file.buffer.toString('base64');
                            const analysis = await this.geminiService.analyzeAudio(audioBase64, `Extempore Task: Speak for 60 seconds on: "${topic}"`);
                            if (analysis) {
                                console.log(`[Service] extempore score: ${analysis.overallScore}`);
                                results.extempore = { ...analysis, targetTopic: topic }; // Store target topic
                                totalScoreSum += (analysis.overallScore || 0);
                                itemsCount++;
                                if (analysis.strengths) allStrengths.push(...analysis.strengths);
                                if (analysis.improvements) allImprovements.push(...analysis.improvements);
                                if (analysis.actionableCoaching) allCoaching.push(...analysis.actionableCoaching);
                                if (analysis.communicationPersona) mainPersona = analysis.communicationPersona;
                            }
                        }
                    } else {
                        console.warn(`[Service] Missing file for extempore`);
                    }
                } catch (e) {
                    console.error(`[Service] Failed to analyze extempore`, e);
                }
            }

            // 5. Analyze Technical
            if (metadata.technical && Array.isArray(metadata.technical)) {
                for (let i = 0; i < metadata.technical.length; i++) {
                    try {
                        const file = getFile(`technical_${i}`);
                        if (file) {
                            console.log(`[Service] Analyzing technical_${i}, buffer size: ${file.buffer.length} bytes`);
                            if (file.buffer.length < 1000) {
                                console.warn(`[Service] technical_${i} buffer too small, skipping.`);
                                continue;
                            }
                            const topic = metadata.technical[i].topic;
                            const audioBase64 = file.buffer.toString('base64');
                            const analysis = await this.geminiService.analyzeAudio(audioBase64, `Technical Interview Question: Answer this software engineering question out loud thoughtfully: "${topic}"`);
                            if (analysis) {
                                console.log(`[Service] technical_${i} score: ${analysis.overallScore}`);
                                results.technical.push({ ...analysis, targetTopic: topic });
                                totalScoreSum += (analysis.overallScore || 0);
                                itemsCount++;
                                if (analysis.strengths) allStrengths.push(...analysis.strengths);
                                if (analysis.improvements) allImprovements.push(...analysis.improvements);
                                if (analysis.actionableCoaching) allCoaching.push(...analysis.actionableCoaching);
                                if (analysis.communicationPersona && mainPersona === "Assessment Pending") mainPersona = analysis.communicationPersona;
                            }
                        } else {
                            console.warn(`[Service] Missing file for technical_${i}`);
                        }
                    } catch (e) {
                        console.error(`[Service] Failed to analyze technical_${i}`, e);
                    }
                }
            }

            // 6. Aggregate & Update Session
            const finalScore = itemsCount > 0 ? Math.round(totalScoreSum / itemsCount) : null;
            results.overallScore = finalScore;

            const session = await this.interviewsRepo.findOne({ where: { id: sessionId } });
            if (session) {
                session.status = InterviewStatus.COMPLETED;
                session.completedAt = new Date();
                session.analysisProvider = 'gemini';
                if (itemsCount > 0) {
                    session.overallScore = finalScore;
                    session.analysis = {
                        ...results,
                        allCoaching: Array.from(new Set(allCoaching)),
                        mainPersona
                    };
                    session.analysisProvider = 'gemini';
                    session.feedback = `Full drill analysis completed. Persona: ${mainPersona}`;
                } else {
                    session.overallScore = null;
                    session.analysis = {
                        ...results,
                        allCoaching: Array.from(new Set(allCoaching)),
                        mainPersona
                    };
                    session.analysisProvider = 'gemini';
                    session.feedback = "Drill submitted, but analysis failed for all clips.";
                }

                // Keep top unique strengths/improvements
                session.strengths = Array.from(new Set(allStrengths)).slice(0, 5);
                session.improvements = Array.from(new Set(allImprovements)).slice(0, 5);

                await this.interviewsRepo.save(session);
                console.log(`[Service] Completed analysis for session ${sessionId} with ${itemsCount} items.`);
            }
        } catch (error) {
            console.error(`[Service] Background analysis failed for session ${sessionId}`, error);
            analysisFailed = true;
        } finally {
            if (analysisFailed) {
                const session = await this.interviewsRepo.findOne({ where: { id: sessionId } });
                if (session) {
                    session.status = InterviewStatus.COMPLETED;
                    session.completedAt = new Date();
                    session.feedback = "Drill submitted, but analysis failed. Please retry.";
                    await this.interviewsRepo.save(session);
                }
            }
        }
    }
}
