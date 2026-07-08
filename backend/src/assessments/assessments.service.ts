import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  PayloadTooLargeException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HiringAssessment,
  HiringAssessmentContextSource,
  HiringAssessmentFile,
} from '../placements/entities/hiring-assessment.entity';
import { HiringAssessmentPlacementLink } from '../placements/entities/hiring-assessment-placement-link.entity';
import { Placement } from '../placements/entities/placement.entity';
import { CreateHiringAssessmentDto } from '../placements/dto/create-hiring-assessment.dto';
import { GenerateHiringAssessmentDto } from '../placements/dto/generate-hiring-assessment.dto';
import { UpdateHiringAssessmentDto } from '../placements/dto/update-hiring-assessment.dto';
import { AttachHiringAssessmentDto } from '../placements/dto/attach-hiring-assessment.dto';
import { GithubRepository } from '../integrations/entities/github-repository.entity';
import { AssessmentGenerationRun } from './entities/assessment-generation-run.entity';
import {
  AssessmentAiService,
  GeneratedAssessmentPayload,
} from '../common/assessment-ai.service';
import { CompanySettingsService } from '../company-settings/company-settings.service';

const MAX_CONTEXT_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_CONTEXT_FETCH_BYTES = 768 * 1024;
const MAX_CONTEXT_TEXT_CHARS = 60_000;
const CONTEXT_FETCH_TIMEOUT_MS = 8000;

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(HiringAssessment)
    private readonly assessmentRepo: Repository<HiringAssessment>,
    @InjectRepository(HiringAssessmentPlacementLink)
    private readonly linkRepo: Repository<HiringAssessmentPlacementLink>,
    @InjectRepository(Placement)
    private readonly placementRepo: Repository<Placement>,
    @InjectRepository(GithubRepository)
    private readonly githubReposRepo: Repository<GithubRepository>,
    @InjectRepository(AssessmentGenerationRun)
    private readonly generationRunsRepo: Repository<AssessmentGenerationRun>,
    private readonly assessmentAiService: AssessmentAiService,
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  async listCompanyAssessments(companyId: string) {
    const assessments = await this.assessmentRepo.find({
      where: { companyId },
      relations: ['placementLinks', 'placementLinks.placement'],
      order: { updatedAt: 'DESC' },
    });

    return assessments.map((assessment) => this.decorateAssessment(assessment));
  }

  async listGenerationRuns(companyId: string) {
    const runs = await this.generationRunsRepo.find({
      where: { companyId },
      order: { updatedAt: 'DESC' },
      take: 25,
    });
    return runs.map((run) => this.decorateGenerationRun(run));
  }

  async findGenerationRun(companyId: string, runId: string) {
    const run = await this.generationRunsRepo.findOne({
      where: { id: runId, companyId },
    });
    if (!run) {
      throw new NotFoundException('Generation run not found.');
    }
    return this.decorateGenerationRun(run);
  }

  async findCompanyAssessment(companyId: string, assessmentId: string) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id: assessmentId, companyId },
      relations: ['placementLinks', 'placementLinks.placement'],
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found.');
    }
    return this.decorateAssessment(assessment);
  }

  async createCompanyAssessment(
    companyId: string,
    dto: CreateHiringAssessmentDto,
  ) {
    const files = dto.files || [];
    this.assertUniqueAssessmentPaths(files);
    const contextSources = await this.enrichRepoContextSources(
      companyId,
      this.normalizeContextSources(dto.contextSources),
    );

    const assessment = this.assessmentRepo.create({
      companyId,
      placementId: null,
      name: dto.name.trim(),
      language: dto.language?.trim() || null,
      timeLimitMinutes: dto.timeLimitMinutes ?? null,
      instructions: dto.instructions?.trim() || null,
      stageName: dto.stageName?.trim() || null,
      prompt: dto.prompt?.trim() || null,
      contextSnapshot: dto.contextSnapshot || null,
      contextSources,
      files,
    });

    return this.assessmentRepo.save(assessment);
  }

  async generateCompanyAssessment(
    companyId: string,
    dto: GenerateHiringAssessmentDto,
  ) {
    const prompt = dto.prompt.trim();
    const placement = dto.roleId
      ? await this.findOwnedPlacement(companyId, dto.roleId)
      : null;
    const run = this.generationRunsRepo.create({
      companyId,
      roleId: placement?.id || null,
      status: 'generating',
      prompt,
      mode: dto.mode?.trim() || null,
      generationMode: dto.generationMode || 'balanced',
      repositoryIds: Array.from(new Set(dto.repositoryIds || [])).filter(Boolean),
      contextSources: [],
      inputSnapshot: {
        draftId: dto.draftId || null,
        requestedRoleId: dto.roleId || null,
        assessmentName: dto.assessmentName || null,
        startedAt: new Date().toISOString(),
      },
    });
    let savedRun = await this.generationRunsRepo.save(run);

    try {
      const repositorySources = await this.repositoryIdsToContextSources(
        companyId,
        dto.repositoryIds,
      );
      const normalizedDtoSources = this.normalizeContextSources(dto.contextSources);
      const companyProfileSource = await this.companyProfileToContextSource(
        companyId,
        placement,
        normalizedDtoSources,
      );
      const contextSnapshot = this.contextSnapshotWithRepositories(
        dto.contextSnapshot ||
          (placement ? this.buildRoleContextSnapshot(placement) : null),
        repositorySources,
      );
      const contextSources = await this.enrichRepoContextSources(
        companyId,
        [
          ...normalizedDtoSources.filter(
            (source) => source.type !== 'company_profile',
          ),
          ...(companyProfileSource ? [companyProfileSource] : []),
          ...repositorySources,
        ],
      );
      const name =
        dto.assessmentName?.trim() ||
        (placement
          ? `${placement.title} assessment`
          : this.inferAssessmentName(prompt));
      const language =
        dto.language?.trim() || this.inferLanguage(contextSources) || 'markdown';
      const timeLimitMinutes = dto.timeLimitMinutes ?? 90;

      savedRun.contextSources = this.summarizeContextSourcesForRun(contextSources);
      savedRun.inputSnapshot = {
        ...(savedRun.inputSnapshot || {}),
        role: placement ? this.buildRoleContextSnapshot(placement) : null,
        contextSnapshot: this.summarizeContextSnapshotForRun(contextSnapshot),
        contextSourceCount: contextSources.length,
      };
      savedRun = await this.generationRunsRepo.save(savedRun);

      const generation = await this.assessmentAiService.generateAssessment({
        prompt,
        name,
        language,
        timeLimitMinutes,
        roleContext: placement ? this.buildRoleContextSnapshot(placement) : null,
        contextSnapshot,
        contextSources,
        generationMode: dto.generationMode || 'balanced',
      });
      const generated = generation.assessment;
      const validation =
        this.assessmentAiService.validateGeneratedAssessment(generated);
      if (!validation.ok) {
        throw new BadRequestException(
          `Generated assessment failed quality checks: ${validation.issues.join(' ')}`,
        );
      }

      const files = this.filesFromGeneratedAssessment(generated);
      this.assertUniqueAssessmentPaths(files);
      const assessment = this.assessmentRepo.create({
        companyId,
        placementId: placement?.id || null,
        name: (generated.title || name).slice(0, 160),
        language: generated.language?.trim() || language,
        timeLimitMinutes: generated.timeLimitMinutes || timeLimitMinutes,
        instructions: this.instructionsFromGeneratedAssessment({
          generated,
          prompt,
          placement,
        }),
        stageName: dto.stageName?.trim() || null,
        prompt,
        contextSnapshot: {
          ...(contextSnapshot || {}),
          generatedAssessment: {
            brief: generated.brief,
            constraints: generated.constraints,
            tasks: generated.tasks,
            reviewerNotes: generated.reviewerNotes,
            interviewerHandoffNotes: generated.interviewerHandoffNotes,
            provider: generation.provider,
            model: generation.model,
          },
        },
        contextSources,
        files,
      });

      const saved = await this.assessmentRepo.save(assessment);
      if (placement) {
        await this.attachAssessment(companyId, placement.id, saved.id, {
          stageName: dto.stageName,
          isPrimary: true,
          contextSnapshot: contextSnapshot || undefined,
        });
      }

      savedRun.status = 'succeeded';
      savedRun.assessmentId = saved.id;
      savedRun.provider = generation.provider;
      savedRun.model = generation.model;
      savedRun.outputSnapshot = {
        assessment: generated,
        usedFallback: generation.usedFallback,
      };
      savedRun.validationResult = validation;
      savedRun.error = null;
      savedRun = await this.generationRunsRepo.save(savedRun);
      await this.companySettingsService.logAction(companyId, { id: companyId }, {
        action: 'company.assessment.generation.succeeded',
        target: saved.id,
        metadata: {
          runId: savedRun.id,
          roleId: placement?.id || null,
          repositoryIds: dto.repositoryIds || [],
          provider: generation.provider,
          model: generation.model,
        },
      });

      const decorated = await this.findCompanyAssessment(companyId, saved.id);
      return {
        ...decorated,
        generationRun: this.decorateGenerationRun(savedRun),
      };
    } catch (error) {
      savedRun.status = 'failed';
      savedRun.error =
        error instanceof Error ? error.message : 'Assessment generation failed.';
      savedRun.validationResult = {
        ok: false,
        issues: [savedRun.error],
        checkedAt: new Date().toISOString(),
      };
      await this.generationRunsRepo.save(savedRun);
      await this.companySettingsService.logAction(companyId, { id: companyId }, {
        action: 'company.assessment.generation.failed',
        target: dto.roleId || null,
        severity: 'warning',
        metadata: {
          runId: savedRun.id,
          error: savedRun.error,
          repositoryIds: dto.repositoryIds || [],
        },
      });
      throw error;
    }
  }

  async extractUploadedJobDescriptionContext(
    companyId: string,
    file: Express.Multer.File,
  ): Promise<HiringAssessmentContextSource> {
    void companyId;
    if (file.size > MAX_CONTEXT_UPLOAD_BYTES) {
      throw new PayloadTooLargeException(
        'Job description file must be 2MB or smaller.',
      );
    }

    const mimeType = file.mimetype || '';
    const originalName = file.originalname || 'job-description';
    const lowerName = originalName.toLowerCase();
    const isPdf = mimeType === 'application/pdf' || lowerName.endsWith('.pdf');
    const isMarkdown =
      mimeType === 'text/markdown' ||
      mimeType === 'text/x-markdown' ||
      /\.(md|markdown)$/i.test(originalName);
    const isText =
      mimeType.startsWith('text/') || /\.(txt|text)$/i.test(originalName);

    if (!isPdf && !isMarkdown && !isText) {
      throw new BadRequestException(
        'Upload a txt, md, or pdf job description.',
      );
    }

    const rawText = isPdf
      ? await this.extractPdfText(file.buffer)
      : file.buffer.toString('utf-8');
    const limited = this.limitContextText(rawText);
    if (!limited.content) {
      throw new BadRequestException(
        'No readable text was found in this job description.',
      );
    }

    return {
      type: 'job_description',
      label: originalName,
      content: limited.content,
      metadata: {
        source: 'upload',
        mimeType,
        size: file.size,
        truncated: limited.truncated,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  async fetchJobDescriptionContextFromUrl(
    companyId: string,
    value: string,
  ): Promise<HiringAssessmentContextSource> {
    void companyId;
    const parsed = this.parseContextUrl(value);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONTEXT_FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          Accept:
            'text/html,text/plain,text/markdown,application/json;q=0.8,*/*;q=0.2',
          'User-Agent': 'Emble-Hiring-Context/1.0',
        },
      });
    } catch (error) {
      const isAbort =
        error instanceof Error && error.name.toLowerCase() === 'aborterror';
      throw new BadRequestException(
        isAbort
          ? 'Fetching this URL timed out. Try pasting the description instead.'
          : `Unable to fetch this URL: ${
              error instanceof Error ? error.message : 'unknown error'
            }`,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new BadRequestException(
        `Unable to fetch this URL (${response.status}).`,
      );
    }

    const contentType = (response.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_CONTEXT_FETCH_BYTES) {
      throw new PayloadTooLargeException(
        'Fetched job description must be 768KB or smaller.',
      );
    }
    if (!this.isSupportedFetchedContentType(contentType)) {
      throw new BadRequestException(
        'URL must return HTML, plain text, markdown, or JSON content.',
      );
    }

    const buffer = await this.readResponseBufferWithLimit(response);
    const rawText = buffer.toString('utf-8');
    const content = contentType === 'text/html'
      ? this.stripHtml(rawText)
      : rawText;
    const limited = this.limitContextText(content);
    if (!limited.content) {
      throw new BadRequestException('No readable text was found at this URL.');
    }

    return {
      type: 'job_description',
      label: this.labelFromUrl(parsed),
      url: parsed.toString(),
      content: limited.content,
      metadata: {
        source: 'url',
        contentType,
        size: buffer.byteLength,
        truncated: limited.truncated,
        fetchedAt: new Date().toISOString(),
      },
    };
  }

  async updateCompanyAssessment(
    companyId: string,
    assessmentId: string,
    dto: UpdateHiringAssessmentDto,
  ) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id: assessmentId, companyId },
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found.');
    }

    if (dto.files) {
      this.assertUniqueAssessmentPaths(dto.files);
      assessment.files = dto.files;
      assessment.version += 1;
    }
    if (dto.name !== undefined) assessment.name = dto.name.trim();
    if (dto.language !== undefined) assessment.language = dto.language?.trim() || null;
    if (dto.timeLimitMinutes !== undefined) assessment.timeLimitMinutes = dto.timeLimitMinutes;
    if (dto.instructions !== undefined) assessment.instructions = dto.instructions?.trim() || null;
    if (dto.stageName !== undefined) assessment.stageName = dto.stageName?.trim() || null;
    if (dto.prompt !== undefined) assessment.prompt = dto.prompt?.trim() || null;
    if (dto.contextSources !== undefined) {
      assessment.contextSources = await this.enrichRepoContextSources(
        companyId,
        this.normalizeContextSources(dto.contextSources),
      );
    }
    if (dto.contextSnapshot !== undefined) {
      assessment.contextSnapshot = dto.contextSnapshot || null;
    }
    if (dto.status !== undefined) assessment.status = dto.status;

    const saved = await this.assessmentRepo.save(assessment);
    return this.findCompanyAssessment(companyId, saved.id);
  }

  async deleteCompanyAssessment(companyId: string, assessmentId: string) {
    const assessment = await this.assessmentRepo.findOne({
      where: { id: assessmentId, companyId },
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found.');
    }

    await this.linkRepo.delete({ companyId, assessmentId });
    await this.generationRunsRepo.update(
      { companyId, assessmentId },
      { assessmentId: null },
    );
    await this.assessmentRepo.remove(assessment);
    await this.companySettingsService.logAction(companyId, { id: companyId }, {
      action: 'company.assessment.deleted',
      target: assessmentId,
      severity: 'warning',
      metadata: { name: assessment.name },
    });

    return { deleted: true, id: assessmentId };
  }

  async attachAssessment(
    companyId: string,
    placementId: string,
    assessmentId: string,
    dto: AttachHiringAssessmentDto = {},
  ) {
    const placement = await this.findOwnedPlacement(companyId, placementId);
    const assessment = await this.assessmentRepo.findOne({
      where: { id: assessmentId, companyId },
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found.');
    }

    let link = await this.linkRepo.findOne({
      where: { assessmentId, placementId },
      relations: ['assessment', 'placement'],
    });
    const shouldSetPrimary =
      dto.isPrimary === true || !(await this.hasPrimaryAssessment(placementId));

    if (shouldSetPrimary) {
      await this.linkRepo.update({ placementId }, { isPrimary: false });
    }

    if (!link) {
      link = this.linkRepo.create({
        companyId,
        assessmentId,
        placementId,
      });
    }

    link.companyId = companyId;
    link.stageName = dto.stageName?.trim() || assessment.stageName || null;
    link.isPrimary = shouldSetPrimary || link.isPrimary;
    link.contextSnapshot =
      dto.contextSnapshot || this.buildRoleContextSnapshot(placement);

    assessment.placementId = assessment.placementId || placement.id;
    if (!assessment.contextSnapshot) {
      assessment.contextSnapshot = link.contextSnapshot;
    }
    await this.assessmentRepo.save(assessment);

    const saved = await this.linkRepo.save(link);
    return this.decorateLink(saved, assessment, placement);
  }

  async detachAssessment(
    companyId: string,
    placementId: string,
    assessmentId: string,
  ) {
    await this.findOwnedPlacement(companyId, placementId);
    const link = await this.linkRepo.findOne({
      where: { companyId, placementId, assessmentId },
    });
    if (!link) {
      throw new NotFoundException('Assessment is not attached to this role.');
    }
    await this.linkRepo.remove(link);
    return { detached: true };
  }

  private async findOwnedPlacement(companyId: string, placementId: string) {
    const placement = await this.placementRepo.findOne({ where: { id: placementId } });
    if (!placement) {
      throw new NotFoundException('Role not found.');
    }
    if (placement.companyId !== companyId) {
      throw new ForbiddenException('Access denied. You do not own this role.');
    }
    return placement;
  }

  private async hasPrimaryAssessment(placementId: string) {
    return Boolean(
      await this.linkRepo.findOne({
        where: { placementId, isPrimary: true },
        select: ['id'],
      }),
    );
  }

  private assertUniqueAssessmentPaths(files: HiringAssessmentFile[]) {
    const seen = new Set<string>();
    for (const file of files) {
      const normalizedPath = file.path.trim();
      if (seen.has(normalizedPath)) {
        throw new BadRequestException(
          `Assessment file path "${normalizedPath}" is duplicated.`,
        );
      }
      seen.add(normalizedPath);
    }
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = (await pdfParse(buffer)) as { text?: string };
      return (parsed.text || '').trim();
    } catch {
      throw new BadRequestException(
        'Unable to read this PDF. Try uploading a text or markdown file.',
      );
    }
  }

  private parseContextUrl(value: string) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      throw new BadRequestException('URL is required.');
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException('Enter a valid URL.');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException('Only http and https URLs are supported.');
    }
    return parsed;
  }

  private isSupportedFetchedContentType(contentType: string) {
    if (!contentType) return true;
    return [
      'text/html',
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'application/json',
      'application/ld+json',
    ].includes(contentType);
  }

  private async readResponseBufferWithLimit(response: Response) {
    const reader = response.body?.getReader();
    if (!reader) {
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.byteLength > MAX_CONTEXT_FETCH_BYTES) {
        throw new PayloadTooLargeException(
          'Fetched job description must be 768KB or smaller.',
        );
      }
      return buffer;
    }

    const chunks: Buffer[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      const chunk = Buffer.from(value);
      received += chunk.byteLength;
      if (received > MAX_CONTEXT_FETCH_BYTES) {
        throw new PayloadTooLargeException(
          'Fetched job description must be 768KB or smaller.',
        );
      }
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  private stripHtml(value: string) {
    return this.decodeBasicHtmlEntities(
      value
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' '),
    );
  }

  private decodeBasicHtmlEntities(value: string) {
    return value
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&#(\d+);/g, (_, code: string) => {
        const point = Number(code);
        return Number.isFinite(point) && point >= 0 && point <= 0x10ffff
          ? String.fromCodePoint(point)
          : ' ';
      });
  }

  private limitContextText(value: string) {
    const normalized = (value || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= MAX_CONTEXT_TEXT_CHARS) {
      return { content: normalized, truncated: false };
    }
    return {
      content: normalized.slice(0, MAX_CONTEXT_TEXT_CHARS).trim(),
      truncated: true,
    };
  }

  private labelFromUrl(url: URL) {
    const path = url.pathname.split('/').filter(Boolean).pop();
    return path ? `${url.hostname}/${path}` : url.hostname;
  }

  private normalizeContextSources(
    sources?: Array<{
      type?: string;
      label?: string;
      url?: string;
      content?: string;
      metadata?: Record<string, any>;
    }>,
  ): HiringAssessmentContextSource[] {
    return (sources || [])
      .map((source) => ({
        type: String(source.type || 'notes') as HiringAssessmentContextSource['type'],
        label: source.label?.trim(),
        url: source.url?.trim(),
        content: source.content?.trim(),
        metadata: source.metadata || undefined,
      }))
      .filter((source) => source.label || source.url || source.content);
  }

  private async enrichRepoContextSources(
    companyId: string,
    sources: HiringAssessmentContextSource[],
  ): Promise<HiringAssessmentContextSource[]> {
    const enriched: HiringAssessmentContextSource[] = [];

    for (const source of sources) {
      const repositoryId = source.metadata?.repositoryId
        ? String(source.metadata.repositoryId)
        : '';
      if (source.type !== 'repo' || !repositoryId) {
        enriched.push(source);
        continue;
      }

      const repo = await this.githubReposRepo.findOne({
        where: { id: repositoryId, companyId },
      });
      if (!repo) {
        throw new ForbiddenException(
          'Repository context is not available for this company.',
        );
      }
      if (!repo.isLinked) {
        throw new BadRequestException(
          `Link ${repo.fullName} in Integrations before using it.`,
        );
      }
      if (!this.isParsedGithubContext(repo)) {
        throw new BadRequestException(
          `Parse ${repo.fullName} in Integrations before using it.`,
        );
      }

      enriched.push({
        ...source,
        label: repo.fullName,
        url: repo.htmlUrl,
        content:
          source.content?.trim() || this.formatGithubRepositoryContext(repo),
        metadata: {
          ...(source.metadata || {}),
          repositoryId: repo.id,
          githubRepositoryId: repo.githubRepositoryId,
          branch: repo.selectedBranch || repo.defaultBranch || 'main',
          defaultBranch: repo.defaultBranch,
          private: repo.private,
          contextStatus: repo.contextStatus,
          contextSyncedAt: repo.contextSyncedAt
            ? repo.contextSyncedAt.toISOString()
            : null,
          contextSnapshot: repo.contextSnapshot || null,
        },
      });
    }

    return enriched;
  }

  private async repositoryIdsToContextSources(
    companyId: string,
    repositoryIds?: string[],
  ) {
    const ids = Array.from(new Set(repositoryIds || [])).filter(Boolean);
    const sources: HiringAssessmentContextSource[] = [];
    for (const repositoryId of ids) {
      const repo = await this.githubReposRepo.findOne({
        where: { id: repositoryId, companyId },
      });
      if (!repo) {
        throw new ForbiddenException(
          'Repository context is not available for this company.',
        );
      }
      if (!repo.isLinked) {
        throw new BadRequestException(
          `Link ${repo.fullName} in Integrations before using it.`,
        );
      }
      if (!this.isParsedGithubContext(repo)) {
        throw new BadRequestException(
          `Parse ${repo.fullName} in Integrations before using it.`,
        );
      }
      const snapshot = (repo.contextSnapshot || {}) as Record<string, any>;
      sources.push({
        type: 'repo',
        label: repo.fullName,
        url: repo.htmlUrl,
        content: this.formatGithubRepositoryContext(repo),
        metadata: {
          repositoryId: repo.id,
          githubRepositoryId: repo.githubRepositoryId,
          branch: repo.selectedBranch || repo.defaultBranch || 'main',
          defaultBranch: repo.defaultBranch,
          private: repo.private,
          language: snapshot.primaryLanguage || null,
          contextStatus: repo.contextStatus,
          contextSyncedAt: repo.contextSyncedAt
            ? repo.contextSyncedAt.toISOString()
            : null,
          contextSnapshot: repo.contextSnapshot || null,
        },
      });
    }
    return sources;
  }

  private contextSnapshotWithRepositories(
    base: Record<string, any> | null,
    sources: HiringAssessmentContextSource[],
  ) {
    if (!sources.length) return base;
    return {
      ...(base || {}),
      repositories: sources.map((source) => ({
        id: source.metadata?.repositoryId,
        fullName: source.label,
        htmlUrl: source.url,
        branch: source.metadata?.branch,
        contextStatus: source.metadata?.contextStatus,
        contextSyncedAt: source.metadata?.contextSyncedAt,
        contextSnapshot: source.metadata?.contextSnapshot || null,
      })),
    };
  }

  private async companyProfileToContextSource(
    companyId: string,
    placement: Placement | null,
    contextSources: HiringAssessmentContextSource[],
  ): Promise<HiringAssessmentContextSource | null> {
    const requested = contextSources.some(
      (source) => source.type === 'company_profile',
    );
    const inheritedByRole = placement?.companyProfileIncluded !== false;
    if (!requested && !inheritedByRole) return null;

    const profile = await this.companySettingsService
      .getProfileForCompany(companyId)
      .catch(() => null);
    if (!profile || profile.isActive === false) return null;

    const lines = [
      `Company: ${profile.displayName}`,
      profile.legalName ? `Legal name: ${profile.legalName}` : '',
      profile.website ? `Website: ${profile.website}` : '',
      profile.industry ? `Industry: ${profile.industry}` : '',
      profile.productType ? `Product type: ${profile.productType}` : '',
      profile.domain ? `Domain: ${profile.domain}` : '',
      profile.description ? `Description: ${profile.description}` : '',
      profile.companyContext
        ? `Hiring context and company notes: ${profile.companyContext}`
        : '',
      profile.hiringDefaults
        ? `Hiring defaults: ${JSON.stringify(profile.hiringDefaults)}`
        : '',
    ].filter(Boolean);

    return {
      type: 'company_profile',
      label: 'Company profile',
      content: lines.join('\n').slice(0, 12000),
      metadata: {
        companyId,
        slug: profile.slug,
        inherited: true,
        updatedAt: profile.updatedAt?.toISOString?.() || null,
      },
    };
  }

  private isParsedGithubContext(repo: GithubRepository) {
    return (
      Boolean(repo.contextSnapshot) &&
      (repo.contextStatus === 'parsed' || repo.contextStatus === 'ready')
    );
  }

  private formatGithubRepositoryContext(repo: GithubRepository) {
    const snapshot = (repo.contextSnapshot || {}) as Record<string, any>;
    const tree = (snapshot.tree || {}) as Record<string, any>;
    const intelligence = (snapshot.repoIntelligence || {}) as Record<string, any>;
    const readme = snapshot.readme as
      | { path?: string; content?: string; truncated?: boolean }
      | null
      | undefined;
    const manifests = Array.isArray(snapshot.manifests)
      ? (snapshot.manifests as Array<{
          path?: string;
          content?: string;
          truncated?: boolean;
        }>)
      : [];
    const languages = snapshot.languages
      ? Object.entries(snapshot.languages as Record<string, number>)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .slice(0, 8)
          .map(([language, bytes]) => `${language} (${bytes} bytes)`)
          .join(', ')
      : '';
    const topExtensions = Array.isArray(tree.topExtensions)
      ? tree.topExtensions
          .slice(0, 10)
          .map((item: any) => `${item.extension}: ${item.count}`)
          .join(', ')
      : '';
    const importantPaths = Array.isArray(tree.importantPaths)
      ? tree.importantPaths.slice(0, 80).join('\n')
      : '';

    const sections = [
      `Repository: ${repo.fullName}`,
      `URL: ${repo.htmlUrl}`,
      `Branch: ${repo.selectedBranch || repo.defaultBranch || 'main'}`,
      repo.contextStatus
        ? `Context status: ${repo.contextStatus}${
            repo.contextError ? ` (${repo.contextError})` : ''
          }`
        : '',
      languages ? `Languages: ${languages}` : '',
      Array.isArray(snapshot.topics) && snapshot.topics.length
        ? `Topics: ${snapshot.topics.join(', ')}`
        : '',
      tree.totalFiles !== undefined
        ? `Tree summary: ${tree.totalFiles} files, ${tree.totalDirectories || 0} directories${
            tree.truncated ? ', truncated by GitHub' : ''
          }.`
        : '',
      topExtensions ? `Top extensions: ${topExtensions}` : '',
      importantPaths ? `Important paths:\n${importantPaths}` : '',
      intelligence.stackSummary
        ? `Repo intelligence: ${intelligence.stackSummary}`
        : '',
      Array.isArray(intelligence.roleRelevantSkills) &&
      intelligence.roleRelevantSkills.length
        ? `Role-relevant skills: ${intelligence.roleRelevantSkills.join(', ')}`
        : '',
      Array.isArray(intelligence.assessmentIdeas) &&
      intelligence.assessmentIdeas.length
        ? `Assessment ideas:\n${intelligence.assessmentIdeas
            .slice(0, 6)
            .map((item: string) => `- ${item}`)
            .join('\n')}`
        : '',
      readme?.content
        ? `README (${readme.path || 'README'}${readme.truncated ? ', truncated' : ''}):\n${readme.content}`
        : '',
      manifests.length
        ? `Project files:\n${manifests
            .filter((file) => file.content)
            .map(
              (file) =>
                `### ${file.path}${file.truncated ? ' (truncated)' : ''}\n${file.content}`,
            )
            .join('\n\n')}`
        : '',
    ].filter(Boolean);

    return sections.join('\n\n').slice(0, 45_000);
  }

  private filesFromGeneratedAssessment(
    generated: GeneratedAssessmentPayload,
  ): HiringAssessmentFile[] {
    const files = (generated.files || [])
      .map((file) => ({
        path: this.safeAssessmentPath(file.path),
        content: String(file.content || '').trim(),
      }))
      .filter((file) => file.content);

    if (!files.find((file) => file.path.toLowerCase() === 'rubric.md')) {
      files.push({
        path: 'RUBRIC.md',
        content: this.rubricMarkdown(generated),
      });
    }

    if (!files.length) {
      files.push({
        path: 'README.md',
        content: this.generatedReadmeMarkdown(generated),
      });
    }

    return files;
  }

  private instructionsFromGeneratedAssessment(input: {
    generated: GeneratedAssessmentPayload;
    prompt: string;
    placement: Placement | null;
  }) {
    return [
      `Assessment objective: ${input.prompt.trim()}`,
      input.placement
        ? `Role context: ${input.placement.title}${input.placement.jobProfile ? ` (${input.placement.jobProfile})` : ''}.`
        : 'Role context: standalone company assessment.',
      `Candidate brief: ${input.generated.brief}`,
      input.generated.tasks.length
        ? `Tasks:\n${input.generated.tasks
            .map(
              (task, index) =>
                `${index + 1}. ${task.title}: ${task.instructions}`,
            )
            .join('\n')}`
        : '',
      input.generated.constraints.length
        ? `Constraints:\n${input.generated.constraints.map((item) => `- ${item}`).join('\n')}`
        : '',
      input.generated.reviewerNotes.length
        ? `Reviewer notes:\n${input.generated.reviewerNotes
            .map((item) => `- ${item}`)
            .join('\n')}`
        : '',
      input.generated.interviewerHandoffNotes.length
        ? `Future interviewer handoff:\n${input.generated.interviewerHandoffNotes
            .map((item) => `- ${item}`)
            .join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  private generatedReadmeMarkdown(generated: GeneratedAssessmentPayload) {
    return [
      `# ${generated.title}`,
      '',
      '## Candidate Brief',
      generated.brief,
      '',
      '## Tasks',
      ...generated.tasks.flatMap((task, index) => [
        `### ${index + 1}. ${task.title}`,
        task.instructions,
        '',
        'Deliverables:',
        ...task.deliverables.map((item) => `- ${item}`),
        '',
      ]),
      '## Constraints',
      ...generated.constraints.map((item) => `- ${item}`),
    ].join('\n');
  }

  private rubricMarkdown(generated: GeneratedAssessmentPayload) {
    return [
      '# Review Rubric',
      '',
      ...generated.scoringRubric.flatMap((item) => [
        `## ${item.criterion} (${item.points} pts)`,
        ...item.signals.map((signal) => `- ${signal}`),
        '',
      ]),
    ].join('\n');
  }

  private safeAssessmentPath(value: string) {
    const normalized = String(value || 'README.md')
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\.\./g, '')
      .trim();
    return normalized || 'README.md';
  }

  private summarizeContextSourcesForRun(
    sources: HiringAssessmentContextSource[],
  ) {
    return sources.map((source) => ({
      type: source.type,
      label: source.label || null,
      url: source.url || null,
      contentPreview: source.content ? source.content.slice(0, 1200) : null,
      metadata: {
        repositoryId: source.metadata?.repositoryId || null,
        branch: source.metadata?.branch || null,
        language: source.metadata?.language || null,
        source: source.metadata?.source || null,
        inherited: source.metadata?.inherited || null,
        repoIntelligence:
          source.metadata?.contextSnapshot?.repoIntelligence || null,
      },
    }));
  }

  private summarizeContextSnapshotForRun(snapshot: Record<string, any> | null) {
    if (!snapshot) return null;
    return {
      mode: snapshot.mode || null,
      roleId: snapshot.roleId || snapshot.selectedRole?.id || null,
      title: snapshot.title || snapshot.selectedRole?.title || null,
      companyProfileIncluded:
        snapshot.companyProfileIncluded ??
        snapshot.selectedRole?.companyProfileIncluded ??
        null,
      jobDescription: snapshot.jobDescription
        ? {
            url: snapshot.jobDescription.url || null,
            fileName: snapshot.jobDescription.fileName || null,
            hasText: Boolean(snapshot.jobDescription.text),
          }
        : null,
      repositories: Array.isArray(snapshot.repositories)
        ? snapshot.repositories.map((repo: any) => ({
            id: repo.id,
            fullName: repo.fullName,
            branch: repo.branch,
            contextStatus: repo.contextStatus,
            repoIntelligence: repo.contextSnapshot?.repoIntelligence || null,
          }))
        : [],
    };
  }

  private decorateGenerationRun(run: AssessmentGenerationRun) {
    return {
      id: run.id,
      companyId: run.companyId,
      roleId: run.roleId,
      assessmentId: run.assessmentId,
      status: run.status,
      prompt: run.prompt,
      mode: run.mode,
      generationMode: run.generationMode,
      repositoryIds: run.repositoryIds || [],
      provider: run.provider,
      model: run.model,
      error: run.error,
      contextSources: run.contextSources || [],
      inputSnapshot: run.inputSnapshot,
      outputSnapshot: run.outputSnapshot,
      validationResult: run.validationResult,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
    };
  }

  private decorateAssessment(assessment: HiringAssessment) {
    const links = (assessment.placementLinks || []).map((link) => ({
      id: link.id,
      placementId: link.placementId,
      roleTitle: link.placement?.title || null,
      stageName: link.stageName,
      isPrimary: link.isPrimary,
      attachedAt: link.attachedAt,
    }));

    return {
      ...assessment,
      attachedRoles: links,
      attachedRoleCount: links.length,
    };
  }

  private decorateLink(
    link: HiringAssessmentPlacementLink,
    assessment: HiringAssessment,
    placement: Placement,
  ) {
    return {
      ...assessment,
      attachmentId: link.id,
      attachedStageName: link.stageName,
      isPrimary: link.isPrimary,
      role: {
        id: placement.id,
        title: placement.title,
      },
    };
  }

  private buildRoleContextSnapshot(placement: Placement) {
    return {
      roleId: placement.id,
      title: placement.title,
      companyName: placement.companyName,
      jobProfile: placement.jobProfile,
      description: placement.description,
      skillsRequired: placement.skillsRequired || [],
      githubRepositoryUrl: placement.githubRepositoryUrl || null,
      issueTrackerUrl: placement.issueTrackerUrl || null,
      documentationUrl: placement.documentationUrl || null,
      workContext: placement.workContext || null,
      pipelineNotes: placement.pipelineNotes || null,
      pipelineTemplateKey: placement.pipelineTemplateKey || null,
      companyProfileIncluded: placement.companyProfileIncluded,
    };
  }

  private inferAssessmentName(prompt: string) {
    const firstLine = prompt.trim().split(/\r?\n/)[0] || 'New assessment';
    return firstLine.length > 72 ? `${firstLine.slice(0, 69)}...` : firstLine;
  }

  private inferLanguage(contextSources: HiringAssessmentContextSource[]) {
    const repo = contextSources.find((source) => source.type === 'repo');
    return repo?.metadata?.language ? String(repo.metadata.language) : null;
  }

  private buildStandaloneGeneratedInstructions(input: {
    prompt: string;
    placement: Placement | null;
    contextSources: HiringAssessmentContextSource[];
  }) {
    const sourceLines = input.contextSources.map((source) => {
      const detail = source.url || source.content || source.label || '';
      return `- ${source.type}: ${detail}`.slice(0, 1200);
    });

    return [
      `Assessment objective: ${input.prompt.trim()}`,
      input.placement
        ? `Role context: ${input.placement.title}${input.placement.jobProfile ? ` (${input.placement.jobProfile})` : ''}.`
        : 'Role context: standalone company assessment.',
      sourceLines.length
        ? `Knowledge base:\n${sourceLines.join('\n')}`
        : 'Knowledge base: no external context has been attached yet.',
      'Candidate deliverables: submit a focused solution, explain assumptions, and include validation evidence where relevant.',
      'Reviewer focus: correctness, clarity, practical judgment, edge cases, and communication.',
    ].join('\n\n');
  }

  private buildStandaloneGeneratedFiles(input: {
    name: string;
    prompt: string;
    placement: Placement | null;
    contextSnapshot: Record<string, any> | null;
    contextSources: HiringAssessmentContextSource[];
  }): HiringAssessmentFile[] {
    const readme = [
      `# ${input.name}`,
      '',
      '## Candidate Brief',
      input.prompt.trim(),
      '',
      '## Attached Context',
      input.contextSources.length
        ? input.contextSources
            .map((source) => `- ${source.label || source.type}: ${source.url || source.content || 'attached'}`)
            .join('\n')
        : '- No external context attached',
      '',
      '## Expected Submission',
      '- State assumptions.',
      '- Keep the solution scoped.',
      '- Include tests, screenshots, notes, or validation output where useful.',
    ].join('\n');

    return [
      { path: 'README.md', content: readme },
      {
        path: 'emble-assessment-context.json',
        content: JSON.stringify(
          {
            role: input.placement ? this.buildRoleContextSnapshot(input.placement) : null,
            contextSnapshot: input.contextSnapshot,
            contextSources: input.contextSources,
          },
          null,
          2,
        ),
      },
    ];
  }
}
