import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import {
  Placement,
  PlacementStatus,
  PlacementType,
  DriveVerificationStatus,
  WorkMode,
} from './entities/placement.entity';
import {
  HiringAssessment,
  HiringAssessmentContextSource,
  HiringAssessmentFile,
} from './entities/hiring-assessment.entity';
import { HiringAssessmentPlacementLink } from './entities/hiring-assessment-placement-link.entity';
import { User, UserRole } from '../users/user.entity';
import {
  Application,
  CandidatePipelineStage,
} from '../applications/entities/application.entity';
import { CreateHiringAssessmentDto } from './dto/create-hiring-assessment.dto';
import { UpdateHiringAssessmentDto } from './dto/update-hiring-assessment.dto';
import { GenerateHiringAssessmentDto } from './dto/generate-hiring-assessment.dto';
import { AttachHiringAssessmentDto } from './dto/attach-hiring-assessment.dto';
import {
  HIRING_ROLE_TEMPLATES,
  getHiringRoleTemplate,
  HiringRoleTemplate,
} from './hiring-role-templates';
import { GithubRepository } from '../integrations/entities/github-repository.entity';

type PipelineSummary = Record<CandidatePipelineStage, number>;

const PIPELINE_STAGES = Object.values(CandidatePipelineStage);

@Injectable()
export class PlacementsService {
  constructor(
    @InjectRepository(Placement)
    private readonly placementRepo: Repository<Placement>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(HiringAssessment)
    private readonly assessmentRepo: Repository<HiringAssessment>,
    @InjectRepository(HiringAssessmentPlacementLink)
    private readonly assessmentLinkRepo: Repository<HiringAssessmentPlacementLink>,
    @InjectRepository(GithubRepository)
    private readonly githubReposRepo: Repository<GithubRepository>,
  ) {}

