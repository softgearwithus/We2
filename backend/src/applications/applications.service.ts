import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { InviteCandidateDto } from './dto/invite-candidate.dto';
import { UpdateCandidateReviewDto } from './dto/update-candidate-review.dto';
import { UpdateApplicationScreeningDto } from './dto/update-application-screening.dto';
import {
  RunPlacementScreeningDto,
  SchedulePlacementInterviewsDto,
} from './dto/run-placement-screening.dto';
import {
  DriveVerificationStatus,
  Placement,
  PlacementStatus,
} from '../placements/entities/placement.entity';
import { UserRole } from '../users/user.entity';
import {
  ApplicationStatus,
  ApplicationScreeningStatus,
  CandidatePipelineStage,
  CandidateReviewDecision,
  CandidateSource,
  StudentApplicationStatus,
} from './entities/application.entity';
import { HiringAssessment } from '../placements/entities/hiring-assessment.entity';
import { HiringAssessmentPlacementLink } from '../placements/entities/hiring-assessment-placement-link.entity';
import { EmailOtpService } from '../auth/services/email-otp.service';
import {
  ResumeAtsAnalysisResult,
  ResumeAtsService,
  ResumeParseResult,
} from '../resume/resume-ats.service';

type EmailDeliveryResult = {
  status: 'sent' | 'disabled' | 'failed';
  error?: string;
};

type InterviewLaunchResult = {
  status: 'ready' | 'disabled' | 'failed';
  sessionId?: string;
  candidateJoinUrl?: string;
  error?: string;
};

type ScreeningResult = {
  score: number;
  confidence: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  evidenceSnippets: Array<{ label: string; snippet: string }>;
  details: Record<string, any>;
};

