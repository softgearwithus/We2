import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiInterviewSession } from './entities/ai-interview-session.entity';
import { AiInterviewReport } from './entities/ai-interview-report.entity';
import { AiInterviewModerationEvent } from './entities/ai-interview-moderation-event.entity';
import { ResumeDocument } from './entities/resume-document.entity';
import { InterviewSession } from '../interviews/entities/interview-session.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateAiInterviewDto } from './dto/create-ai-interview.dto';
import { InterviewsService } from '../interviews/interviews.service';
import { UsersService } from '../users/users.service';
import {
  InterviewDifficulty,
  InterviewStatus,
  InterviewType,
} from '../interviews/entities/interview-session.entity';
import type { InterviewerLaunchResult } from './interfaces/interviewer-launch-result.interface';

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
    private jwtService: JwtService,
    private interviewsService: InterviewsService,
    private usersService: UsersService,
  ) {}

  async createSession(userId: string, dto: CreateAiInterviewDto) {
    const parentSession = await this.interviewSessionsRepo.findOne({
      where: { id: dto.interviewSessionId, userId },
    });
    if (!parentSession) {
      throw new NotFoundException('Interview session not found');
    }

    const resumeDoc = await this.resumeRepo.findOne({
      where: { id: dto.resumeId, userId },
    });
    if (!resumeDoc) {
      throw new NotFoundException('Resume not found');
    }

    const session = this.sessionsRepo.create({
      userId,
      interviewSessionId: dto.interviewSessionId,
      resumeId: dto.resumeId,
      status: 'scheduled',
      timerSeconds: 900,
    });
    return this.sessionsRepo.save(session);
  }

  async launchInterview(
    userId: string,
    dto: CreateAiInterviewDto,
  ): Promise<InterviewerLaunchResult> {
    const parentSession = await this.interviewSessionsRepo.findOne({
      where: { id: dto.interviewSessionId, userId },
    });
    if (!parentSession) {
      throw new NotFoundException('Interview session not found');
    }

    const resumeDoc = await this.resumeRepo.findOne({
      where: { id: dto.resumeId, userId },
    });
    if (!resumeDoc) {
      throw new NotFoundException('Resume not found');
    }

    const resumeText = (resumeDoc.extractedText || '').trim();
    if (!resumeText) {
      throw new BadRequestException(
        'Resume text is not available. Please re-upload your resume before starting the interview.',
      );
    }

    await this.interviewsService.deductCredit(userId, 'video');

    parentSession.type = parentSession.type || InterviewType.TECHNICAL;
    parentSession.difficulty =
      dto.difficulty || parentSession.difficulty || InterviewDifficulty.INTERMEDIATE;
    parentSession.status = InterviewStatus.IN_PROGRESS;
    parentSession.startedAt = parentSession.startedAt || new Date();
    parentSession.aiInterviewerId = 'Emble Interviewer';
    parentSession.analysisProvider = 'ai-interviewer';
    parentSession.questions = [
      {
        context: dto.role || dto.company || 'Software Development Engineer',
      },
    ];
    await this.interviewSessionsRepo.save(parentSession);

    const upstream = await this.createUpstreamInterview({
      candidateName: this.resolveCandidateName(parentSession, resumeDoc),
      role: dto.role,
      company: dto.company,
      difficulty: dto.difficulty || parentSession.difficulty,
      resumeText,
      fileName: resumeDoc.fileName || 'resume.txt',
      fileType: resumeDoc.fileType || 'text/plain',
    });

    const localSession = this.sessionsRepo.create({
      userId,
      interviewSessionId: parentSession.id,
      resumeId: resumeDoc.id,
      status: 'scheduled',
      timerSeconds: 900,
      externalSessionId: upstream.sessionId,
      candidateJoinUrl: upstream.candidateJoinUrl,
    });
    const saved = await this.sessionsRepo.save(localSession);
    parentSession.externalCallId = saved.id;
    await this.interviewSessionsRepo.save(parentSession);

    return {
      candidateJoinUrl: upstream.candidateJoinUrl,
      upstreamSessionId: upstream.sessionId,
      localSessionId: saved.id,
      interviewSessionId: parentSession.id,
    };
  }

  async createTrustedLaunchUrl(userId: string): Promise<{ launchUrl: string }> {
    const user = await this.usersService.findById(userId);
    const isPro =
      user.isActive &&
      user.subscriptionStatus === 'active' &&
      user.subscriptionPlan === 'pro';

    if (!isPro) {
      throw new ForbiddenException('Active pro subscription required.');
    }

    const trustedLaunchSecret =
      this.configService.get<string>('AI_INTERVIEW_TRUSTED_LAUNCH_SECRET')?.trim() ||
      this.configService.get<string>('JWT_SECRET')?.trim();
    if (!trustedLaunchSecret) {
      throw new InternalServerErrorException('Trusted launch secret is not configured.');
    }

    const publicApiBase = this.getTrustedLaunchPublicApiBaseUrl();
    const nonce = randomUUID();
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        sessionVersion: Number(user.sessionVersion || 0),
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        nonce,
      },
      {
        secret: trustedLaunchSecret,
        expiresIn: '90s',
      },
    );

    return {
      launchUrl: `${publicApiBase}/api/v1/interviewer/trusted-launch?token=${encodeURIComponent(token)}`,
    };
  }

  async getReport(sessionId: string, userId: string) {
    const session = await this.findOwnedSession(sessionId, userId);
    if (!session) throw new NotFoundException('Session not found');

    const report = await this.reportsRepo.findOne({ where: { sessionId: session.id } });
    if (report) return report;

    const upstream = this.getUpstreamConfig();
    if (upstream && session.externalSessionId) {
      const res = await fetch(
        `${upstream.baseUrl}/api/v1/internal/interviews/${session.externalSessionId}/report?token=${encodeURIComponent(this.requireJoinTokenFromUrl(session.candidateJoinUrl))}`,
        {
          headers: { 'x-admin-key': upstream.adminKey },
        },
      ).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data) {
          const scoreBreakdown = this.mapDimensionScores(data);
          const recommendation = this.mapRecommendationList(data);

          session.status = String(data?.status || session.status || 'completed');
          session.terminationReason =
            typeof data?.termination_reason === 'string'
              ? data.termination_reason
              : session.terminationReason;
          session.candidateJoinUrl = session.candidateJoinUrl || null;
          await this.sessionsRepo.save(session);

          const created = this.reportsRepo.create({
            sessionId: session.id,
            overallScore: this.mapOverallScore(data),
            dimensionScores: scoreBreakdown,
            strengths: this.mapStringList(data.strengths),
            weaknesses: this.mapStringList(data.weaknesses),
            recommendations: recommendation,
            summary: this.mapSummary(data),
          });
          await this.reportsRepo.save(created);

          const parentSession = await this.interviewSessionsRepo.findOne({
            where: { id: session.interviewSessionId, userId },
          });
          if (parentSession) {
            parentSession.status = InterviewStatus.COMPLETED;
            if (typeof created.overallScore === 'number') {
              parentSession.overallScore = created.overallScore;
            }
            parentSession.analysisProvider = 'ai-interviewer';
            parentSession.analysis = {
              metrics: created.dimensionScores,
              summary: created.summary,
              feedback: [
                ...(created.strengths || []).map((text) => ({
                  type: 'strength',
                  text,
                })),
                ...(created.weaknesses || []).map((text) => ({
                  type: 'improvement',
                  text,
                })),
              ],
              raw: data,
              recommendation: created.recommendations,
              transcript: null,
            };
            parentSession.strengths = created.strengths;
            parentSession.improvements = created.weaknesses;
            parentSession.feedback = created.summary;
            await this.interviewSessionsRepo.save(parentSession);
          }
          return created;
        }
      }
    }

    throw new NotFoundException('Report not ready');
  }

  async saveExternalId(sessionId: string, externalId: string) {
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId },
    });
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

    saved.extractedText = await this.extractResumeText(file);
    saved.parseStatus = saved.extractedText ? 'parsed' : 'pending';
    await this.resumeRepo.save(saved);

    return saved;
  }

  async startSession(sessionId: string, userId: string) {
    const session = await this.findOwnedSession(sessionId, userId);
    if (!session) throw new NotFoundException('Session not found');

    if (!session.resumeId) {
      // Resume is required for this product flow.
      throw new BadRequestException(
        'Resume is required to start the interview',
      );
    }

    session.status = 'in_progress';
    await this.sessionsRepo.save(session);
    return session;
  }

  private async findOwnedSession(
    sessionId: string,
    userId: string,
  ): Promise<AiInterviewSession | null> {
    const byId = await this.sessionsRepo.findOne({
      where: { id: sessionId, userId },
    });
    if (byId) {
      return byId;
    }

    return this.sessionsRepo.findOne({
      where: { interviewSessionId: sessionId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  private getUpstreamConfig(): { baseUrl: string; adminKey: string } | null {
    const baseUrl = this.configService.get<string>('AI_INTERVIEW_BASE_URL')?.trim();
    const adminKey = this.configService
      .get<string>('AI_INTERVIEW_INTERNAL_KEY')
      ?.trim();

    if (!baseUrl || !adminKey) {
      return null;
    }

    return {
      baseUrl: baseUrl.replace(/\/+$/, ''),
      adminKey,
    };
  }

  private getTrustedLaunchPublicApiBaseUrl(): string {
    const explicit = this.configService
      .get<string>('AI_INTERVIEW_PUBLIC_API_URL')
      ?.trim();
    if (explicit) {
      return explicit.replace(/\/+$/, '');
    }

    const baseUrl = this.configService.get<string>('AI_INTERVIEW_BASE_URL')?.trim();
    if (!baseUrl) {
      throw new InternalServerErrorException('AI_INTERVIEW_BASE_URL is not configured.');
    }

    return baseUrl
      .replace('host.docker.internal', 'localhost')
      .replace('127.0.0.1', 'localhost')
      .replace(/\/+$/, '');
  }

  private async createUpstreamInterview(input: {
    candidateName: string;
    role?: string;
    company?: string;
    difficulty?: InterviewDifficulty;
    resumeText: string;
    fileName: string;
    fileType: string;
  }): Promise<{ sessionId: string; candidateJoinUrl: string }> {
    const upstream = this.getUpstreamConfig();
    if (!upstream) {
      throw new InternalServerErrorException(
        'AI_INTERVIEW_BASE_URL and AI_INTERVIEW_INTERNAL_KEY must be configured.',
      );
    }

    const form = new FormData();
    form.append('playbook_id', this.mapPlaybookId(input.role));
    form.append('candidate_name', input.candidateName);
    form.append(
      'job_description',
      this.buildJobDescription(input.role, input.company, input.difficulty),
    );
    form.append(
      'resume',
      new Blob([input.resumeText], { type: input.fileType || 'text/plain' }),
      this.ensureResumeFileName(input.fileName),
    );

    const response = await fetch(`${upstream.baseUrl}/api/v1/interviews`, {
      method: 'POST',
      headers: {
        'x-admin-key': upstream.adminKey,
      },
      body: form,
    }).catch((error) => {
      throw new InternalServerErrorException(
        `Failed to reach interviewer service: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `Interviewer launch failed (${response.status}): ${detail}`,
      );
    }

    const payload = (await response.json().catch(() => null)) as
      | { session_id?: string; candidate_join_url?: string }
      | null;

    if (!payload?.session_id || !payload?.candidate_join_url) {
      throw new InternalServerErrorException(
        'Interviewer service did not return a candidate join URL.',
      );
    }

    return {
      sessionId: payload.session_id,
      candidateJoinUrl: payload.candidate_join_url,
    };
  }

  private resolveCandidateName(parentSession: InterviewSession, resumeDoc: ResumeDocument): string {
    const context = Array.isArray(parentSession.questions)
      ? parentSession.questions.find((item) => typeof item?.candidateName === 'string')
      : null;
    const fromQuestion = typeof context?.candidateName === 'string' ? context.candidateName.trim() : '';
    if (fromQuestion) {
      return fromQuestion;
    }
    const fromFileName = (resumeDoc.fileName || '')
      .replace(/\.[^.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .trim();
    return fromFileName || 'Emble Candidate';
  }

  private buildJobDescription(
    role?: string,
    company?: string,
    difficulty?: InterviewDifficulty,
  ): string {
    const fragments = [
      role ? `Target role: ${role}.` : 'Target role: Software Development Engineer.',
      company ? `Target company: ${company}.` : '',
      difficulty ? `Difficulty: ${difficulty}.` : '',
      'Interview launched from the Emble student dashboard.',
    ].filter(Boolean);
    return fragments.join(' ');
  }

  private mapPlaybookId(role?: string): string {
    const normalized = (role || '').trim().toLowerCase();
    if (normalized.includes('frontend') || normalized.includes('react')) {
      return 'frontend_v1';
    }
    return 'sde_v1';
  }

  private ensureResumeFileName(fileName: string): string {
    const trimmed = fileName.trim();
    if (!trimmed) {
      return 'resume.txt';
    }
    return /\.[A-Za-z0-9]+$/.test(trimmed) ? trimmed : `${trimmed}.txt`;
  }

  private async extractResumeText(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype || '';
    const originalName = file.originalname || '';
    const isPdf = mimeType === 'application/pdf' || /\.pdf$/i.test(originalName);
    const isText = mimeType.startsWith('text/') || /\.(txt|md)$/i.test(originalName);

    if (!isPdf && !isText) {
      throw new BadRequestException(
        'Please upload your resume as a PDF file.',
      );
    }

    if (isPdf) {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = (await pdfParse(file.buffer)) as { text?: string };
      return (parsed.text || '').trim();
    }

    return file.buffer.toString('utf-8').trim();
  }

  private requireJoinTokenFromUrl(url: string | null): string {
    if (!url) {
      throw new InternalServerErrorException('Candidate join URL is missing.');
    }
    const parsed = new URL(url);
    const token = parsed.searchParams.get('token');
    if (!token) {
      throw new InternalServerErrorException('Candidate join token is missing.');
    }
    return token;
  }

  private mapOverallScore(data: any): number | null {
    const values = [
      data?.overall_score,
      data?.overallScore,
      data?.code_assessment?.evidence_score,
    ];
    for (const value of values) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.min(100, Math.round(value)));
      }
    }

    const signal = String(data?.code_assessment?.overall_signal || '').trim();
    if (signal === 'strong') return 84;
    if (signal === 'mixed') return 68;
    if (signal === 'weak') return 48;
    return null;
  }

  private mapDimensionScores(data: any): Record<string, number> | null {
    const codeAssessment = data?.code_assessment || {};
    const technical = this.scaleSignal(codeAssessment.overall_signal);
    const communication = this.scaleSignal(codeAssessment.transcript_signal);
    const evidence = typeof codeAssessment.evidence_score === 'number'
      ? Math.max(0, Math.min(100, Math.round(codeAssessment.evidence_score * 10)))
      : this.scaleSignal(data?.recommendation ? 'mixed' : '');

    const metrics: Record<string, number> = {
      technical,
      communication,
      problemSolving: evidence,
    };

    return Object.values(metrics).some((value) => value > 0) ? metrics : null;
  }

  private scaleSignal(signal: unknown): number {
    const normalized = String(signal || '').trim().toLowerCase();
    if (normalized === 'strong' || normalized === 'structured_solution' || normalized === 'substantive') return 84;
    if (normalized === 'mixed' || normalized === 'partial_solution' || normalized === 'limited') return 68;
    if (normalized === 'weak' || normalized === 'minimal_attempt' || normalized === 'none' || normalized === 'no_submission') return 42;
    return 0;
  }

  private mapStringList(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
      return null;
    }
    const items = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
    return items.length ? items : null;
  }

  private mapSummary(data: any): string | null {
    const summary = typeof data?.summary === 'string' ? data.summary.trim() : '';
    if (summary) {
      return summary;
    }
    const recommendation = typeof data?.recommendation === 'string'
      ? data.recommendation.trim()
      : '';
    return recommendation || null;
  }

  private mapRecommendationList(data: any): string[] | null {
    const recommendation = typeof data?.recommendation === 'string'
      ? data.recommendation.trim()
      : '';
    return recommendation ? [recommendation] : null;
  }
}