  private emptyPipelineSummary(): PipelineSummary {
    return PIPELINE_STAGES.reduce((summary, stage) => {
      summary[stage] = 0;
      return summary;
    }, {} as PipelineSummary);
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

  private async getPipelineSummaryForPlacement(
    placementId: string,
  ): Promise<{ total: number; stages: PipelineSummary }> {
    const applications = await this.applicationRepo.find({
      where: { placementId },
      select: ['id', 'pipelineStage', 'expiresAt'],
    });
    const stages = this.emptyPipelineSummary();

    for (const application of applications) {
      stages[this.getEffectivePipelineStage(application)] += 1;
    }

    return {
      total: applications.length,
      stages,
    };
  }

  private async decoratePlacement(placement: Placement) {
    const [pipeline, assessmentCount, latestActivity] = await Promise.all([
      this.getPipelineSummaryForPlacement(placement.id),
      this.assessmentLinkRepo.count({ where: { placementId: placement.id } }),
      this.applicationRepo.findOne({
        where: { placementId: placement.id },
        order: { updatedAt: 'DESC' },
        select: [
          'id',
          'candidateName',
          'candidateEmail',
          'pipelineStage',
          'inviteUrl',
          'candidateJoinUrl',
          'interviewLaunchStatus',
          'interviewEmailStatus',
          'updatedAt',
        ],
      }),
    ]);

    return {
      ...placement,
      pipelineSummary: pipeline.stages,
      candidateCount: pipeline.total,
      pendingReviewCount:
        pipeline.stages[CandidatePipelineStage.PENDING_REVIEW],
      assessmentCount,
      latestCandidateActivity: latestActivity
        ? this.withEffectiveActivityStage(latestActivity)
        : null,
    };
  }

  private withEffectiveActivityStage(application: Application) {
    return {
      id: application.id,
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail,
      pipelineStage: this.getEffectivePipelineStage(application),
      inviteUrl: application.inviteUrl,
      candidateJoinUrl: application.candidateJoinUrl,
      interviewLaunchStatus: application.interviewLaunchStatus,
      interviewEmailStatus: application.interviewEmailStatus,
      updatedAt: application.updatedAt,
    };
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

  private templateToPipelineStages(template?: HiringRoleTemplate | null) {
    if (!template) {
      return [];
    }

    return template.stages.map((stage, index) => ({
      id: `${template.key}-${index + 1}`,
      order: index + 1,
      name: stage.name,
      kind: stage.kind,
      description: stage.description,
    }));
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

  private async buildRepositoryContextSources(
    companyId: string | undefined,
    repositoryIds?: string[],
  ): Promise<HiringAssessmentContextSource[]> {
    const ids = Array.from(new Set(repositoryIds || [])).filter(Boolean);
    if (!ids.length) return [];
    if (!companyId) {
      throw new BadRequestException('Company context is required for repositories.');
    }

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

  private mergeWorkContextWithRepositorySources(
    workContext: string | undefined,
    sources: HiringAssessmentContextSource[],
  ) {
    const repoContext = sources.map((source) =>
      [
        `[Integrated GitHub Context: ${source.metadata?.repositoryId || source.label}]`,
        source.content,
        '[/Integrated GitHub Context]',
      ].filter(Boolean).join('\n'),
    );
    return [workContext?.trim(), ...repoContext].filter(Boolean).join('\n\n') || undefined;
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

  private isParsedGithubContext(repo: GithubRepository) {
    return (
      Boolean(repo.contextSnapshot) &&
      (repo.contextStatus === 'parsed' || repo.contextStatus === 'ready')
    );
  }

  private formatGithubRepositoryContext(repo: GithubRepository) {
    const snapshot = (repo.contextSnapshot || {}) as Record<string, any>;
    const tree = (snapshot.tree || {}) as Record<string, any>;
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

    return [
      `Repository: ${repo.fullName}`,
      `URL: ${repo.htmlUrl}`,
      `Branch: ${repo.selectedBranch || repo.defaultBranch || 'main'}`,
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
    ].filter(Boolean).join('\n\n').slice(0, 45_000);
  }

  private buildGeneratedAssessmentName(
    placement: Placement,
    generateDto: GenerateHiringAssessmentDto,
  ) {
    if (generateDto.assessmentName?.trim()) {
      return generateDto.assessmentName.trim();
    }

    const stage = generateDto.stageName?.trim();
    if (stage) {
      return `${stage} - ${placement.title}`.slice(0, 160);
    }

    return `${placement.title} assessment`.slice(0, 160);
  }

  private buildGeneratedInstructions(
    placement: Placement,
    generateDto: GenerateHiringAssessmentDto,
    template?: HiringRoleTemplate,
  ) {
    const sources = [
      placement.githubRepositoryUrl
        ? `GitHub repository: ${placement.githubRepositoryUrl}`
        : '',
      placement.issueTrackerUrl ? `Tickets/issues: ${placement.issueTrackerUrl}` : '',
      placement.documentationUrl ? `Docs: ${placement.documentationUrl}` : '',
      placement.workContext ? `Work context: ${placement.workContext}` : '',
      placement.pipelineNotes ? `Pipeline notes: ${placement.pipelineNotes}` : '',
    ].filter(Boolean);

    return [
      `Assessment objective: ${generateDto.prompt.trim()}`,
      `Role: ${placement.title}${placement.jobProfile ? ` (${placement.jobProfile})` : ''}.`,
      template ? `Template: ${template.name}.` : '',
      generateDto.stageName ? `Pipeline stage: ${generateDto.stageName}.` : '',
      sources.length
        ? `Use this attached role context as the knowledge base:\n${sources
            .map((source) => `- ${source}`)
            .join('\n')}`
        : 'No external role context is attached yet. Keep the task scoped to the job description and stated skills.',
      'Candidate deliverables: working implementation or written solution, brief tradeoff notes, and tests or validation evidence where applicable.',
      'Reviewer focus: correctness, clarity, ownership, edge cases, communication, and whether the solution fits the real product context.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  private buildGeneratedFiles(
    placement: Placement,
    generateDto: GenerateHiringAssessmentDto,
    template?: HiringRoleTemplate,
  ): HiringAssessmentFile[] {
    const context = this.buildRoleContextSnapshot(placement);
    const stageName = generateDto.stageName || template?.stages[0]?.name || 'Assessment';
    const readme = [
      `# ${this.buildGeneratedAssessmentName(placement, generateDto)}`,
      '',
      `## Candidate Brief`,
      generateDto.prompt.trim(),
      '',
      `## Role Context`,
      `- Role: ${placement.title}`,
      placement.jobProfile ? `- Profile: ${placement.jobProfile}` : '',
      placement.githubRepositoryUrl
        ? `- Repository knowledge base: ${placement.githubRepositoryUrl}`
        : '- Repository knowledge base: not attached',
      placement.issueTrackerUrl
        ? `- Ticket source: ${placement.issueTrackerUrl}`
        : '- Ticket source: not attached',
      placement.documentationUrl
        ? `- Docs source: ${placement.documentationUrl}`
        : '- Docs source: not attached',
      '',
      `## Stage`,
      `${stageName}`,
      '',
      `## Expected Submission`,
      '- Explain assumptions and tradeoffs.',
      '- Include tests, screenshots, or validation notes when relevant.',
      '- Keep changes focused and production-minded.',
    ]
      .filter((line) => line !== '')
      .join('\n');

    return [
      {
        path: 'README.md',
        content: readme,
      },
      {
        path: 'emble-role-context.json',
        content: JSON.stringify(context, null, 2),
      },
    ];
  }

  getRoleTemplates() {
    return HIRING_ROLE_TEMPLATES;
  }

  async create(createPlacementDto: CreatePlacementDto): Promise<Placement> {
    if (createPlacementDto.companyId) {
      const user = await this.usersRepo.findOne({
        where: { id: createPlacementDto.companyId },
      });
      if (user && user.subscriptionPlan === 'free') {
        const drivesCount = await this.placementRepo.count({
          where: { companyId: user.id },
        });
        if (drivesCount >= 1) {
          throw new ForbiddenException(
            'Free tier is limited to 1 placement drive. Please contact sales to upgrade your pipeline limit.',
          );
        }
      }
    }

    const { repositoryIds, ...placementInput } = createPlacementDto;
    const repositorySources = await this.buildRepositoryContextSources(
      placementInput.companyId,
      repositoryIds,
    );
    const template = getHiringRoleTemplate(placementInput.pipelineTemplateKey);
    const placement = this.placementRepo.create({
      ...placementInput,
      githubRepositoryUrl:
        placementInput.githubRepositoryUrl || repositorySources[0]?.url || undefined,
      workContext: this.mergeWorkContextWithRepositorySources(
        placementInput.workContext,
        repositorySources,
      ),
      pipelineStages:
        placementInput.pipelineStages?.length
          ? placementInput.pipelineStages
          : this.templateToPipelineStages(template),
      automationEnabled: placementInput.automationEnabled ?? true,
      companyProfileIncluded: placementInput.companyProfileIncluded ?? true,
    });
    return await this.placementRepo.save(placement);
  }

  async findMyDrives(companyId: string) {
    const placements = await this.placementRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });

    return Promise.all(placements.map((placement) => this.decoratePlacement(placement)));
  }

  async findAll(
    type?: PlacementType,
    status?: PlacementStatus,
    isSuperAdmin: boolean = false,
    mode?: WorkMode,
  ): Promise<Placement[]> {
    const query = this.placementRepo.createQueryBuilder('placement');

    if (type) {
      query.andWhere('placement.type = :type', { type });
    }
    if (status) {
      query.andWhere('placement.status = :status', { status });
    }
    if (mode) {
      query.andWhere('placement.workMode = :mode', { mode });
    }
    if (!isSuperAdmin) {
      query.andWhere('placement.verificationStatus = :vStatus', {
        vStatus: DriveVerificationStatus.APPROVED,
      });
    }

    // Order by newest first
    query.orderBy('placement.createdAt', 'DESC');

    return await query.getMany();
  }

  async findPublicActiveJobs(
    type?: PlacementType,
    mode?: WorkMode,
    q?: string,
  ): Promise<Placement[]> {
    const query = this.placementRepo
      .createQueryBuilder('placement')
      .where('placement.verificationStatus = :verificationStatus', {
        verificationStatus: DriveVerificationStatus.APPROVED,
      })
      .andWhere('placement.status = :status', {
        status: PlacementStatus.ACTIVE,
      });

    if (type) {
      query.andWhere('placement.type = :type', { type });
    }

    if (mode) {
      query.andWhere('placement.workMode = :mode', { mode });
    }

    if (q && q.trim()) {
      query.andWhere(
        '(LOWER(placement.title) LIKE :q OR LOWER(placement.companyName) LIKE :q OR LOWER(placement.jobProfile) LIKE :q)',
        { q: `%${q.trim().toLowerCase()}%` },
      );
    }

    return query.orderBy('placement.createdAt', 'DESC').getMany();
  }

  async getPublicActiveJobStats(): Promise<{
    totalActiveJobs: number;
    companiesHiring: number;
  }> {
    const baseQuery = this.placementRepo
      .createQueryBuilder('placement')
      .where('placement.verificationStatus = :verificationStatus', {
        verificationStatus: DriveVerificationStatus.APPROVED,
      })
      .andWhere('placement.status = :status', {
        status: PlacementStatus.ACTIVE,
      });

    const totalActiveJobs = await baseQuery.getCount();

    const companies = await this.placementRepo
      .createQueryBuilder('placement')
      .select('COUNT(DISTINCT placement.companyName)', 'count')
      .where('placement.verificationStatus = :verificationStatus', {
        verificationStatus: DriveVerificationStatus.APPROVED,
      })
      .andWhere('placement.status = :status', {
        status: PlacementStatus.ACTIVE,
      })
      .getRawOne<{ count: string }>();

    return {
      totalActiveJobs,
      companiesHiring: Number(companies?.count || 0),
    };
  }

  async verifyDrive(
    id: string,
    verificationStatus: DriveVerificationStatus,
    rejectionReason?: string,
  ): Promise<Placement> {
    const placement = await this.findOne(id);
    placement.verificationStatus = verificationStatus;
    if (rejectionReason !== undefined) {
      placement.rejectionReason = rejectionReason;
    }
    return await this.placementRepo.save(placement);
  }

  async getPipelineSummary(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const placement = await this.findOne(placementId, actorId, actorRole);
    const pipeline = await this.getPipelineSummaryForPlacement(placement.id);

    return {
      roleId: placement.id,
      roleTitle: placement.title,
      total: pipeline.total,
      stages: pipeline.stages,
    };
  }

  async findAssessments(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    await this.findOne(placementId, actorId, actorRole);
    const links = await this.assessmentLinkRepo.find({
      where: { placementId },
      relations: ['assessment'],
      order: { updatedAt: 'DESC' },
    });
    const linkedIds = new Set(links.map((link) => link.assessmentId));
    const legacy = await this.assessmentRepo.find({
      where: { placementId },
      order: { createdAt: 'DESC' },
    });

    return [
      ...links
        .filter((link) => link.assessment)
        .map((link) => this.decorateAttachedAssessment(link)),
      ...legacy
        .filter((assessment) => !linkedIds.has(assessment.id))
        .map((assessment) => ({
          ...assessment,
          attachmentId: null,
          attachedStageName: assessment.stageName,
          isPrimary: false,
        })),
    ];
  }

  async findAssessment(
    placementId: string,
    assessmentId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const { assessment, link } = await this.findAssessmentEntityForPlacement(
      placementId,
      assessmentId,
      actorId,
      actorRole,
    );
    return link ? this.decorateAttachedAssessment(link) : assessment;
  }

  async createAssessment(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
    createDto: CreateHiringAssessmentDto,
  ) {
    const placement = await this.findOne(placementId, actorId, actorRole);
    const files = createDto.files || [];
    this.assertUniqueAssessmentPaths(files);

    const assessment = this.assessmentRepo.create({
      placementId: placement.id,
      companyId: placement.companyId || actorId,
      name: createDto.name.trim(),
      language: createDto.language?.trim() || null,
      timeLimitMinutes: createDto.timeLimitMinutes ?? null,
      instructions: createDto.instructions?.trim() || null,
      stageName: createDto.stageName?.trim() || null,
      prompt: createDto.prompt?.trim() || null,
      contextSnapshot:
        createDto.contextSnapshot || this.buildRoleContextSnapshot(placement),
      contextSources: (createDto.contextSources || []) as any,
      files,
    } as Partial<HiringAssessment>);

    const saved = await this.assessmentRepo.save(assessment);
    await this.attachAssessment(placementId, saved.id, actorId, actorRole, {
      stageName: createDto.stageName,
      isPrimary: true,
      contextSnapshot: saved.contextSnapshot || undefined,
    });
    return this.findAssessment(placementId, saved.id, actorId, actorRole);
  }

  async generateAssessment(
    placementId: string,
    actorId: string,
    actorRole: UserRole,
    generateDto: GenerateHiringAssessmentDto,
  ) {
    const placement = await this.findOne(placementId, actorId, actorRole);
    const template =
      getHiringRoleTemplate(generateDto.templateKey) ||
      getHiringRoleTemplate(placement.pipelineTemplateKey);
    const repositorySources = await this.buildRepositoryContextSources(
      placement.companyId || actorId,
      generateDto.repositoryIds,
    );
    const contextSources = [
      ...((generateDto.contextSources || []) as HiringAssessmentContextSource[]),
      ...repositorySources,
    ];
    const contextSnapshot = this.contextSnapshotWithRepositories(
      generateDto.contextSnapshot || this.buildRoleContextSnapshot(placement),
      repositorySources,
    );
    const files = this.buildGeneratedFiles(placement, generateDto, template);
    this.assertUniqueAssessmentPaths(files);

    const assessment = this.assessmentRepo.create({
      placementId: placement.id,
      companyId: placement.companyId || actorId,
      name: this.buildGeneratedAssessmentName(placement, generateDto),
      language:
        generateDto.language?.trim() || template?.defaultLanguage || 'typescript',
      timeLimitMinutes:
        generateDto.timeLimitMinutes ??
        template?.defaultTimeLimitMinutes ??
        90,
      instructions: this.buildGeneratedInstructions(
        placement,
        generateDto,
        template,
      ),
      stageName:
        generateDto.stageName?.trim() || template?.stages[0]?.name || null,
      prompt: generateDto.prompt.trim(),
      contextSnapshot,
      contextSources: contextSources as any,
      files,
    } as Partial<HiringAssessment>);

    const saved = await this.assessmentRepo.save(assessment);
    await this.attachAssessment(placementId, saved.id, actorId, actorRole, {
      stageName: saved.stageName || undefined,
      isPrimary: true,
      contextSnapshot: saved.contextSnapshot || undefined,
    });
    return this.findAssessment(placementId, saved.id, actorId, actorRole);
  }

  async updateAssessment(
    placementId: string,
    assessmentId: string,
    actorId: string,
    actorRole: UserRole,
    updateDto: UpdateHiringAssessmentDto,
  ) {
    const { assessment } = await this.findAssessmentEntityForPlacement(
      placementId,
      assessmentId,
      actorId,
      actorRole,
    );

    if (updateDto.files) {
      this.assertUniqueAssessmentPaths(updateDto.files);
      assessment.files = updateDto.files;
      assessment.version += 1;
    }

    if (updateDto.name !== undefined) {
      assessment.name = updateDto.name.trim();
    }
    if (updateDto.language !== undefined) {
      assessment.language = updateDto.language?.trim() || null;
    }
    if (updateDto.timeLimitMinutes !== undefined) {
      assessment.timeLimitMinutes = updateDto.timeLimitMinutes;
    }
    if (updateDto.instructions !== undefined) {
      assessment.instructions = updateDto.instructions?.trim() || null;
    }
    if (updateDto.stageName !== undefined) {
      assessment.stageName = updateDto.stageName?.trim() || null;
    }
    if (updateDto.prompt !== undefined) {
      assessment.prompt = updateDto.prompt?.trim() || null;
    }
    if (updateDto.contextSources !== undefined) {
      assessment.contextSources = updateDto.contextSources as any;
    }
    if (updateDto.contextSnapshot !== undefined) {
      assessment.contextSnapshot = updateDto.contextSnapshot || null;
    }
    if (updateDto.status !== undefined) {
      assessment.status = updateDto.status;
    }

    return this.assessmentRepo.save(assessment);
  }

  async attachAssessment(
    placementId: string,
    assessmentId: string,
    actorId: string,
    actorRole: UserRole,
    attachDto: AttachHiringAssessmentDto = {},
  ) {
    const placement = await this.findOne(placementId, actorId, actorRole);
    const assessment = await this.assessmentRepo.findOne({
      where: { id: assessmentId },
    });
    if (!assessment) {
      throw new NotFoundException('Assessment not found.');
    }
    if (
      actorRole === UserRole.COMPANY_ADMIN &&
      assessment.companyId !== (placement.companyId || actorId)
    ) {
      throw new ForbiddenException('Assessment does not belong to this company.');
    }

    const shouldSetPrimary =
      attachDto.isPrimary === true ||
      !(await this.assessmentLinkRepo.findOne({
        where: { placementId, isPrimary: true },
        select: ['id'],
      }));
    if (shouldSetPrimary) {
      await this.assessmentLinkRepo.update({ placementId }, { isPrimary: false });
    }

    let link = await this.assessmentLinkRepo.findOne({
      where: { placementId, assessmentId },
    });
    if (!link) {
      link = this.assessmentLinkRepo.create({
        placementId,
        assessmentId,
      });
    }

    link.companyId = placement.companyId || assessment.companyId || actorId;
    link.stageName =
      attachDto.stageName?.trim() || assessment.stageName || null;
    link.isPrimary = shouldSetPrimary || link.isPrimary;
    link.contextSnapshot =
      attachDto.contextSnapshot || this.buildRoleContextSnapshot(placement);

    assessment.placementId = assessment.placementId || placement.id;
    assessment.contextSnapshot = assessment.contextSnapshot || link.contextSnapshot;
    await this.assessmentRepo.save(assessment);

    const saved = await this.assessmentLinkRepo.save(link);
    saved.assessment = assessment;
    return this.decorateAttachedAssessment(saved);
  }

  async detachAssessment(
    placementId: string,
    assessmentId: string,
    actorId: string,
    actorRole: UserRole,
  ) {
    const placement = await this.findOne(placementId, actorId, actorRole);
    const link = await this.assessmentLinkRepo.findOne({
      where: {
        placementId,
        assessmentId,
        companyId: placement.companyId || actorId,
      },
    });
    if (!link) {
      throw new NotFoundException('Assessment is not attached to this role.');
    }
    await this.assessmentLinkRepo.remove(link);
    return { detached: true };
  }

  private decorateAttachedAssessment(link: HiringAssessmentPlacementLink) {
    return {
      ...link.assessment,
      attachmentId: link.id,
      attachedStageName: link.stageName,
      isPrimary: link.isPrimary,
      attachedAt: link.attachedAt,
    };
  }

  private async findAssessmentEntityForPlacement(
    placementId: string,
    assessmentId: string,
    actorId: string,
    actorRole: UserRole,
  ): Promise<{
    assessment: HiringAssessment;
    link: HiringAssessmentPlacementLink | null;
  }> {
    const placement = await this.findOne(placementId, actorId, actorRole);
    const link = await this.assessmentLinkRepo.findOne({
      where: { assessmentId, placementId },
      relations: ['assessment'],
    });
    if (link?.assessment) {
      return { assessment: link.assessment, link };
    }

    const assessment = await this.assessmentRepo.findOne({
      where: { id: assessmentId },
    });
    if (
      !assessment ||
      (assessment.placementId !== placementId &&
        assessment.companyId !== (placement.companyId || actorId))
    ) {
      throw new NotFoundException('Assessment not found.');
    }

    if (
      actorRole === UserRole.COMPANY_ADMIN &&
      assessment.companyId !== (placement.companyId || actorId)
    ) {
      throw new ForbiddenException('Assessment does not belong to this company.');
    }

    return { assessment, link: null };
  }

  private assertPlacementAccess(
    placement: Placement,
    actorId?: string,
    actorRole?: UserRole,
  ) {
    if (!actorId || !actorRole) {
      return;
    }
    if (actorRole === UserRole.SUPER_ADMIN) {
      return;
    }
    if (
      actorRole === UserRole.COMPANY_ADMIN &&
      placement.companyId !== actorId
    ) {
      throw new ForbiddenException('Access denied. You do not own this drive.');
    }
  }

  async findOne(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
  ): Promise<Placement> {
    const placement = await this.placementRepo.findOne({ where: { id } });
    if (!placement) {
      throw new NotFoundException(`Placement Drive with ID ${id} not found`);
    }
    this.assertPlacementAccess(placement, actorId, actorRole);
    return placement;
  }

  async update(
    id: string,
    updatePlacementDto: UpdatePlacementDto,
    actorId?: string,
    actorRole?: UserRole,
  ): Promise<Placement> {
    const placement = await this.findOne(id, actorId, actorRole);

    if (actorRole === UserRole.COMPANY_ADMIN) {
      delete (updatePlacementDto as Partial<UpdatePlacementDto>).companyId;
      delete (updatePlacementDto as Partial<UpdatePlacementDto>).companyName;
    }

    Object.assign(placement, updatePlacementDto);
    return await this.placementRepo.save(placement);
  }

  async remove(
    id: string,
    actorId?: string,
    actorRole?: UserRole,
  ): Promise<void> {
    const placement = await this.findOne(id, actorId, actorRole);
    await this.placementRepo.remove(placement);
  }
}