const SCREENING_RESUME_TEXT_LIMIT = 35_000;
const SCREENING_TOKEN_LIMIT = 120;
const MIN_AUTOMATED_SCREENING_CONFIDENCE = 0.45;
const NON_ROLE_SCREENING_TOKENS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'our',
  'the',
  'their',
  'this',
  'to',
  'with',
  'work',
  'role',
  'candidate',
  'email',
  'phone',
  'name',
  'age',
  'gender',
  'male',
  'female',
  'photo',
  'location',
  'nationality',
  'citizen',
  'citizenship',
  'college',
  'university',
  'school',
  'institute',
  'campus',
  'iit',
  'nit',
  'gpa',
  'cgpa',
]);

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  private static readonly RESUME_ACCESS_ERROR =
    'Resume link must be accessible to anyone with the link.';

  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(Placement)
    private placementsRepository: Repository<Placement>,
    @InjectRepository(HiringAssessment)
    private assessmentsRepository: Repository<HiringAssessment>,
    @InjectRepository(HiringAssessmentPlacementLink)
    private assessmentLinksRepository: Repository<HiringAssessmentPlacementLink>,
    private readonly emailService: EmailOtpService,
    private readonly resumeAtsService: ResumeAtsService,
  ) {}

  private normalizeOptionalValue(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private getFrontendBaseUrl() {
    const configured = (process.env.FRONTEND_URL || '').split(',')[0]?.trim();
    return (configured || 'http://localhost:4000').replace(/\/$/, '');
  }

  private buildInviteUrl(placementId: string, token: string) {
    return `${this.getFrontendBaseUrl()}/dashboard/placement-drives/${placementId}/apply?invite=${token}`;
  }

  private getDefaultExpiry() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return expiresAt;
  }

  private getResumeStorageRoot() {
    return join(process.cwd(), 'private_uploads', 'application-resumes');
  }

  private getResumeStoragePath(storageKey: string) {
    return join(this.getResumeStorageRoot(), storageKey);
  }

  private sanitizeFileName(fileName?: string | null) {
    return String(fileName || 'resume.pdf')
      .replace(/[^\w.\-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 120) || 'resume.pdf';
  }

  private assertResumeUpload(file?: Express.Multer.File) {
    if (!file) return;
    const safeName = this.sanitizeFileName(file.originalname);
    const contentType = String(file.mimetype || '').toLowerCase();
    const isPdf =
      contentType === 'application/pdf' || safeName.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      throw new BadRequestException('Please upload your resume as a PDF file.');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Uploaded resume file is empty.');
    }
  }

  private async storeResumeUpload(file: Express.Multer.File) {
    this.assertResumeUpload(file);
    await fs.mkdir(this.getResumeStorageRoot(), { recursive: true });
    const safeName = this.sanitizeFileName(file.originalname);
    const storageKey = `${Date.now()}_${randomBytes(12).toString('hex')}_${safeName}`;
    await fs.writeFile(this.getResumeStoragePath(storageKey), file.buffer);
    return {
      storageKey,
      originalFileName: safeName,
      contentType: file.mimetype || 'application/pdf',
      size: file.size || file.buffer.length,
      sha256: createHash('sha256').update(file.buffer).digest('hex'),
    };
  }

  private async readStoredResume(storageKey: string) {
    const buffer = await fs.readFile(this.getResumeStoragePath(storageKey));
    return {
      buffer,
      contentType: 'application/pdf',
      fileName: storageKey.split('_').slice(2).join('_') || 'resume.pdf',
    };
  }

  private getResumeArtifact(application: Application) {
    return application.submissionArtifacts?.resumeAsset || null;
  }

  private hasApplicationResumeSource(application: Application) {
    return Boolean(
      this.getResumeArtifact(application)?.storageKey || application.resumeDriveUrl,
    );
  }

  private getInterviewerConfig(): { baseUrl: string; adminKey: string } | null {
    const baseUrl = process.env.AI_INTERVIEW_BASE_URL?.trim();
    const adminKey = process.env.AI_INTERVIEW_INTERNAL_KEY?.trim();
    if (!baseUrl || !adminKey) {
      return null;
    }

    return {
      baseUrl: baseUrl.replace(/\/+$/, ''),
      adminKey,
    };
  }

  private mapPlaybookId(placement: Placement): string {
    const roleText = [
      placement.title,
      placement.jobProfile,
      ...(placement.skillsRequired || []),
      ...(placement.roles || []),
    ]
      .join(' ')
      .toLowerCase();

    if (
      roleText.includes('frontend') ||
      roleText.includes('react') ||
      roleText.includes('next')
    ) {
      return 'frontend_v1';
    }

    return 'sde_v1';
  }

  private buildInterviewJobDescription(
    placement: Placement,
    assessment?: HiringAssessment | null,
  ): string {
    const lines = [
      `Target role: ${placement.title}.`,
      placement.companyName ? `Company: ${placement.companyName}.` : '',
      placement.jobProfile ? `Job profile: ${placement.jobProfile}.` : '',
      placement.description ? `Job description: ${placement.description}` : '',
      placement.skillsRequired?.length
        ? `Skills: ${placement.skillsRequired.join(', ')}.`
        : '',
      placement.githubRepositoryUrl
        ? `GitHub repository context: ${placement.githubRepositoryUrl}`
        : '',
      placement.issueTrackerUrl
        ? `Issue or ticket context: ${placement.issueTrackerUrl}`
        : '',
      placement.documentationUrl
        ? `Documentation context: ${placement.documentationUrl}`
        : '',
      placement.workContext ? `Work context: ${placement.workContext}` : '',
      placement.pipelineNotes
        ? `Pipeline notes: ${placement.pipelineNotes}`
        : '',
      assessment?.instructions
        ? `Attached assessment instructions: ${assessment.instructions}`
        : '',
      assessment?.prompt ? `Assessment prompt: ${assessment.prompt}` : '',
      assessment?.contextSources?.length
        ? `Assessment context sources:\n${assessment.contextSources
            .map((source) =>
              [
                source.label || source.type,
                source.url,
                source.content,
                source.metadata ? JSON.stringify(source.metadata) : '',
              ]
                .filter(Boolean)
                .join(' - '),
            )
            .join('\n')}`
        : '',
      assessment?.files?.length
        ? `Assessment files:\n${assessment.files
            .slice(0, 5)
            .map(
              (file) =>
                `### ${file.path}\n${String(file.content || '').slice(0, 4000)}`,
            )
            .join('\n\n')}`
        : '',
      'This interview was launched from the Emble company hiring pipeline. Use the role context as grounding for question focus.',
    ].filter(Boolean);

    return lines.join('\n');
  }

  private async downloadResumeForInterviewer(resourceId: string) {
    const response = await fetch(
      `https://drive.google.com/uc?export=download&id=${resourceId}`,
      {
        method: 'GET',
        redirect: 'follow',
        headers: {
          Accept: '*/*',
          'User-Agent': 'EmbleInterviewerLauncher/1.0',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Resume download failed with status ${response.status}.`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType =
      response.headers.get('content-type') || 'application/pdf';

    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
      fileName: contentType.includes('pdf') ? 'resume.pdf' : 'resume.txt',
    };
  }

  private limitText(value: string, maxLength = SCREENING_RESUME_TEXT_LIMIT) {
    const normalized = (value || '').replace(/\r\n/g, '\n').trim();
    return normalized.length > maxLength
      ? normalized.slice(0, maxLength).trim()
      : normalized;
  }

  private async extractResumeTextPreview(resourceId: string) {
    try {
      const resume = await this.downloadResumeForInterviewer(resourceId);
      const contentType = resume.contentType.toLowerCase();
      if (contentType.includes('pdf') || resume.fileName.endsWith('.pdf')) {
        const parsed = await this.resumeAtsService.extractPdfText(resume.buffer);
        return {
          text: this.limitText(parsed.text || ''),
          contentType: resume.contentType,
          extractionStatus: parsed.extractionStatus,
          extractionError: parsed.extractionError || null,
        };
      }

      if (
        contentType.includes('text/') ||
        contentType.includes('json') ||
        contentType.includes('xml') ||
        contentType.includes('html')
      ) {
        return {
          text: this.limitText(resume.buffer.toString('utf8')),
          contentType: resume.contentType,
          extractionStatus: 'parsed',
        };
      }

      return {
        text: '',
        contentType: resume.contentType,
        extractionStatus: 'unsupported',
      };
    } catch (error) {
      return {
        text: '',
        contentType: null,
        extractionStatus: 'failed',
        extractionError:
          error instanceof Error ? error.message.slice(0, 400) : 'failed',
      };
    }
  }

  private getPlacementRequiredSkills(placement: Placement) {
    return Array.from(
      new Set([...(placement.skillsRequired || []), ...(placement.roles || [])]),
    ).filter(Boolean);
  }

  private async analyzeResumeForPlacement(input: {
    resumeText: string;
    parseStatus?: ResumeParseResult['extractionStatus'];
    placement: Placement;
    assessment?: HiringAssessment | null;
  }) {
    return this.resumeAtsService.analyzeText({
      resumeText: input.resumeText,
      jobDescription: this.buildScreeningKeywordContext(
        input.placement,
        input.assessment,
      ),
      requiredSkills: this.getPlacementRequiredSkills(input.placement),
      roleContext: this.buildInterviewJobDescription(
        input.placement,
        input.assessment,
      ),
      useAi: true,
      parseStatus: input.parseStatus,
    });
  }

  private buildResumeArtifact(input: {
    source: 'upload' | 'google_drive';
    storage?: {
      storageKey: string;
      originalFileName: string;
      contentType: string;
      size: number;
      sha256: string;
    };
    drive?: { resumeDriveUrl: string; resourceId: string };
    parsed: ResumeParseResult;
    analysis: ResumeAtsAnalysisResult;
  }) {
    return {
      source: input.source,
      storageKey: input.storage?.storageKey || null,
      originalFileName:
        input.storage?.originalFileName ||
        (input.source === 'google_drive' ? 'Google Drive resume' : 'resume.pdf'),
      contentType: input.storage?.contentType || input.parsed.contentType,
      size: input.storage?.size || null,
      sha256: input.storage?.sha256 || null,
      resumeDriveUrl: input.drive?.resumeDriveUrl || null,
      resumeResourceId: input.drive?.resourceId || null,
      extractionStatus: input.parsed.extractionStatus,
      extractionError: input.parsed.extractionError || null,
      extractedAt: new Date().toISOString(),
      textPreview: input.parsed.text,
      atsResult: input.analysis,
    };
  }

  private async prepareApplicationResume(input: {
    file?: Express.Multer.File;
    resumeDriveUrl?: string | null;
    placement: Placement;
    assessment?: HiringAssessment | null;
  }) {
    if (input.file) {
      const storage = await this.storeResumeUpload(input.file);
      const parsed = await this.resumeAtsService.extractPdfText(input.file.buffer);
      const analysis = await this.analyzeResumeForPlacement({
        resumeText: parsed.text,
        parseStatus: parsed.extractionStatus,
        placement: input.placement,
        assessment: input.assessment,
      });
      return {
        resumeDriveUrl: this.normalizeOptionalValue(input.resumeDriveUrl),
        resourceId: null,
        parsed,
        analysis,
        artifact: this.buildResumeArtifact({
          source: 'upload',
          storage,
          parsed,
          analysis,
        }),
      };
    }

    const normalizedUrl = this.normalizeOptionalValue(input.resumeDriveUrl);
    if (!normalizedUrl) {
      throw new BadRequestException('Upload a PDF resume or provide a Google Drive resume link.');
    }
    const { parsedUrl, resourceId } = this.parseGoogleDriveResumeUrl(normalizedUrl);
    await this.assertPublicResumeLink(resourceId);
    const extracted = await this.extractResumeTextPreview(resourceId);
    const parsed: ResumeParseResult = {
      text: extracted.text,
      contentType: extracted.contentType,
      extractionStatus: extracted.extractionStatus as ResumeParseResult['extractionStatus'],
      extractionError: extracted.extractionError || null,
    };
    const analysis = await this.analyzeResumeForPlacement({
      resumeText: parsed.text,
      parseStatus: parsed.extractionStatus,
      placement: input.placement,
      assessment: input.assessment,
    });
    return {
      resumeDriveUrl: parsedUrl.toString(),
      resourceId,
      parsed,
      analysis,
      artifact: this.buildResumeArtifact({
        source: 'google_drive',
        drive: { resumeDriveUrl: parsedUrl.toString(), resourceId },
        parsed,
        analysis,
      }),
    };
  }

  private getApplicationResumeText(application: Application) {
    const artifacts = application.submissionArtifacts || {};
    const assetText = artifacts.resumeAsset?.textPreview;
    if (typeof assetText === 'string' && assetText.trim()) {
      return assetText;
    }
    return typeof artifacts.resumeTextPreview === 'string'
      ? artifacts.resumeTextPreview
      : '';
  }

  private async ensureResumeTextPreview(application: Application) {
    const existing = this.getApplicationResumeText(application);
    if (existing.trim()) {
      return existing;
    }

    const resumeAsset = this.getResumeArtifact(application);
    if (resumeAsset?.storageKey) {
      try {
        const resume = await this.readStoredResume(resumeAsset.storageKey);
        const parsed = await this.resumeAtsService.extractPdfText(resume.buffer);
        application.submissionArtifacts = {
          ...(application.submissionArtifacts || {}),
          resumeAsset: {
            ...resumeAsset,
            extractionStatus: parsed.extractionStatus,
            extractionError: parsed.extractionError || null,
            extractedAt: new Date().toISOString(),
            textPreview: parsed.text,
          },
          resumeTextPreview: parsed.text,
          resumeContentType: parsed.contentType,
          resumeExtractionStatus: parsed.extractionStatus,
          resumeExtractionError: parsed.extractionError || null,
          resumeExtractedAt: new Date().toISOString(),
        };
        await this.applicationsRepository.save(application);
        return parsed.text;
      } catch {
        return '';
      }
    }

    if (!application.resumeDriveUrl) {
      return '';
    }

    try {
      const { resourceId } = this.parseGoogleDriveResumeUrl(
        application.resumeDriveUrl,
      );
      const extracted = await this.extractResumeTextPreview(resourceId);
      application.submissionArtifacts = {
        ...(application.submissionArtifacts || {}),
        resumeTextPreview: extracted.text,
        resumeContentType: extracted.contentType,
        resumeExtractionStatus: extracted.extractionStatus,
        resumeExtractionError: extracted.extractionError || null,
        resumeExtractedAt: new Date().toISOString(),
      };
      await this.applicationsRepository.save(application);
      return extracted.text;
    } catch {
      return '';
    }
  }

  private tokenize(value: string) {
    return Array.from(
      new Set(
        (value || '')
          .toLowerCase()
          .replace(/[^a-z0-9+#.\s-]/g, ' ')
          .split(/\s+/)
          .map((token) => token.trim())
          .filter(
            (token) =>
              ((token.length >= 2 && token.length <= 40) ||
                token === 'c' ||
                token === 'r') &&
              !NON_ROLE_SCREENING_TOKENS.has(token),
          ),
      ),
    );
  }

  private normalizeSkill(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private skillMatches(skill: string, resumeText: string, resumeTokens: Set<string>) {
    const normalized = this.normalizeSkill(skill);
    if (!normalized) return false;
    if (NON_ROLE_SCREENING_TOKENS.has(normalized)) return false;
    if (normalized.length === 1) {
      return new RegExp(`(^|[^a-z0-9+#.])${this.escapeRegExp(normalized)}(?=[^a-z0-9+#.]|$)`).test(resumeText);
    }
    if (resumeText.includes(normalized)) return true;
    const parts = normalized
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length) return false;
    return parts.every((part) => resumeTokens.has(part));
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private collectAssessmentContext(assessment?: HiringAssessment | null) {
    if (!assessment) return '';
    const sources = Array.isArray(assessment.contextSources)
      ? assessment.contextSources
          .map((source) =>
            [
              source.label,
              source.type,
              source.content,
              source.metadata ? JSON.stringify(source.metadata) : '',
            ]
              .filter(Boolean)
              .join(' '),
          )
          .join(' ')
      : '';
    const files = Array.isArray(assessment.files)
      ? assessment.files
          .slice(0, 8)
          .map((file) => `${file.path} ${file.content || ''}`)
          .join(' ')
      : '';
    return [
      assessment.name,
      assessment.language,
      assessment.prompt,
      assessment.instructions,
      sources,
      files,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private buildScreeningKeywordContext(
    placement: Placement,
    assessment?: HiringAssessment | null,
  ) {
    return [
      placement.title,
      placement.jobProfile,
      placement.description,
      placement.workContext,
      placement.pipelineNotes,
      placement.githubRepositoryUrl,
      placement.documentationUrl,
      ...(placement.roles || []),
      ...(placement.skillsRequired || []),
      this.collectAssessmentContext(assessment),
    ]
      .filter(Boolean)
      .join(' ');
  }

  private calculateDeterministicScreening(input: {
    application: Application;
    placement: Placement;
    assessment?: HiringAssessment | null;
    resumeText: string;
  }): ScreeningResult {
    const resumeBasis = [
      input.resumeText,
      input.application.candidateDepartment,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const resumeTokens = new Set(this.tokenize(resumeBasis));
    const requiredSkills = Array.from(
      new Set([...(input.placement.skillsRequired || []), ...(input.placement.roles || [])])
    ).filter(Boolean);
    const matchedSkills = requiredSkills.filter((skill) =>
      this.skillMatches(skill, resumeBasis, resumeTokens),
    );
    const missingSkills = requiredSkills.filter(
      (skill) => !matchedSkills.includes(skill),
    );

    const roleTokens = this.tokenize(
      this.buildScreeningKeywordContext(input.placement, null),
    ).slice(0, SCREENING_TOKEN_LIMIT);
    const assessmentTokens = this.tokenize(
      this.collectAssessmentContext(input.assessment),
    ).slice(0, SCREENING_TOKEN_LIMIT);
    const roleHits = roleTokens.filter((token) => resumeTokens.has(token));
    const assessmentHits = assessmentTokens.filter((token) =>
      resumeTokens.has(token),
    );

    const skillScore = requiredSkills.length
      ? (matchedSkills.length / requiredSkills.length) * 60
      : roleHits.length
        ? 45
        : 25;
    const roleScore = roleTokens.length
      ? Math.min(25, (roleHits.length / Math.max(12, roleTokens.length)) * 45)
      : 10;
    const assessmentScore = assessmentTokens.length
      ? Math.min(
          15,
          (assessmentHits.length / Math.max(10, assessmentTokens.length)) * 28,
        )
      : 8;
    const evidenceBonus = input.resumeText.trim().length > 500 ? 5 : 0;
    const score = Math.max(
      0,
      Math.min(100, Math.round(skillScore + roleScore + assessmentScore + evidenceBonus)),
    );
    const summaryParts = [
      matchedSkills.length
        ? `Matched ${matchedSkills.length} required skill${matchedSkills.length === 1 ? '' : 's'}: ${matchedSkills.slice(0, 8).join(', ')}.`
        : 'No required skills were clearly matched from the available resume text.',
      missingSkills.length
        ? `Missing or unclear: ${missingSkills.slice(0, 8).join(', ')}.`
        : 'No required skill gaps were detected by the deterministic screen.',
      roleHits.length
        ? `Role keyword evidence includes ${roleHits.slice(0, 8).join(', ')}.`
        : 'Role keyword evidence is limited.',
    ];

    return {
      score,
      confidence: input.resumeText.trim().length > 500 ? 0.65 : 0.35,
      matchedSkills,
      missingSkills,
      summary: summaryParts.join(' '),
      evidenceSnippets: matchedSkills
        .slice(0, 8)
        .map((skill) => ({
          label: skill,
          snippet: this.limitText(input.resumeText, 240),
        })),
      details: {
        method: 'deterministic_keyword_v1',
        confidence: input.resumeText.trim().length > 500 ? 0.65 : 0.35,
        roleKeywordHits: roleHits.slice(0, 30),
        assessmentKeywordHits: assessmentHits.slice(0, 30),
        requiredSkills,
        resumeTextAvailable: Boolean(input.resumeText.trim()),
      },
    };
  }

  private buildScreeningFromAts(input: {
    ats: ResumeAtsAnalysisResult;
    parseStatus?: string | null;
    parseError?: string | null;
  }): ScreeningResult {
    const manualReview =
      Boolean(input.parseStatus && input.parseStatus !== 'parsed') ||
      input.ats.confidence < MIN_AUTOMATED_SCREENING_CONFIDENCE;
    return {
      score: input.ats.score,
      confidence: input.ats.confidence,
      matchedSkills: input.ats.matchedSkills || [],
      missingSkills: input.ats.missingSkills || [],
      summary: manualReview
        ? `${input.ats.summary} Manual review is required before any rejection because resume parse confidence is low.`
        : input.ats.summary,
      evidenceSnippets: input.ats.evidenceSnippets || [],
      details: {
        method: input.ats.method,
        confidence: input.ats.confidence,
        evidenceSnippets: input.ats.evidenceSnippets || [],
        strengths: input.ats.strengths || [],
        weaknesses: input.ats.weaknesses || [],
        suggestions: input.ats.suggestions || [],
        parseStatus: input.parseStatus || null,
        parseError: input.parseError || null,
        manualReview,
        lowConfidence: input.ats.confidence < MIN_AUTOMATED_SCREENING_CONFIDENCE,
        guardrails: {
          protectedTraitsExcluded: true,
          evidenceRequiredForMatchedSkills: true,
          noAutoRejectOnParseFailure: true,
        },
      },
    };
  }

  private buildManualReviewScreening(reason: string): ScreeningResult {
    return {
      score: 0,
      confidence: 0,
      matchedSkills: [],
      missingSkills: [],
      summary: reason,
      evidenceSnippets: [],
      details: {
        method: 'manual_review_required',
        confidence: 0,
        manualReview: true,
        lowConfidence: true,
        parseStatus: 'missing',
        guardrails: {
          protectedTraitsExcluded: true,
          noAutoRejectOnParseFailure: true,
        },
      },
    };
  }

  private async launchCandidateInterview(
    application: Application,
    placement: Placement,
    resume: { buffer: Buffer; contentType: string; fileName: string },
    assessment?: HiringAssessment | null,
  ): Promise<InterviewLaunchResult> {
    const config = this.getInterviewerConfig();
    if (!config) {
      return {
        status: 'disabled',
        error:
          'AI_INTERVIEW_BASE_URL and AI_INTERVIEW_INTERNAL_KEY are not configured.',
      };
    }

    try {
      const form = new FormData();
      form.append('playbook_id', this.mapPlaybookId(placement));
      form.append(
        'candidate_name',
        application.candidateName || application.candidateEmail || 'Candidate',
      );
      form.append(
        'job_description',
        this.buildInterviewJobDescription(placement, assessment),
      );
      const resumeBytes = new Uint8Array(resume.buffer.length);
      resumeBytes.set(resume.buffer);
      form.append(
        'resume',
        new Blob([resumeBytes.buffer], { type: resume.contentType }),
        resume.fileName,
      );

      const response = await fetch(`${config.baseUrl}/api/v1/interviews`, {
        method: 'POST',
        headers: {
          'x-admin-key': config.adminKey,
        },
        body: form,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(
          `Interviewer launch failed (${response.status}): ${detail}`,
        );
      }

      const payload = (await response.json().catch(() => null)) as
        | { session_id?: string; candidate_join_url?: string }
        | null;

      if (!payload?.session_id || !payload?.candidate_join_url) {
        throw new Error('Interviewer did not return a candidate join URL.');
      }

      return {
        status: 'ready',
        sessionId: payload.session_id,
        candidateJoinUrl: payload.candidate_join_url,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Interview launch failed.';
      this.logger.warn(
        `Candidate interview automation failed for application ${application.id}: ${message}`,
      );
      return { status: 'failed', error: message };
    }
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private async sendCandidateLinkEmail(input: {
    to: string;
    candidateName?: string | null;
    roleTitle: string;
    companyName?: string | null;
    linkUrl: string;
    linkLabel: string;
  }): Promise<EmailDeliveryResult> {
    try {
      const candidateName = input.candidateName?.trim() || 'Candidate';
      const companyName = input.companyName?.trim() || 'the hiring team';
      const subject = `${input.roleTitle} hiring link from Emble`;
      const plainText = [
        `Hi ${candidateName},`,
        '',
        `${companyName} has shared your ${input.roleTitle} hiring link through Emble.`,
        `${input.linkLabel}: ${input.linkUrl}`,
        '',
        'Please open the link and complete the next step before it expires.',
      ].join('\n');
      const safeLink = this.escapeHtml(input.linkUrl);
      const html = `
        <html>
          <body>
            <h2>${this.escapeHtml(input.roleTitle)} hiring link</h2>
            <p>Hi ${this.escapeHtml(candidateName)},</p>
            <p>${this.escapeHtml(companyName)} has shared your next hiring step through Emble.</p>
            <p><a href="${safeLink}">${this.escapeHtml(input.linkLabel)}</a></p>
            <p>Please complete it before the link expires.</p>
          </body>
        </html>`;

      const delivery = await this.emailService.sendTransactionalEmail({
        to: input.to,
        subject,
        plainText,
        html,
      });
      return delivery.status === 'sent'
        ? { status: 'sent' }
        : { status: 'failed', error: delivery.error || 'Email failed.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Email delivery failed.';
      this.logger.warn(`Candidate email failed: ${message}`);
      return { status: 'failed', error: message };
    }
  }

  private addEmailNotificationArtifact(
    application: Application,
    notification: {
      type: 'assessment_invite' | 'interview_invite' | 'rejection';
      status: EmailDeliveryResult['status'];
      reason?: string;
      error?: string | null;
      sentAt?: string | null;
    },
  ) {
    const artifacts = application.submissionArtifacts || {};
    const existing = Array.isArray(artifacts.emailNotifications)
      ? artifacts.emailNotifications
      : [];
    application.submissionArtifacts = {
      ...artifacts,
      emailNotifications: [
        ...existing.slice(-14),
        {
          ...notification,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  private hasSentEmailNotification(
    application: Application,
    type: 'assessment_invite' | 'interview_invite' | 'rejection',
  ) {
    const notifications = application.submissionArtifacts?.emailNotifications;
    return Array.isArray(notifications)
      ? notifications.some(
          (notification) =>
            notification?.type === type && notification?.status === 'sent',
        )
      : false;
  }

  private async sendCandidateRejectionEmail(
    application: Application,
    placement: Placement,
    reason: 'resume_screening' | 'manual_review' | 'interview',
  ): Promise<EmailDeliveryResult> {
    if (!application.candidateEmail) {
      return { status: 'disabled', error: 'Candidate email is missing.' };
    }
    if (this.hasSentEmailNotification(application, 'rejection')) {
      return { status: 'sent' };
    }

    const candidateName = application.candidateName?.trim() || 'Candidate';
    const companyName = placement.companyName?.trim() || 'the hiring team';
    const reasonLine =
      reason === 'resume_screening'
        ? 'After reviewing your profile against the role requirements, we are not moving forward with the next round.'
        : reason === 'interview'
          ? 'After reviewing your interview outcome, we are not moving forward with the next round.'
          : 'After reviewing your application, we are not moving forward with the next round.';
    const subject = `${placement.title} application update from Emble`;
    const plainText = [
      `Hi ${candidateName},`,
      '',
      `Thank you for your interest in ${placement.title} at ${companyName}.`,
      reasonLine,
      '',
      'We appreciate the time you spent with the process and wish you the best for your next opportunity.',
      '',
      'Emble Hiring',
    ].join('\n');
    const html = `
      <html>
        <body>
          <p>Hi ${this.escapeHtml(candidateName)},</p>
          <p>Thank you for your interest in <strong>${this.escapeHtml(placement.title)}</strong> at ${this.escapeHtml(companyName)}.</p>
          <p>${this.escapeHtml(reasonLine)}</p>
          <p>We appreciate the time you spent with the process and wish you the best for your next opportunity.</p>
          <p>Emble Hiring</p>
        </body>
      </html>`;

    const delivery = await this.emailService.sendTransactionalEmail({
      to: application.candidateEmail,
      subject,
      plainText,
      html,
    });
    const normalized: EmailDeliveryResult =
      delivery.status === 'sent'
        ? { status: 'sent' }
        : { status: 'failed', error: delivery.error || 'Email failed.' };
    this.addEmailNotificationArtifact(application, {
      type: 'rejection',
      reason,
      status: normalized.status,
      error: normalized.error || null,
      sentAt: normalized.status === 'sent' ? new Date().toISOString() : null,
    });
    return normalized;
  }

  private getEffectivePipelineStage(application: Application) {
    if (
      application.pipelineStage === CandidatePipelineStage.INVITED &&
      application.expiresAt &&
      application.expiresAt.getTime() < Date.now()
    ) {
      return CandidatePipelineStage.EXPIRED;
    }

    return application.pipelineStage;
  }

  private withEffectivePipelineStage(application: Application) {
    return {
      ...application,
      submissionArtifacts: this.serializeSubmissionArtifacts(
        application.submissionArtifacts,
      ),
      effectivePipelineStage: this.getEffectivePipelineStage(application),
      studentFacingStatus:
        application.studentFacingStatus ||
        this.deriveStudentFacingStatus(application),
    };
  }

  private serializeSubmissionArtifacts(artifacts?: Record<string, any> | null) {
    if (!artifacts) return artifacts;
    const { resumeTextPreview, ...rest } = artifacts;
    const resumeAsset = artifacts.resumeAsset
      ? {
          source: artifacts.resumeAsset.source || null,
          originalFileName: artifacts.resumeAsset.originalFileName || null,
          contentType: artifacts.resumeAsset.contentType || null,
          size: artifacts.resumeAsset.size || null,
          resumeDriveUrl: artifacts.resumeAsset.resumeDriveUrl || null,
          extractionStatus: artifacts.resumeAsset.extractionStatus || null,
          extractionError: artifacts.resumeAsset.extractionError || null,
          extractedAt: artifacts.resumeAsset.extractedAt || null,
          atsResult: artifacts.resumeAsset.atsResult || null,
        }
      : undefined;
    return {
      ...rest,
      resumeTextPreview: undefined,
      resumeAsset,
    };
  }

  private deriveStudentFacingStatus(application: Application) {
    if (application.submittedAt && application.candidateJoinUrl) {
      return StudentApplicationStatus.INTERVIEW_INVITED;
    }
    if (application.pipelineStage === CandidatePipelineStage.REJECTED) {
      return StudentApplicationStatus.REJECTED;
    }
    if (application.pipelineStage === CandidatePipelineStage.IN_PROGRESS) {
      return StudentApplicationStatus.INTERVIEW_INVITED;
    }
    if (
      application.pipelineStage === CandidatePipelineStage.ADVANCED ||
      application.reviewDecision === CandidateReviewDecision.ADVANCE
    ) {
      return StudentApplicationStatus.SHORTLISTED;
    }
    return StudentApplicationStatus.APPLIED;
  }

  private markStudentStatus(application: Application) {
    application.studentFacingStatus = this.deriveStudentFacingStatus(application);
  }

  private async findPlacementForActor(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const placement = await this.placementsRepository.findOne({
      where: { id: placementId },
    });
    if (!placement) throw new NotFoundException('Drive not found');
    if (actorRole === UserRole.COMPANY_ADMIN && placement.companyId !== actorId)
      throw new ForbiddenException('Access denied. You do not own this drive.');
    return placement;
  }

  private async findApplicationForActor(
    applicationId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['placement', 'student', 'assessment'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      actorRole === UserRole.COMPANY_ADMIN &&
      application.placement?.companyId !== actorId
    ) {
      throw new ForbiddenException(
        'Access denied. You do not own this drive application.',
      );
    }

    return application;
  }

  private mapStageToLegacyStatus(stage: CandidatePipelineStage) {
    switch (stage) {
      case CandidatePipelineStage.IN_PROGRESS:
        return ApplicationStatus.INTERVIEWING;
      case CandidatePipelineStage.PENDING_REVIEW:
        return ApplicationStatus.REVIEWING;
      case CandidatePipelineStage.ADVANCED:
        return ApplicationStatus.OFFERED;
      case CandidatePipelineStage.REJECTED:
      case CandidatePipelineStage.EXPIRED:
        return ApplicationStatus.REJECTED;
      case CandidatePipelineStage.INVITED:
      default:
        return ApplicationStatus.APPLIED;
    }
  }

  private mapLegacyStatusToStage(status: ApplicationStatus) {
    switch (status) {
      case ApplicationStatus.REVIEWING:
        return CandidatePipelineStage.PENDING_REVIEW;
      case ApplicationStatus.INTERVIEWING:
        return CandidatePipelineStage.IN_PROGRESS;
      case ApplicationStatus.OFFERED:
        return CandidatePipelineStage.ADVANCED;
      case ApplicationStatus.REJECTED:
        return CandidatePipelineStage.REJECTED;
      case ApplicationStatus.APPLIED:
      default:
        return CandidatePipelineStage.PENDING_REVIEW;
    }
  }

  private parseGoogleDriveResumeUrl(rawUrl: string): {
    parsedUrl: URL;
    resourceId: string;
  } {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(rawUrl.trim());
    } catch {
      throw new BadRequestException('Resume link must be a valid URL.');
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Resume link must start with https://.');
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname !== 'drive.google.com') {
      throw new BadRequestException(
        'Resume link must use the drive.google.com domain.',
      );
    }

    const fileMatch = parsedUrl.pathname.match(/^\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) {
      return {
        parsedUrl,
        resourceId: fileMatch[1],
      };
    }

    const sharedId = parsedUrl.searchParams.get('id');
    if (
      sharedId &&
      (parsedUrl.pathname === '/open' || parsedUrl.pathname === '/uc')
    ) {
      return {
        parsedUrl,
        resourceId: sharedId,
      };
    }

    throw new BadRequestException(
      'Resume link must be a valid public Google Drive file URL.',
    );
  }

  private async assertPublicResumeLink(resourceId: string) {
    const probeUrl = `https://drive.google.com/uc?export=download&id=${resourceId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(probeUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          Accept: '*/*',
          'User-Agent': 'EmbleResumeValidator/1.0',
        },
      });

      const finalUrl = response.url.toLowerCase();
      if (
        finalUrl.includes('accounts.google.com') ||
        finalUrl.includes('servicelogin')
      ) {
        throw new BadRequestException(
          ApplicationsService.RESUME_ACCESS_ERROR,
        );
      }

      if (!response.ok) {
        throw new BadRequestException(
          ApplicationsService.RESUME_ACCESS_ERROR,
        );
      }

      const contentType =
        response.headers.get('content-type')?.toLowerCase() || '';
      if (
        !contentType.includes('text/html') &&
        !contentType.includes('text/plain')
      ) {
        return;
      }

      const body = (await response.text()).slice(0, 8000).toLowerCase();
      const restrictedMarkers = [
        'you need access',
        'request access',
        'sign in',
        'access denied',
        'unable to open the file at this time',
        'file does not exist',
        'document is not published',
        'quota exceeded',
      ];

      if (restrictedMarkers.some((marker) => body.includes(marker))) {
        throw new BadRequestException(
          ApplicationsService.RESUME_ACCESS_ERROR,
        );
      }

      const publicMarkers = [
        'google drive',
        'google docs',
        'download anyway',
        'virus scan warning',
        'open with google docs',
      ];

      if (!publicMarkers.some((marker) => body.includes(marker))) {
        throw new BadRequestException(
          'Resume link could not be verified as public. Please recheck the Google Drive sharing settings.',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new BadRequestException(
          'Resume link validation timed out. Please try again with a valid public Google Drive link.',
        );
      }

      throw new BadRequestException(
        'Unable to validate the resume link right now. Please try again.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  async apply(
    studentId: string,
    createDto: CreateApplicationDto,
    resumeFile?: Express.Multer.File,
  ) {
    const placement = await this.placementsRepository.findOne({
      where: { id: createDto.placementId },
    });
    if (!placement) {
      throw new NotFoundException('Placement drive not found.');
    }

    if (
      placement.verificationStatus !== DriveVerificationStatus.APPROVED ||
      placement.status !== PlacementStatus.ACTIVE
    ) {
      throw new ForbiddenException(
        'Applications are open only for approved active drives.',
      );
    }

    let invitedApplication: Application | null = null;
    const inviteToken = this.normalizeOptionalValue(createDto.inviteToken);
    if (inviteToken) {
      invitedApplication = await this.applicationsRepository.findOne({
        where: {
          placementId: createDto.placementId,
          inviteToken,
        },
      });
      if (!invitedApplication) {
        throw new BadRequestException('Invite link is invalid.');
      }
      if (
        invitedApplication.expiresAt &&
        invitedApplication.expiresAt.getTime() < Date.now()
      ) {
        invitedApplication.pipelineStage = CandidatePipelineStage.EXPIRED;
        invitedApplication.status = ApplicationStatus.REJECTED;
        await this.applicationsRepository.save(invitedApplication);
        throw new BadRequestException('Invite link has expired.');
      }
    }

    // Prevent duplicate applications
    const existing = await this.applicationsRepository.findOne({
      where: { studentId, placementId: createDto.placementId },
    });
    if (existing && existing.id !== invitedApplication?.id)
      throw new ConflictException('You have already applied to this drive.');

    const defaultAssessment = await this.findDefaultAssessmentForPlacement(
      placement.id,
    );
    const preparedResume = await this.prepareApplicationResume({
      file: resumeFile,
      resumeDriveUrl: createDto.resumeDriveUrl,
      placement,
      assessment: defaultAssessment,
    });

    const app = invitedApplication || this.applicationsRepository.create();
    app.studentId = studentId;
    app.placementId = createDto.placementId;
    app.assessmentId = app.assessmentId || defaultAssessment?.id || null;
    app.candidateName = createDto.candidateName.trim();
    app.candidateEmail = createDto.candidateEmail.trim().toLowerCase();
    app.candidatePhone = createDto.candidatePhone.trim();
    app.candidateDepartment = this.normalizeOptionalValue(
      createDto.candidateDepartment,
    );
    app.candidateYear = this.normalizeOptionalValue(createDto.candidateYear);
    app.candidateLocation = this.normalizeOptionalValue(
      createDto.candidateLocation,
    );
    app.candidateLinkedinUrl = this.normalizeOptionalValue(
      createDto.candidateLinkedinUrl,
    );
    app.resumeDriveUrl = preparedResume.resumeDriveUrl;
    app.pipelineStage = CandidatePipelineStage.PENDING_REVIEW;
    app.status = ApplicationStatus.REVIEWING;
    app.reviewDecision = CandidateReviewDecision.PENDING;
    app.screeningStatus = ApplicationScreeningStatus.NOT_SCREENED;
    app.screeningSummary = null;
    app.screeningMatchedSkills = [];
    app.screeningMissingSkills = [];
    app.screeningDetails = null;
    app.studentFacingStatus = StudentApplicationStatus.APPLIED;
    app.score = null;
    app.source = invitedApplication ? CandidateSource.INVITED : CandidateSource.APPLIED;
    app.acceptedAt = app.acceptedAt || (invitedApplication ? new Date() : null);
    app.submittedAt = new Date();
    app.interviewLaunchStatus = null;
    app.interviewLaunchError = null;
    app.interviewEmailStatus = null;
    app.interviewEmailError = null;
    app.interviewEmailSentAt = null;
    app.submissionArtifacts = {
      ...(app.submissionArtifacts || {}),
      resumeAsset: preparedResume.artifact,
      resumeResourceId: preparedResume.resourceId,
      resumeTextPreview: preparedResume.parsed.text,
      resumeContentType: preparedResume.parsed.contentType,
      resumeExtractionStatus: preparedResume.parsed.extractionStatus,
      resumeExtractionError: preparedResume.parsed.extractionError || null,
      resumeAtsResult: preparedResume.analysis,
      resumeExtractedAt: new Date().toISOString(),
      automationNote:
        'Application is pending company screening before interviewer launch.',
    };

    const saved = await this.applicationsRepository.save(app);
    return this.withEffectivePipelineStage(saved);
  }

  async replaceResume(
    studentId: string,
    applicationId: string,
    resumeFile?: Express.Multer.File,
  ) {
    if (!resumeFile) {
      throw new BadRequestException('Resume PDF is required.');
    }
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId, studentId },
      relations: ['placement', 'assessment'],
    });
    if (!application) {
      throw new NotFoundException('Application not found.');
    }
    if (!application.placement) {
      throw new NotFoundException('Placement not found for this application.');
    }
    if (application.candidateJoinUrl) {
      throw new BadRequestException(
        'Resume cannot be replaced after an interview link is issued.',
      );
    }

    const assessment = await this.resolveAssessmentForApplication(
      application,
      application.placementId,
    );
    const preparedResume = await this.prepareApplicationResume({
      file: resumeFile,
      resumeDriveUrl: application.resumeDriveUrl,
      placement: application.placement,
      assessment,
    });

    application.resumeDriveUrl = preparedResume.resumeDriveUrl;
    application.score = null;
    application.screeningStatus = ApplicationScreeningStatus.NOT_SCREENED;
    application.screeningSummary = null;
    application.screeningMatchedSkills = [];
    application.screeningMissingSkills = [];
    application.screeningDetails = null;
    application.pipelineStage = CandidatePipelineStage.PENDING_REVIEW;
    application.status = ApplicationStatus.REVIEWING;
    application.reviewDecision = CandidateReviewDecision.PENDING;
    application.studentFacingStatus = StudentApplicationStatus.APPLIED;
    application.submittedAt = new Date();
    application.submissionArtifacts = {
      ...(application.submissionArtifacts || {}),
      resumeAsset: preparedResume.artifact,
      resumeResourceId: preparedResume.resourceId,
      resumeTextPreview: preparedResume.parsed.text,
      resumeContentType: preparedResume.parsed.contentType,
      resumeExtractionStatus: preparedResume.parsed.extractionStatus,
      resumeExtractionError: preparedResume.parsed.extractionError || null,
      resumeAtsResult: preparedResume.analysis,
      resumeExtractedAt: new Date().toISOString(),
      automationNote: 'Resume was replaced and is pending company screening.',
    };

    return this.withEffectivePipelineStage(
      await this.applicationsRepository.save(application),
    );
  }

  async inviteCandidate(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
    inviteDto: InviteCandidateDto,
  ) {
    const placement = await this.findPlacementForActor(
      placementId,
      actorId,
      actorRole,
    );

    if (inviteDto.assessmentId) {
      await this.findAttachedAssessmentForPlacement(
        placementId,
        inviteDto.assessmentId,
      );
    }

    const normalizedEmail = inviteDto.candidateEmail.trim().toLowerCase();
    const duplicate = await this.applicationsRepository
      .createQueryBuilder('application')
      .where('application.placementId = :placementId', { placementId })
      .andWhere('LOWER(application.candidateEmail) = :candidateEmail', {
        candidateEmail: normalizedEmail,
      })
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'This candidate is already in the drive pipeline.',
      );
    }

    const token = randomBytes(24).toString('hex');
    const inviteUrl = this.buildInviteUrl(placementId, token);
    const expiresAt = inviteDto.expiresAt
      ? new Date(inviteDto.expiresAt)
      : this.getDefaultExpiry();

    const application = this.applicationsRepository.create({
      studentId: null,
      placementId,
      assessmentId: inviteDto.assessmentId || null,
      candidateName: inviteDto.candidateName.trim(),
      candidateEmail: normalizedEmail,
      candidatePhone: this.normalizeOptionalValue(inviteDto.candidatePhone),
      pipelineStage: CandidatePipelineStage.INVITED,
      status: ApplicationStatus.APPLIED,
      reviewDecision: CandidateReviewDecision.PENDING,
      source: CandidateSource.INVITED,
      inviteToken: token,
      inviteUrl,
      invitedAt: new Date(),
      expiresAt,
    });

    const saved = await this.applicationsRepository.save(application);
    const delivery = await this.sendCandidateLinkEmail({
      to: saved.candidateEmail || normalizedEmail,
      candidateName: saved.candidateName,
      roleTitle: placement.title,
      companyName: placement.companyName,
      linkUrl: inviteUrl,
      linkLabel: 'Open assessment invite',
    });
    saved.interviewEmailStatus = delivery.status;
    saved.interviewEmailError = delivery.error || null;
    saved.interviewEmailSentAt =
      delivery.status === 'sent' ? new Date() : null;
    this.addEmailNotificationArtifact(saved, {
      type: 'assessment_invite',
      status: delivery.status,
      error: delivery.error || null,
      sentAt: saved.interviewEmailSentAt?.toISOString() || null,
    });

    return this.withEffectivePipelineStage(
      await this.applicationsRepository.save(saved),
    );
  }

  // For companies: View all applicants to a specific drive they own
  async findByPlacement(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.findPlacementForActor(placementId, actorId, actorRole);

    const applications = await this.applicationsRepository.find({
      where: { placementId },
      relations: ['student', 'assessment'],
      order: { updatedAt: 'DESC' },
    });

    return applications.map((application) =>
      this.withEffectivePipelineStage(application),
    );
  }

  async findMyApplications(studentId: string) {
    const applications = await this.applicationsRepository.find({
      where: { studentId },
      relations: ['placement', 'assessment'],
      order: { updatedAt: 'DESC' },
    });

    return applications.map((application) =>
      this.withEffectivePipelineStage(application),
    );
  }

  private applyScreeningDecision(
    application: Application,
    screening: ScreeningResult,
    threshold: number,
  ) {
    application.score = screening.score;
    application.screeningSummary = screening.summary;
    application.screeningMatchedSkills = screening.matchedSkills;
    application.screeningMissingSkills = screening.missingSkills;
    application.screeningDetails = screening.details;
    application.screenedAt = new Date();

    if (
      screening.details?.manualReview ||
      screening.confidence < MIN_AUTOMATED_SCREENING_CONFIDENCE
    ) {
      application.screeningStatus = ApplicationScreeningStatus.RETRY_PENDING;
      application.pipelineStage = CandidatePipelineStage.PENDING_REVIEW;
      application.status = ApplicationStatus.REVIEWING;
      application.reviewDecision = CandidateReviewDecision.PENDING;
      application.studentFacingStatus = StudentApplicationStatus.APPLIED;
      return;
    }

    if (screening.score >= threshold) {
      application.screeningStatus = ApplicationScreeningStatus.SHORTLISTED;
      application.pipelineStage = CandidatePipelineStage.ADVANCED;
      application.status = ApplicationStatus.OFFERED;
      application.reviewDecision = CandidateReviewDecision.ADVANCE;
      application.studentFacingStatus = StudentApplicationStatus.SHORTLISTED;
    } else {
      application.screeningStatus = ApplicationScreeningStatus.REJECTED;
      application.pipelineStage = CandidatePipelineStage.REJECTED;
      application.status = ApplicationStatus.REJECTED;
      application.reviewDecision = CandidateReviewDecision.REJECT;
      application.studentFacingStatus = StudentApplicationStatus.REJECTED;
    }
  }

  private async resolveAssessmentForApplication(
    application: Application,
    placementId: string,
  ) {
    if (application.assessment) {
      return application.assessment;
    }
    if (application.assessmentId) {
      return this.assessmentsRepository.findOne({
        where: { id: application.assessmentId },
      });
    }
    return this.findDefaultAssessmentForPlacement(placementId);
  }

  private async getResumeFileForApplication(application: Application) {
    const resumeAsset = this.getResumeArtifact(application);
    if (resumeAsset?.storageKey) {
      return this.readStoredResume(resumeAsset.storageKey);
    }
    if (application.resumeDriveUrl) {
      const { resourceId } = this.parseGoogleDriveResumeUrl(
        application.resumeDriveUrl,
      );
      return this.downloadResumeForInterviewer(resourceId);
    }
    throw new BadRequestException(
      'Candidate must submit a resume before interview launch.',
    );
  }

  private async launchAndNotifyApplication(
    application: Application,
    placement: Placement,
    options: { sendEmail?: boolean; isRetry?: boolean } = {},
  ) {
    let resume: { buffer: Buffer; contentType: string; fileName: string };
    try {
      resume = await this.getResumeFileForApplication(application);
    } catch (error) {
      application.interviewLaunchStatus = 'failed';
      application.interviewLaunchError =
        error instanceof Error
          ? error.message
          : 'Candidate must submit a resume before interview launch.';
      application.screeningStatus = ApplicationScreeningStatus.RETRY_PENDING;
      application.studentFacingStatus = StudentApplicationStatus.SHORTLISTED;
      return application;
    }

    const assessment = await this.resolveAssessmentForApplication(
      application,
      placement.id,
    );
    const launch = await this.launchCandidateInterview(
      application,
      placement,
      resume,
      assessment,
    );
    application.interviewLaunchStatus = launch.status;
    application.interviewLaunchError = launch.error || null;

    if (options.isRetry) {
      application.interviewRetriedAt = new Date();
      application.interviewRetryCount = (application.interviewRetryCount || 0) + 1;
    }

    if (launch.status === 'ready') {
      application.aiInterviewSessionId = launch.sessionId || null;
      application.candidateJoinUrl = launch.candidateJoinUrl || null;
      application.pipelineStage = CandidatePipelineStage.IN_PROGRESS;
      application.status = ApplicationStatus.INTERVIEWING;
      application.reviewDecision = CandidateReviewDecision.ADVANCE;
      application.screeningStatus = ApplicationScreeningStatus.SHORTLISTED;
      application.studentFacingStatus =
        StudentApplicationStatus.INTERVIEW_INVITED;
    } else {
      application.pipelineStage = CandidatePipelineStage.ADVANCED;
      application.status = ApplicationStatus.OFFERED;
      application.reviewDecision = CandidateReviewDecision.ADVANCE;
      application.screeningStatus = ApplicationScreeningStatus.RETRY_PENDING;
      application.studentFacingStatus = StudentApplicationStatus.SHORTLISTED;
    }

    const shouldSendEmail = options.sendEmail !== false;
    if (
      shouldSendEmail &&
      application.candidateEmail &&
      application.candidateJoinUrl
    ) {
      const delivery = await this.sendCandidateLinkEmail({
        to: application.candidateEmail,
        candidateName: application.candidateName,
        roleTitle: placement.title,
        companyName: placement.companyName,
        linkUrl: application.candidateJoinUrl,
        linkLabel: 'Start interview',
      });
      application.interviewEmailStatus = delivery.status;
      application.interviewEmailError = delivery.error || null;
      application.interviewEmailSentAt =
        delivery.status === 'sent' ? new Date() : null;
      this.addEmailNotificationArtifact(application, {
        type: 'interview_invite',
        status: delivery.status,
        error: delivery.error || null,
        sentAt: application.interviewEmailSentAt?.toISOString() || null,
      });
    } else if (application.candidateEmail && launch.status !== 'ready') {
      application.interviewEmailStatus = launch.status;
      application.interviewEmailError =
        launch.error || 'Interview link was not created.';
      this.addEmailNotificationArtifact(application, {
        type: 'interview_invite',
        status: 'failed',
        error: application.interviewEmailError,
        sentAt: null,
      });
    }

    return application;
  }

  async runPlacementScreening(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
    dto: RunPlacementScreeningDto = {},
  ) {
    const placement = await this.findPlacementForActor(
      placementId,
      actorId,
      actorRole,
    );
    const threshold =
      dto.threshold ?? placement.shortlistScoreThreshold ?? 75;
    const shouldAutoInvite =
      dto.autoInvite ?? placement.autoInviteShortlisted ?? false;
    const applications = await this.applicationsRepository.find({
      where: { placementId },
      relations: ['student', 'assessment'],
      order: { updatedAt: 'DESC' },
    });
    const results: Array<Record<string, any>> = [];

    for (const application of applications) {
      if (
        dto.onlyPending &&
        application.screeningStatus !== ApplicationScreeningStatus.NOT_SCREENED
      ) {
        continue;
      }
      if (
        application.pipelineStage === CandidatePipelineStage.INVITED &&
        !this.hasApplicationResumeSource(application)
      ) {
        results.push({
          id: application.id,
          status: 'skipped',
          reason: 'Candidate has not accepted the invite or submitted a resume.',
        });
        continue;
      }

      const assessment = await this.resolveAssessmentForApplication(
        application,
        placement.id,
      );
      const resumeText = await this.ensureResumeTextPreview(application);
      const artifacts = application.submissionArtifacts || {};
      const resumeAsset = artifacts.resumeAsset || null;
      const parseStatus =
        resumeAsset?.extractionStatus || artifacts.resumeExtractionStatus || null;
      const parseError =
        resumeAsset?.extractionError || artifacts.resumeExtractionError || null;
      const screening = resumeText.trim()
        ? this.buildScreeningFromAts({
            ats: await this.analyzeResumeForPlacement({
              resumeText,
              parseStatus,
              placement,
              assessment,
            }),
            parseStatus,
            parseError,
          })
        : this.buildManualReviewScreening(
            'Resume text could not be parsed. Manual review is required before making a decision.',
          );
      this.applyScreeningDecision(application, screening, threshold);

      let rejectionDelivery: EmailDeliveryResult | null = null;
      if (application.screeningStatus === ApplicationScreeningStatus.REJECTED) {
        rejectionDelivery = await this.sendCandidateRejectionEmail(
          application,
          placement,
          'resume_screening',
        );
      }

      if (
        application.screeningStatus === ApplicationScreeningStatus.SHORTLISTED &&
        shouldAutoInvite
      ) {
        await this.launchAndNotifyApplication(application, placement, {
          sendEmail: true,
        });
      }

      const saved = await this.applicationsRepository.save(application);
      results.push({
        id: saved.id,
        status: saved.screeningStatus,
        score: saved.score,
        confidence: saved.screeningDetails?.confidence ?? null,
        matchedSkills: saved.screeningMatchedSkills,
        missingSkills: saved.screeningMissingSkills,
        screeningSummary: saved.screeningSummary,
        parseStatus: saved.screeningDetails?.parseStatus || null,
        lowConfidence: Boolean(saved.screeningDetails?.lowConfidence),
        manualReview: Boolean(saved.screeningDetails?.manualReview),
        pipelineStage: saved.pipelineStage,
        interviewLaunchStatus: saved.interviewLaunchStatus,
        interviewEmailStatus: saved.interviewEmailStatus,
        candidateJoinUrl: saved.candidateJoinUrl,
        rejectionEmailStatus: rejectionDelivery?.status || null,
        studentFacingStatus: saved.studentFacingStatus,
      });
    }

    const summary = results.reduce(
      (acc, result) => {
        if (result.status === 'skipped') {
          acc.skipped += 1;
          return acc;
        }
        if (result.status === ApplicationScreeningStatus.SHORTLISTED) {
          acc.shortlisted += 1;
        }
        if (result.status === ApplicationScreeningStatus.REJECTED) {
          acc.rejected += 1;
        }
        if (
          result.interviewLaunchStatus === 'ready' ||
          result.candidateJoinUrl
        ) {
          acc.interviewReady += 1;
        }
        if (
          result.interviewEmailStatus === 'failed' ||
          result.rejectionEmailStatus === 'failed'
        ) {
          acc.emailFailed += 1;
        }
        if (
          result.status === ApplicationScreeningStatus.RETRY_PENDING ||
          result.interviewLaunchStatus === 'failed'
        ) {
          acc.retryPending += 1;
        }
        if (result.status === ApplicationScreeningStatus.RETRY_PENDING) {
          acc.manualReview += 1;
        }
        if (result.parseStatus && result.parseStatus !== 'parsed') {
          acc.parseFailed += 1;
        }
        if (result.lowConfidence) {
          acc.lowConfidence += 1;
        }
        return acc;
      },
      {
        processed: results.length,
        shortlisted: 0,
        rejected: 0,
        skipped: 0,
        manualReview: 0,
        parseFailed: 0,
        lowConfidence: 0,
        interviewReady: 0,
        emailFailed: 0,
        retryPending: 0,
      },
    );

    return {
      placementId,
      threshold,
      autoInvite: shouldAutoInvite,
      processed: summary.processed,
      summary,
      results,
      applicants: (await this.findByPlacement(placementId, actorId, actorRole)),
    };
  }

  async schedulePlacementInterviews(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
    dto: SchedulePlacementInterviewsDto = {},
  ) {
    const placement = await this.findPlacementForActor(
      placementId,
      actorId,
      actorRole,
    );
    const threshold =
      dto.threshold ?? placement.shortlistScoreThreshold ?? 75;
    const allowedIds = new Set(dto.applicationIds || []);
    const applications = await this.applicationsRepository.find({
      where: { placementId },
      relations: ['student', 'assessment'],
      order: { updatedAt: 'DESC' },
    });
    const results: Array<Record<string, any>> = [];

    for (const application of applications) {
      if (allowedIds.size && !allowedIds.has(application.id)) {
        continue;
      }
      if (application.candidateJoinUrl) {
        results.push({
          id: application.id,
          status: 'skipped',
          reason: 'Interview link already exists.',
        });
        continue;
      }
      const isEligible =
        application.pipelineStage === CandidatePipelineStage.ADVANCED ||
        application.reviewDecision === CandidateReviewDecision.ADVANCE ||
        (typeof application.score === 'number' && application.score >= threshold);
      if (!isEligible) {
        results.push({
          id: application.id,
          status: 'skipped',
          reason: 'Candidate is not shortlisted.',
        });
        continue;
      }
      if (!this.hasApplicationResumeSource(application)) {
        application.interviewLaunchStatus = 'failed';
        application.interviewLaunchError =
          'Candidate must submit a resume before interview launch.';
        application.screeningStatus = ApplicationScreeningStatus.RETRY_PENDING;
        await this.applicationsRepository.save(application);
        results.push({
          id: application.id,
          status: 'failed',
          reason: application.interviewLaunchError,
        });
        continue;
      }

      await this.launchAndNotifyApplication(application, placement, {
        sendEmail: dto.sendEmail !== false,
      });
      const saved = await this.applicationsRepository.save(application);
      results.push({
        id: saved.id,
        status: saved.interviewLaunchStatus,
        interviewEmailStatus: saved.interviewEmailStatus,
        candidateJoinUrl: saved.candidateJoinUrl,
      });
    }

    return {
      placementId,
      threshold,
      scheduled: results.filter((result) => result.status === 'ready').length,
      results,
      applicants: await this.findByPlacement(placementId, actorId, actorRole),
    };
  }

  private async findDefaultAssessmentForPlacement(placementId: string) {
    const primary = await this.assessmentLinksRepository.findOne({
      where: { placementId, isPrimary: true },
      relations: ['assessment'],
      order: { updatedAt: 'DESC' },
    });
    if (primary?.assessment) {
      return primary.assessment;
    }

    const latest = await this.assessmentLinksRepository.findOne({
      where: { placementId },
      relations: ['assessment'],
      order: { updatedAt: 'DESC' },
    });
    if (latest?.assessment) {
      return latest.assessment;
    }

    return this.assessmentsRepository.findOne({
      where: { placementId },
      order: { createdAt: 'DESC' },
    });
  }

  private async findAttachedAssessmentForPlacement(
    placementId: string,
    assessmentId: string,
  ) {
    const link = await this.assessmentLinksRepository.findOne({
      where: { placementId, assessmentId },
      relations: ['assessment'],
    });
    if (link?.assessment) {
      return link.assessment;
    }

    const legacy = await this.assessmentsRepository.findOne({
      where: { id: assessmentId, placementId },
    });
    if (legacy) {
      return legacy;
    }

    throw new NotFoundException('Assessment not found for this drive.');
  }

  // ATS: update applicant status
  async updateStatus(
    id: string,
    status: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const application = await this.findApplicationForActor(
      id,
      actorId,
      actorRole,
    );

    if (
      Object.values(CandidatePipelineStage).includes(
        status as CandidatePipelineStage,
      )
    ) {
      const nextStage = status as CandidatePipelineStage;
      application.pipelineStage = nextStage;
      application.status = this.mapStageToLegacyStatus(nextStage);
      if (nextStage === CandidatePipelineStage.ADVANCED) {
        application.reviewDecision = CandidateReviewDecision.ADVANCE;
      }
      if (nextStage === CandidatePipelineStage.REJECTED) {
        application.reviewDecision = CandidateReviewDecision.REJECT;
      }
      this.markStudentStatus(application);
      if (nextStage === CandidatePipelineStage.REJECTED && application.placement) {
        await this.sendCandidateRejectionEmail(
          application,
          application.placement,
          'manual_review',
        );
      }
      return this.withEffectivePipelineStage(
        await this.applicationsRepository.save(application),
      );
    }

    const nextStatus = status as ApplicationStatus;
    if (!Object.values(ApplicationStatus).includes(nextStatus)) {
      throw new BadRequestException('Invalid application status value.');
    }

    application.status = nextStatus;
    application.pipelineStage = this.mapLegacyStatusToStage(nextStatus);
    this.markStudentStatus(application);
    if (
      nextStatus === ApplicationStatus.REJECTED &&
      application.placement
    ) {
      await this.sendCandidateRejectionEmail(
        application,
        application.placement,
        'manual_review',
      );
    }
    return this.withEffectivePipelineStage(
      await this.applicationsRepository.save(application),
    );
  }

  async findReview(
    id: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    return this.withEffectivePipelineStage(
      await this.findApplicationForActor(id, actorId, actorRole),
    );
  }

  async updateReview(
    id: string,
    actorId: string,
    actorRole: UserRole,
    updateDto: UpdateCandidateReviewDto,
  ) {
    const application = await this.findApplicationForActor(
      id,
      actorId,
      actorRole,
    );

    if (updateDto.pipelineStage !== undefined) {
      application.pipelineStage = updateDto.pipelineStage;
      application.status = this.mapStageToLegacyStatus(updateDto.pipelineStage);
    }

    if (updateDto.reviewDecision !== undefined) {
      application.reviewDecision = updateDto.reviewDecision;
      if (
        updateDto.reviewDecision === CandidateReviewDecision.ADVANCE &&
        updateDto.pipelineStage === undefined
      ) {
        application.pipelineStage = CandidatePipelineStage.ADVANCED;
        application.status = ApplicationStatus.OFFERED;
      }
      if (
        updateDto.reviewDecision === CandidateReviewDecision.REJECT &&
        updateDto.pipelineStage === undefined
      ) {
        application.pipelineStage = CandidatePipelineStage.REJECTED;
        application.status = ApplicationStatus.REJECTED;
      }
      if (
        updateDto.reviewDecision === CandidateReviewDecision.PENDING &&
        updateDto.pipelineStage === undefined
      ) {
        application.pipelineStage = CandidatePipelineStage.PENDING_REVIEW;
        application.status = ApplicationStatus.REVIEWING;
      }
    }

    if (updateDto.score !== undefined) {
      application.score = updateDto.score;
    }
    if (updateDto.reviewNotes !== undefined) {
      application.reviewNotes = updateDto.reviewNotes.trim() || null;
    }
    if (updateDto.submissionSummary !== undefined) {
      application.submissionSummary =
        updateDto.submissionSummary.trim() || null;
    }
    this.markStudentStatus(application);
    if (
      (application.pipelineStage === CandidatePipelineStage.REJECTED ||
        application.reviewDecision === CandidateReviewDecision.REJECT ||
        application.status === ApplicationStatus.REJECTED) &&
      application.placement
    ) {
      await this.sendCandidateRejectionEmail(
        application,
        application.placement,
        updateDto.reviewDecision === CandidateReviewDecision.REJECT
          ? 'interview'
          : 'manual_review',
      );
    }

    return this.withEffectivePipelineStage(
      await this.applicationsRepository.save(application),
    );
  }

  async updateScreening(
    id: string,
    actorId: string,
    actorRole: UserRole,
    updateDto: UpdateApplicationScreeningDto,
  ) {
    const application = await this.findApplicationForActor(
      id,
      actorId,
      actorRole,
    );

    if (updateDto.score !== undefined) {
      application.score = updateDto.score;
    }
    if (updateDto.screeningStatus !== undefined) {
      application.screeningStatus = updateDto.screeningStatus;
    }
    if (updateDto.screeningSummary !== undefined) {
      application.screeningSummary =
        updateDto.screeningSummary.trim() || null;
    }
    if (updateDto.screeningMatchedSkills !== undefined) {
      application.screeningMatchedSkills = updateDto.screeningMatchedSkills
        .map((skill) => skill.trim())
        .filter(Boolean);
    }
    if (updateDto.screeningMissingSkills !== undefined) {
      application.screeningMissingSkills = updateDto.screeningMissingSkills
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    application.screenedAt = new Date();

    const shouldReconcileDecision =
      updateDto.score !== undefined || updateDto.screeningStatus !== undefined;
    if (shouldReconcileDecision) {
      const threshold =
        application.placement?.shortlistScoreThreshold ?? 75;
      const score = application.score ?? 0;
      if (
        application.screeningStatus === ApplicationScreeningStatus.REJECTED ||
        score < threshold
      ) {
        application.pipelineStage = CandidatePipelineStage.REJECTED;
        application.status = ApplicationStatus.REJECTED;
        application.reviewDecision = CandidateReviewDecision.REJECT;
        application.studentFacingStatus = StudentApplicationStatus.REJECTED;
        if (application.placement) {
          await this.sendCandidateRejectionEmail(
            application,
            application.placement,
            'resume_screening',
          );
        }
      } else if (
        application.screeningStatus === ApplicationScreeningStatus.SHORTLISTED ||
        application.screeningStatus === ApplicationScreeningStatus.SCREENED ||
        score >= threshold
      ) {
        application.pipelineStage = application.candidateJoinUrl
          ? CandidatePipelineStage.IN_PROGRESS
          : CandidatePipelineStage.ADVANCED;
        application.status = application.candidateJoinUrl
          ? ApplicationStatus.INTERVIEWING
          : ApplicationStatus.OFFERED;
        application.reviewDecision = CandidateReviewDecision.ADVANCE;
        application.studentFacingStatus = application.candidateJoinUrl
          ? StudentApplicationStatus.INTERVIEW_INVITED
          : StudentApplicationStatus.SHORTLISTED;
        if (application.screeningStatus === ApplicationScreeningStatus.SCREENED) {
          application.screeningStatus = ApplicationScreeningStatus.SHORTLISTED;
        }
      }
    }

    return this.withEffectivePipelineStage(
      await this.applicationsRepository.save(application),
    );
  }

  async retryInterview(
    id: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const application = await this.findApplicationForActor(
      id,
      actorId,
      actorRole,
    );
    const placement = application.placement;
    if (!placement) {
      throw new NotFoundException('Placement not found for this application.');
    }

    const isEligible =
      application.pipelineStage === CandidatePipelineStage.ADVANCED ||
      application.reviewDecision === CandidateReviewDecision.ADVANCE ||
      (typeof application.score === 'number' &&
        application.score >= (placement.shortlistScoreThreshold ?? 75));
    if (!isEligible) {
      throw new BadRequestException(
        'Only shortlisted candidates can receive an interview invite.',
      );
    }

    await this.launchAndNotifyApplication(application, placement, {
      sendEmail: true,
      isRetry: true,
    });

    return this.withEffectivePipelineStage(
      await this.applicationsRepository.save(application),
    );
  }
}
