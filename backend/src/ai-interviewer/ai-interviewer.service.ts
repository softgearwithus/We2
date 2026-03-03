import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiInterviewSession } from './entities/ai-interview-session.entity';
import { AiInterviewReport } from './entities/ai-interview-report.entity';
import { AiInterviewModerationEvent } from './entities/ai-interview-moderation-event.entity';
import { ResumeDocument } from './entities/resume-document.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { ConfigService } from '@nestjs/config';
import { CreateAiInterviewDto } from './dto/create-ai-interview.dto';

@Injectable()
export class AiInterviewerService {
    constructor(
        @InjectRepository(AiInterviewSession)
        private sessionsRepo: Repository<AiInterviewSession>,
        @InjectRepository(AiInterviewReport)
        private reportsRepo: Repository<AiInterviewReport>,
        @InjectRepository(AiInterviewModerationEvent)
        private moderationRepo: Repository<AiInterviewModerationEvent>,
        @InjectRepository(ResumeDocument)
        private resumeRepo: Repository<ResumeDocument>,
        @InjectRepository(InterviewSession)
        private interviewSessionsRepo: Repository<InterviewSession>,
        private configService: ConfigService,
    ) { }

    async createSession(userId: string, dto: CreateAiInterviewDto) {
        const session = this.sessionsRepo.create({
            userId,
            interviewSessionId: dto.interviewSessionId,
            resumeId: dto.resumeId,
            status: 'scheduled',
            timerSeconds: 900,
        });
        return this.sessionsRepo.save(session);
    }

    async getReport(sessionId: string, userId: string) {
        const session = await this.sessionsRepo.findOne({ where: { id: sessionId, userId } });
        if (!session) throw new NotFoundException('Session not found');

        const report = await this.reportsRepo.findOne({ where: { sessionId } });
        if (report) return report;

        const aiBase = this.configService.get<string>('AI_INTERVIEW_BASE_URL');
        const aiKey = this.configService.get<string>('AI_INTERVIEW_INTERNAL_KEY');
        if (aiBase && aiKey && session.externalSessionId) {
            const res = await fetch(`${aiBase}/ai-interview/sessions/${session.externalSessionId}/report`, {
                headers: { 'x-internal-key': aiKey },
            }).catch(() => null);
            if (res && res.ok) {
                const data = await res.json().catch(() => null);
                if (data) {
                    // Mirror moderation state (warnings/termination) into our DB.
                    try {
                        // FastAPI creates its own ai_interview_sessions row where id == externalSessionId.
                        const upstream = await this.sessionsRepo.findOne({ where: { id: session.externalSessionId } });
                        if (upstream) {
                            session.warningsCount = upstream.warningsCount;
                            session.terminationReason = upstream.terminationReason;
                            session.status = upstream.status;
                            session.startedAt = upstream.startedAt;
                            session.endedAt = upstream.endedAt;
                            await this.sessionsRepo.save(session);

                            const existing = await this.moderationRepo.count({ where: { sessionId: session.id } });
                            if (!existing) {
                                const upstreamEvents = await this.moderationRepo.find({ where: { sessionId: upstream.id } });
                                if (upstreamEvents.length) {
                                    await this.moderationRepo.save(
                                        upstreamEvents.map((e) =>
                                            this.moderationRepo.create({
                                                sessionId: session.id,
                                                warningLevel: e.warningLevel,
                                                reason: e.reason,
                                                evidenceRefs: e.evidenceRefs,
                                            }),
                                        ),
                                    );
                                }
                            }
                        }
                    } catch {
                        // ignore
                    }

                    const created = this.reportsRepo.create({
                        sessionId,
                        overallScore: data.overall_score ?? data.overallScore ?? null,
                        dimensionScores: data.dimension_scores ?? data.dimensionScores ?? null,
                        strengths: data.strengths ?? null,
                        weaknesses: data.weaknesses ?? null,
                        recommendations: data.recommendations ?? null,
                        summary: data.summary ?? null,
                    });
                    await this.reportsRepo.save(created);

                    const parentSession = await this.interviewSessionsRepo.findOne({
                        where: { id: session.interviewSessionId, userId },
                    });
                    if (parentSession) {
                        parentSession.status = 'completed' as any;
                        if (typeof created.overallScore === 'number') {
                            parentSession.overallScore = created.overallScore;
                        }
                        parentSession.analysisProvider = 'ai-interviewer';
                        parentSession.analysis = {
                            metrics: created.dimensionScores,
                            summary: created.summary,
                            feedback: [
                                ...(created.strengths || []).map((text) => ({ type: 'strength', text })),
                                ...(created.weaknesses || []).map((text) => ({ type: 'improvement', text })),
                            ],
                        };
                        await this.interviewSessionsRepo.save(parentSession);
                    }
                    return created;
                }
            }
        }

        throw new NotFoundException('Report not ready');
    }

    async saveExternalId(sessionId: string, externalId: string) {
        const session = await this.sessionsRepo.findOne({ where: { id: sessionId } });
        if (!session) return;
        session.externalSessionId = externalId;
        await this.sessionsRepo.save(session);
    }

    async uploadResume(userId: string, file: Express.Multer.File) {
        const resume = this.resumeRepo.create({
            userId,
            fileName: file.originalname,
            fileType: file.mimetype,
            parseStatus: 'pending',
        });
        const saved = await this.resumeRepo.save(resume);

        const aiBase = this.configService.get<string>('AI_INTERVIEW_BASE_URL');
        const aiKey = this.configService.get<string>('AI_INTERVIEW_INTERNAL_KEY');
        if (aiBase && aiKey) {
            // Node 20 has a global FormData implementation.
            const form = new FormData();
            form.append('user_id', userId);
            form.append('resume_id', saved.id);
            form.append('file', new Blob([file.buffer as any], { type: file.mimetype }), file.originalname);
            await fetch(`${aiBase}/ai-interview/resumes`, {
                method: 'POST',
                // Let fetch set the multipart boundary.
                headers: { 'x-internal-key': aiKey },
                body: form as any,
            }).catch(() => null);
        }

        return saved;
    }

    async startSession(sessionId: string, userId: string) {
        const session = await this.sessionsRepo.findOne({ where: { id: sessionId, userId } });
        if (!session) throw new NotFoundException('Session not found');

        if (!session.resumeId) {
            // Resume is required for this product flow.
            throw new BadRequestException('Resume is required to start the interview');
        }

        const aiBase = this.configService.get<string>('AI_INTERVIEW_BASE_URL');
        const aiKey = this.configService.get<string>('AI_INTERVIEW_INTERNAL_KEY');
        if (aiBase && aiKey && session.externalSessionId) {
            await fetch(`${aiBase}/ai-interview/sessions/${session.externalSessionId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-key': aiKey,
                },
                body: JSON.stringify({
                    user_id: session.userId,
                    interview_session_id: session.interviewSessionId,
                }),
            }).catch(() => null);
        }

        session.status = 'in_progress';
        await this.sessionsRepo.save(session);
        return session;
    }
}
