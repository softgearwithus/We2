import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createHmac,
  createPrivateKey,
  createSign,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import { Repository } from 'typeorm';
import { GithubInstallation } from './entities/github-installation.entity';
import { GithubRepository } from './entities/github-repository.entity';
import { LinkGithubRepositoryDto } from './dto/link-github-repository.dto';
import { AssessmentAiService } from '../common/assessment-ai.service';
import { CompanySettingsService } from '../company-settings/company-settings.service';

type GithubStatePayload = {
  companyId: string;
  actorId: string;
  next?: string;
  nonce: string;
  exp: number;
};

type GithubConfigStatus = {
  configured: boolean;
  missing: string[];
  slug: string;
  appId: string;
  privateKey: string;
  privateKeyValid: boolean;
  clientId: string;
  clientSecret: string;
  stateSecret: string;
};

type ListGithubRepositoriesOptions = {
  sync?: boolean;
  linked?: boolean;
  available?: boolean;
};

const GITHUB_REPO_CONTEXT_FILE_BYTES = 128 * 1024;
const GITHUB_REPO_CONTEXT_TEXT_CHARS = 12_000;
const GITHUB_REPO_CONTEXT_MANIFEST_LIMIT = 8;
const GITHUB_REPO_CONTEXT_PATH_LIMIT = 120;
const GITHUB_SECRET_PATTERNS: RegExp[] = [
  /(api[_-]?key|secret|token|password|client[_-]?secret)\s*[:=]\s*["']?[^"'\s]+/gi,
  /(AKIA[0-9A-Z]{16})/g,
  /(ghp_[A-Za-z0-9_]{20,})/g,
  /(-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----)/g,
];

const REPO_CONTEXT_FILE_NAMES = new Set([
  'package.json',
  'tsconfig.json',
  'jsconfig.json',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'vite.config.js',
  'vite.config.ts',
  'nuxt.config.ts',
  'angular.json',
  'pyproject.toml',
  'requirements.txt',
  'pipfile',
  'poetry.lock',
  'go.mod',
  'cargo.toml',
  'composer.json',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'readme.md',
  'readme.mdx',
]);

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    @InjectRepository(GithubInstallation)
    private readonly githubInstallationsRepo: Repository<GithubInstallation>,
    @InjectRepository(GithubRepository)
    private readonly githubReposRepo: Repository<GithubRepository>,
    private readonly configService: ConfigService,
    private readonly assessmentAiService: AssessmentAiService,
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  getGithubInstallUrl(companyId: string, actorId: string, next?: string) {
    const config = this.getGithubConfigStatus();

    if (!config.configured) {
      return {
        configured: false,
        installUrl: null,
        missing: config.missing,
        message: `GitHub App setup required: ${config.missing.join(', ')}.`,
        requiredPermissions: this.githubRequiredPermissions(),
      };
    }

    const state = this.signGithubState({
      companyId,
      actorId,
      next,
      nonce: randomBytes(12).toString('hex'),
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    });

    return {
      configured: true,
      installUrl: `https://github.com/apps/${encodeURIComponent(config.slug)}/installations/new?state=${encodeURIComponent(state)}`,
      requiredPermissions: this.githubRequiredPermissions(),
    };
  }

  async completeGithubInstallation(input: {
    installationId: string;
    setupAction?: string;
    code?: string;
    state: string;
  }) {
    const payload = this.verifyGithubState(input.state);
    const config = this.getGithubConfigStatus();
    if (!config.configured) {
      throw new InternalServerErrorException(
        `GitHub App setup is incomplete: ${config.missing.join(', ')}.`,
      );
    }

    const userAccessToken = input.code?.trim()
      ? await this.createGithubUserAccessToken(input.code.trim())
      : null;
    const installationIds = input.installationId?.trim()
      ? [input.installationId.trim()]
      : userAccessToken
        ? await this.listUserInstallationIds(userAccessToken)
        : [];

    if (!installationIds.length) {
      throw new BadRequestException(
        'GitHub did not return an installation id. Reinstall the app from Emble and keep OAuth during installation enabled.',
      );
    }

    for (const installationId of installationIds) {
      let installation = await this.githubInstallationsRepo.findOne({
        where: { companyId: payload.companyId, installationId },
      });

      if (userAccessToken) {
        await this.verifyUserCanAccessInstallationToken(
          userAccessToken,
          installationId,
        );
      } else if (!installation) {
        throw new BadRequestException(
          'GitHub did not return an authorization code. Enable OAuth during installation for the GitHub App.',
        );
      }

      if (!installation) {
        installation = this.githubInstallationsRepo.create({
          companyId: payload.companyId,
          installationId,
        });
      }

      installation.installedAt = new Date();
      await this.githubInstallationsRepo.save(installation);

      try {
        await this.syncGithubRepositories(payload.companyId, installationId);
        await this.companySettingsService.logAction(
          payload.companyId,
          { id: payload.actorId },
          {
            action: 'company.github.synced',
            target: installationId,
          },
        );
      } catch (error) {
        this.logger.warn(
          `GitHub installation ${installationId} saved, but repository sync failed: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    }

    return {
      companyId: payload.companyId,
      next: this.buildFrontendRedirect(
        this.withGithubResult(payload.next || '/industry/assessments/new', 'connected'),
      ),
    };
  }

  buildGithubFailureRedirect(state: string | undefined, error: unknown) {
    let next = '/industry/assessments/new';
    try {
      const payload = state ? this.verifyGithubState(state) : null;
      if (payload?.next?.startsWith('/')) {
        next = payload.next;
      }
    } catch {
      // Fall back to the assessment setup screen when state is invalid.
    }

    const glue = next.includes('?') ? '&' : '?';
    const reason = encodeURIComponent(this.githubSafeErrorMessage(error));
    return this.buildFrontendRedirect(`${next}${glue}github=error&reason=${reason}`);
  }

  async getGithubStatus(companyId: string) {
    const config = this.getGithubConfigStatus();
    const [installations, repos] = await Promise.all([
      this.githubInstallationsRepo.find({
        where: { companyId },
        order: { updatedAt: 'DESC' },
      }),
      this.githubReposRepo.find({
        where: { companyId },
        select: [
          'id',
          'isLinked',
          'contextStatus',
          'contextSnapshot',
          'contextSyncedAt',
          'contextError',
        ],
      }),
    ]);
    const linkedCount = repos.filter((repo) => repo.isLinked).length;
    const availableCount = repos.filter((repo) => !repo.isLinked).length;
    const parsedCount = repos.filter(
      (repo) => repo.isLinked && this.isParsedGithubContext(repo),
    ).length;
    const account = installations.find((installation) => installation.accountLogin);
    const lastSyncedAt = installations
      .map((installation) => installation.lastSyncedAt)
      .filter((value): value is Date => value instanceof Date)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const latestRepoError = repos.find((repo) => repo.contextError)?.contextError || null;

    return {
      configured: config.configured,
      missing: config.missing,
      connected: installations.length > 0 || repos.length > 0,
      accountLogin: account?.accountLogin || null,
      accountType: account?.accountType || null,
      installationCount: installations.length,
      repositoryCount: repos.length,
      availableCount,
      linkedCount,
      parsedCount,
      lastSyncedAt: lastSyncedAt ? lastSyncedAt.toISOString() : null,
      syncError: latestRepoError,
      manageUrl: config.slug
        ? `https://github.com/apps/${encodeURIComponent(config.slug)}`
        : null,
      publicUrl: config.slug
        ? `https://github.com/apps/${encodeURIComponent(config.slug)}`
        : null,
      requiredPermissions: this.githubRequiredPermissions(),
    };
  }

  async listGithubRepositories(
    companyId: string,
    options: ListGithubRepositoriesOptions = {},
  ) {
    const currentRepos = await this.githubReposRepo.find({
      where: { companyId },
      order: { isLinked: 'DESC', fullName: 'ASC' },
    });
    const shouldSync = options.sync || currentRepos.length === 0;

    if (shouldSync) {
      const installations = await this.githubInstallationsRepo.find({
        where: { companyId },
      });
      const syncErrors: string[] = [];
      for (const installation of installations) {
        try {
          await this.syncGithubRepositories(companyId, installation.installationId);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'unknown error';
          syncErrors.push(message);
          this.logger.warn(
            `GitHub repository list sync failed for installation ${
              installation.installationId
            }: ${message}`,
          );
        }
      }
      if (options.sync && syncErrors.length) {
        throw new InternalServerErrorException(
          `Unable to sync GitHub repositories: ${syncErrors.join('; ')}`,
        );
      }
    }

    const repos = await this.githubReposRepo.find({
      where: { companyId },
      order: { isLinked: 'DESC', fullName: 'ASC' },
    });
    if (options.linked) {
      return repos.filter((repo) => repo.isLinked);
    }
    if (options.available) {
      return repos.filter((repo) => !repo.isLinked);
    }
    return repos;
  }

  async linkGithubRepository(companyId: string, dto: LinkGithubRepositoryDto) {
    const repo = await this.githubReposRepo.findOne({
      where: { id: dto.repositoryId, companyId },
    });
    if (!repo) {
      throw new NotFoundException('Repository not found for this company.');
    }

    repo.isLinked = true;
    repo.selectedBranch =
      dto.branch?.trim() || repo.selectedBranch || repo.defaultBranch || 'main';
    repo.linkedAt = repo.linkedAt || new Date();
    repo.contextStatus = this.isParsedGithubContext(repo) ? 'parsed' : 'synced';
    repo.contextError = null;
    const saved = await this.githubReposRepo.save(repo);
    await this.companySettingsService.logAction(companyId, { id: companyId }, {
      action: 'company.github.repository.linked',
      target: saved.fullName,
      metadata: {
        repositoryId: saved.id,
        branch: saved.selectedBranch,
      },
    });
    return saved;
  }

  async updateGithubRepository(
    companyId: string,
    repositoryId: string,
    dto: { branch?: string },
  ) {
    const repo = await this.findOwnedGithubRepository(companyId, repositoryId);
    const branch = dto.branch?.trim();
    if (branch) {
      repo.selectedBranch = branch.slice(0, 120);
      if (this.isParsedGithubContext(repo)) {
        repo.contextStatus = 'synced';
        repo.contextSnapshot = null;
        repo.contextSyncedAt = null;
        repo.contextError =
          'Branch changed. Re-parse this repository before using it for assessment generation.';
      }
    }

    const saved = await this.githubReposRepo.save(repo);
    await this.companySettingsService.logAction(companyId, { id: companyId }, {
      action: 'company.github.repository.updated',
      target: saved.fullName,
      metadata: {
        repositoryId: saved.id,
        branch: saved.selectedBranch,
      },
    });
    return saved;
  }

  async unlinkGithubRepository(companyId: string, repositoryId: string) {
    const repo = await this.findOwnedGithubRepository(companyId, repositoryId);
    repo.isLinked = false;
    repo.linkedAt = null;
    repo.contextStatus = repo.contextSnapshot ? 'parsed' : 'synced';
    const saved = await this.githubReposRepo.save(repo);
    await this.companySettingsService.logAction(companyId, { id: companyId }, {
      action: 'company.github.repository.unlinked',
      target: saved.fullName,
      metadata: { repositoryId: saved.id },
    });
    return { unlinked: true, repository: saved };
  }

  async deleteGithubRepositoryContext(companyId: string, repositoryId: string) {
    const repo = await this.findOwnedGithubRepository(companyId, repositoryId);
    repo.contextSnapshot = null;
    repo.contextSyncedAt = null;
    repo.contextError = null;
    repo.contextStatus = repo.isLinked ? 'synced' : null;
    const saved = await this.githubReposRepo.save(repo);
    await this.companySettingsService.logAction(companyId, { id: companyId }, {
      action: 'company.github.repository.context_deleted',
      target: saved.fullName,
      metadata: { repositoryId: saved.id },
    });
    return { deleted: true, repository: saved };
  }

  async getGithubRepositoryContext(companyId: string, repositoryId: string) {
    const repo = await this.findOwnedGithubRepository(companyId, repositoryId);
    const snapshot = repo.contextSnapshot || {};

    return {
      id: repo.id,
      fullName: repo.fullName,
      htmlUrl: repo.htmlUrl,
      branch: repo.selectedBranch || repo.defaultBranch || 'main',
      defaultBranch: repo.defaultBranch,
      private: repo.private,
      isLinked: repo.isLinked,
      contextStatus: repo.contextStatus,
      contextSyncedAt: repo.contextSyncedAt,
      contextError: repo.contextError,
      readme: snapshot.readme || null,
      manifests: Array.isArray(snapshot.manifests) ? snapshot.manifests : [],
      languages: snapshot.languages || {},
      primaryLanguage: snapshot.primaryLanguage || null,
      topics: Array.isArray(snapshot.topics) ? snapshot.topics : [],
      tree: snapshot.tree || null,
      contextSnapshot: repo.contextSnapshot,
    };
  }

  async refreshGithubRepositoryContextForCompany(
    companyId: string,
    repositoryId: string,
  ) {
    const repo = await this.findOwnedGithubRepository(companyId, repositoryId);
    repo.isLinked = true;
    repo.selectedBranch = repo.selectedBranch || repo.defaultBranch || 'main';
    repo.contextStatus = 'parsing';
    repo.contextError = null;
    await this.githubReposRepo.save(repo);

    try {
      const refreshed = await this.refreshGithubRepositoryContext(repo);
      await this.companySettingsService.logAction(companyId, { id: companyId }, {
        action: 'company.github.repository.parsed',
        target: refreshed.fullName,
        metadata: {
          repositoryId: refreshed.id,
          branch: refreshed.selectedBranch || refreshed.defaultBranch,
          contextSyncedAt: refreshed.contextSyncedAt,
        },
      });
      return refreshed;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to parse repository.';
      repo.contextStatus = 'failed';
      repo.contextError = message.slice(0, 800);
      await this.githubReposRepo.save(repo);
      await this.companySettingsService.logAction(companyId, { id: companyId }, {
        action: 'company.github.repository.parse_failed',
        target: repo.fullName,
        severity: 'warning',
        metadata: { repositoryId: repo.id, error: message.slice(0, 300) },
      });
      throw new InternalServerErrorException(
        `Unable to refresh repository context: ${message}`,
      );
    }
  }

  private async findOwnedGithubRepository(
    companyId: string,
    repositoryId: string,
  ) {
    const repo = await this.githubReposRepo.findOne({
      where: { id: repositoryId, companyId },
    });
    if (!repo) {
      throw new NotFoundException('Repository not found for this company.');
    }
    return repo;
  }

  private async syncGithubRepositories(companyId: string, installationId: string) {
    const installation = await this.githubInstallationsRepo.findOne({
      where: { companyId, installationId },
    });
    if (!installation) {
      throw new NotFoundException('GitHub installation not found.');
    }

    const access = await this.createInstallationAccessToken(installationId);
    installation.permissions = access.permissions || installation.permissions;
    installation.repositorySelection =
      access.repository_selection || installation.repositorySelection;
    installation.lastSyncedAt = new Date();

    const reposResponse = await fetch(
      'https://api.github.com/installation/repositories?per_page=100',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${access.token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Emble-Hiring',
        },
      },
    );

    if (!reposResponse.ok) {
      const detail = await reposResponse.text().catch(() => '');
      throw new InternalServerErrorException(
        `Unable to list GitHub repositories (${reposResponse.status}): ${detail}`,
      );
    }

    const payload = (await reposResponse.json().catch(() => null)) as {
      repositories?: any[];
    } | null;
    const repositories = Array.isArray(payload?.repositories)
      ? payload.repositories
      : [];
    const grantedGithubRepositoryIds = new Set<string>();

    for (const item of repositories) {
      const githubRepositoryId = String(item.id || '');
      if (!githubRepositoryId || !item.full_name) continue;
      grantedGithubRepositoryIds.add(githubRepositoryId);

      let repo = await this.githubReposRepo.findOne({
        where: { companyId, githubRepositoryId },
      });
      if (!repo) {
        repo = this.githubReposRepo.create({
          companyId,
          githubRepositoryId,
          isLinked: false,
        });
      }

      repo.installationRecordId = installation.id;
      repo.installationId = installation.installationId;
      repo.fullName = String(item.full_name);
      repo.owner = String(item.owner?.login || item.full_name.split('/')[0]);
      repo.name = String(item.name || item.full_name.split('/')[1]);
      repo.htmlUrl = String(item.html_url || '');
      repo.defaultBranch = item.default_branch ? String(item.default_branch) : null;
      repo.selectedBranch = repo.selectedBranch || repo.defaultBranch;
      repo.private = Boolean(item.private);
      repo.permissions = item.permissions || null;
      if (repo.contextStatus === 'revoked') {
        repo.contextStatus = repo.contextSnapshot ? 'parsed' : 'synced';
        repo.contextError = null;
      }
      if (repo.contextStatus === 'ready') {
        repo.contextStatus = 'parsed';
      }
      if (repo.isLinked && !repo.contextStatus) {
        repo.contextStatus = repo.contextSnapshot ? 'parsed' : 'synced';
      }
      await this.githubReposRepo.save(repo);
    }

    const knownReposForInstallation = await this.githubReposRepo.find({
      where: { companyId, installationId: installation.installationId },
    });
    for (const repo of knownReposForInstallation) {
      if (grantedGithubRepositoryIds.has(repo.githubRepositoryId)) continue;
      if (repo.contextStatus === 'revoked') continue;
      repo.contextStatus = 'revoked';
      repo.contextError =
        'GitHub access was revoked or this repository is no longer granted to Emble. Manage access on GitHub, then sync again.';
      await this.githubReposRepo.save(repo);
    }

    const account = repositories[0]?.owner;
    if (account) {
      installation.accountLogin = String(account.login || '') || installation.accountLogin;
      installation.accountType = String(account.type || '') || installation.accountType;
      installation.accountId = account.id ? String(account.id) : installation.accountId;
    }
    await this.githubInstallationsRepo.save(installation);

    return repositories.length;
  }

  private async refreshGithubRepositoryContext(repo: GithubRepository) {
    const token = (await this.createInstallationAccessToken(repo.installationId)).token;
    const branch = repo.selectedBranch || repo.defaultBranch || 'main';
    const [languages, topics, tree] = await Promise.all([
      this.fetchGithubLanguages(repo, token),
      this.fetchGithubTopics(repo, token),
      this.fetchGithubTree(repo, token, branch),
    ]);

    const files = tree.tree.filter((item) => item.type === 'blob' && item.path);
    const directories = tree.tree.filter((item) => item.type === 'tree');
    const readmePath = this.findReadmePath(files);
    const manifestPaths = this.selectRepositoryContextPaths(files, readmePath);
    const [readme, manifests] = await Promise.all([
      readmePath
        ? this.fetchGithubTextFile(repo, token, readmePath, branch)
        : Promise.resolve(null),
      Promise.all(
        manifestPaths.map((path) =>
          this.fetchGithubTextFile(repo, token, path, branch).catch(() => null),
        ),
      ),
    ]);

    const topExtensions = this.summarizeExtensions(files);
    const importantPaths = this.collectImportantPaths(files);
    const parsedAt = new Date();
    const contextSnapshot = {
      source: 'github_app',
      repositoryId: repo.id,
      githubRepositoryId: repo.githubRepositoryId,
      fullName: repo.fullName,
      url: repo.htmlUrl,
      branch,
      defaultBranch: repo.defaultBranch,
      private: repo.private,
      parsedAt: parsedAt.toISOString(),
      languages,
      primaryLanguage: this.primaryLanguage(languages),
      topics,
      tree: {
        totalFiles: files.length,
        totalDirectories: directories.length,
        truncated: Boolean(tree.truncated),
        topExtensions,
        importantPaths,
        samplePaths: files
          .map((item) => item.path)
          .filter(Boolean)
          .slice(0, GITHUB_REPO_CONTEXT_PATH_LIMIT),
      },
      readme,
      manifests: manifests.filter(Boolean),
    };
    const repoIntelligence =
      await this.assessmentAiService.summarizeRepositoryContext({
        repoFullName: repo.fullName,
        htmlUrl: repo.htmlUrl,
        snapshot: contextSnapshot,
      });

    repo.contextStatus = 'parsed';
    repo.contextSyncedAt = parsedAt;
    repo.contextError = null;
    repo.contextSnapshot = {
      ...contextSnapshot,
      repoIntelligence,
    };

    return this.githubReposRepo.save(repo);
  }

  private async fetchGithubLanguages(
    repo: GithubRepository,
    token: string,
  ): Promise<Record<string, number>> {
    return this.fetchGithubJson<Record<string, number>>(
      this.githubRepoApiUrl(repo, 'languages'),
      token,
    ).catch(() => ({}));
  }

  private async fetchGithubTopics(
    repo: GithubRepository,
    token: string,
  ): Promise<string[]> {
    const payload = await this.fetchGithubJson<{ names?: string[] }>(
      this.githubRepoApiUrl(repo, 'topics'),
      token,
      'application/vnd.github+json',
    ).catch(() => null);
    return Array.isArray(payload?.names) ? payload.names : [];
  }

  private async fetchGithubTree(
    repo: GithubRepository,
    token: string,
    branch: string,
  ): Promise<{
    tree: Array<{ path: string; type: string; size?: number }>;
    truncated?: boolean;
  }> {
    const encodedBranch = encodeURIComponent(branch);
    const payload = await this.fetchGithubJson<{
      tree?: Array<{ path?: string; type?: string; size?: number }>;
      truncated?: boolean;
    }>(
      this.githubRepoApiUrl(repo, `git/trees/${encodedBranch}?recursive=1`),
      token,
    );

    return {
      tree: Array.isArray(payload.tree)
        ? payload.tree
            .map((item) => ({
              path: String(item.path || ''),
              type: String(item.type || ''),
              size: typeof item.size === 'number' ? item.size : undefined,
            }))
            .filter((item) => item.path)
        : [],
      truncated: payload.truncated,
    };
  }

  private async fetchGithubTextFile(
    repo: GithubRepository,
    token: string,
    path: string,
    branch: string,
  ) {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const encodedRef = encodeURIComponent(branch);
    const payload = await this.fetchGithubJson<{
      name?: string;
      path?: string;
      size?: number;
      type?: string;
      encoding?: string;
      content?: string;
      html_url?: string;
    }>(
      this.githubRepoApiUrl(repo, `contents/${encodedPath}?ref=${encodedRef}`),
      token,
    );

    if (payload.type !== 'file' || !payload.content) return null;
    if (typeof payload.size === 'number' && payload.size > GITHUB_REPO_CONTEXT_FILE_BYTES) {
      return {
        path,
        size: payload.size,
        truncated: true,
        content: '',
      };
    }

    const decoded =
      payload.encoding === 'base64'
        ? Buffer.from(payload.content.replace(/\s/g, ''), 'base64').toString(
            'utf8',
          )
        : payload.content;
    const limited = this.limitGithubContextText(
      this.redactSensitiveGithubText(decoded),
    );
    return {
      path: payload.path || path,
      size: payload.size || Buffer.byteLength(decoded),
      truncated: limited.truncated,
      content: limited.content,
    };
  }

  private async fetchGithubJson<T>(
    url: string,
    token: string,
    accept = 'application/vnd.github+json',
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Accept: accept,
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Emble-Hiring',
      },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `GitHub API request failed (${response.status}): ${detail.slice(0, 500)}`,
      );
    }

    return (await response.json()) as T;
  }

  private githubRepoApiUrl(repo: GithubRepository, suffix: string) {
    const normalizedSuffix = suffix.replace(/^\/+/, '');
    return `https://api.github.com/repos/${encodeURIComponent(
      repo.owner,
    )}/${encodeURIComponent(repo.name)}/${normalizedSuffix}`;
  }

  private findReadmePath(files: Array<{ path: string }>) {
    return (
      files.find((item) => /^readme\.(md|mdx|txt|rst)$/i.test(item.path))?.path ||
      files.find((item) => /(^|\/)readme\.(md|mdx|txt|rst)$/i.test(item.path))?.path ||
      null
    );
  }

  private selectRepositoryContextPaths(
    files: Array<{ path: string; size?: number }>,
    readmePath: string | null,
  ) {
    return files
      .filter((item) => {
        if (!item.path || item.path === readmePath) return false;
        if (typeof item.size === 'number' && item.size > GITHUB_REPO_CONTEXT_FILE_BYTES) {
          return false;
        }
        const fileName = item.path.split('/').pop()?.toLowerCase() || '';
        if (fileName.includes('lock') && fileName !== 'poetry.lock') return false;
        return REPO_CONTEXT_FILE_NAMES.has(fileName);
      })
      .sort((a, b) => this.contextPathRank(a.path) - this.contextPathRank(b.path))
      .slice(0, GITHUB_REPO_CONTEXT_MANIFEST_LIMIT)
      .map((item) => item.path);
  }

  private contextPathRank(path: string) {
    const depth = path.split('/').length;
    const fileName = path.split('/').pop()?.toLowerCase() || '';
    if (fileName === 'package.json') return depth;
    if (fileName === 'pyproject.toml') return depth + 1;
    if (fileName === 'go.mod' || fileName === 'cargo.toml') return depth + 2;
    if (fileName.startsWith('docker')) return depth + 6;
    return depth + 4;
  }

  private collectImportantPaths(files: Array<{ path: string; size?: number }>) {
    const important = files
      .filter((item) => {
        const path = item.path.toLowerCase();
        const name = path.split('/').pop() || '';
        return (
          REPO_CONTEXT_FILE_NAMES.has(name) ||
          path.startsWith('src/') ||
          path.startsWith('app/') ||
          path.startsWith('pages/') ||
          path.startsWith('api/') ||
          path.startsWith('backend/') ||
          path.startsWith('frontend/') ||
          path.startsWith('server/') ||
          path.startsWith('client/')
        );
      })
      .map((item) => item.path);
    return Array.from(new Set(important)).slice(0, GITHUB_REPO_CONTEXT_PATH_LIMIT);
  }

  private summarizeExtensions(files: Array<{ path: string }>) {
    const counts = new Map<string, number>();
    for (const file of files) {
      const name = file.path.split('/').pop() || '';
      const match = name.match(/\.([a-z0-9]+)$/i);
      const ext = match ? `.${match[1].toLowerCase()}` : '[none]';
      counts.set(ext, (counts.get(ext) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([extension, count]) => ({ extension, count }));
  }

  private primaryLanguage(languages: Record<string, number>) {
    return Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  private isParsedGithubContext(repo: Pick<GithubRepository, 'contextStatus' | 'contextSnapshot'>) {
    return (
      Boolean(repo.contextSnapshot) &&
      (repo.contextStatus === 'parsed' || repo.contextStatus === 'ready')
    );
  }

  private limitGithubContextText(value: string) {
    const normalized = (value || '').replace(/\r\n/g, '\n').trim();
    if (normalized.length <= GITHUB_REPO_CONTEXT_TEXT_CHARS) {
      return { content: normalized, truncated: false };
    }
    return {
      content: normalized.slice(0, GITHUB_REPO_CONTEXT_TEXT_CHARS).trim(),
      truncated: true,
    };
  }

  private redactSensitiveGithubText(value: string) {
    let output = value || '';
    for (const pattern of GITHUB_SECRET_PATTERNS) {
      output = output.replace(pattern, '[REDACTED_SECRET]');
    }
    return output;
  }

  private async listUserInstallationIds(userAccessToken: string) {
    const response = await fetch(
      'https://api.github.com/user/installations?per_page=100',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${userAccessToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Emble-Hiring',
        },
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new BadRequestException(
        `Unable to verify GitHub installations (${response.status}): ${detail}`,
      );
    }

    const payload = (await response.json().catch(() => null)) as
      | {
          installations?: Array<{ id?: number | string }>;
        }
      | null;
    return (payload?.installations || [])
      .map((installation) => String(installation.id || '').trim())
      .filter(Boolean);
  }

  private async verifyUserCanAccessInstallationToken(
    userAccessToken: string,
    installationId: string,
  ) {
    const response = await fetch(
      `https://api.github.com/user/installations/${encodeURIComponent(
        installationId,
      )}/repositories?per_page=1`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${userAccessToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Emble-Hiring',
        },
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      if ([401, 403, 404].includes(response.status)) {
        throw new BadRequestException(
          'GitHub user verification failed for this installation. Reinstall the app from Emble.',
        );
      }
      throw new InternalServerErrorException(
        `Unable to verify GitHub installation (${response.status}): ${detail}`,
      );
    }
  }

  private async createGithubUserAccessToken(code: string) {
    const config = this.getGithubConfigStatus();
    if (!config.clientId || !config.clientSecret) {
      throw new InternalServerErrorException(
        'GITHUB_APP_CLIENT_ID and GITHUB_APP_CLIENT_SECRET are required for GitHub user verification.',
      );
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Emble-Hiring',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          access_token?: string;
          error?: string;
          error_description?: string;
        }
      | null;

    if (!response.ok || payload?.error || !payload?.access_token) {
      throw new BadRequestException(
        payload?.error_description ||
          payload?.error ||
          'Unable to verify GitHub user authorization.',
      );
    }

    return payload.access_token;
  }

  private async createInstallationAccessToken(installationId: string): Promise<{
    token: string;
    permissions?: Record<string, any>;
    repository_selection?: string;
  }> {
    const appJwt = this.createGithubAppJwt();
    const response = await fetch(
      `https://api.github.com/app/installations/${encodeURIComponent(
        installationId,
      )}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${appJwt}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Emble-Hiring',
        },
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new InternalServerErrorException(
        `Unable to create GitHub installation token (${response.status}): ${detail}`,
      );
    }

    const payload = (await response.json().catch(() => null)) as {
      token?: string;
      permissions?: Record<string, any>;
      repository_selection?: string;
    } | null;
    if (!payload?.token) {
      throw new InternalServerErrorException('GitHub did not return a token.');
    }
    return {
      token: payload.token,
      permissions: payload.permissions,
      repository_selection: payload.repository_selection,
    };
  }

  private getGithubConfigStatus(): GithubConfigStatus {
    const slug = this.configService.get<string>('GITHUB_APP_SLUG')?.trim() || '';
    const appId = this.configService.get<string>('GITHUB_APP_ID')?.trim() || '';
    const privateKey = this.getGithubPrivateKey();
    const privateKeyValid = privateKey ? this.isGithubPrivateKeyValid(privateKey) : false;
    const clientId =
      this.configService.get<string>('GITHUB_APP_CLIENT_ID')?.trim() || '';
    const clientSecret =
      this.configService.get<string>('GITHUB_APP_CLIENT_SECRET')?.trim() || '';
    const stateSecret = this.getGithubStateSecret();
    const missing = [
      slug ? null : 'GITHUB_APP_SLUG',
      appId ? null : 'GITHUB_APP_ID',
      privateKey ? null : 'GITHUB_APP_PRIVATE_KEY',
      privateKey && !privateKeyValid ? 'GITHUB_APP_PRIVATE_KEY (invalid PEM)' : null,
      clientId ? null : 'GITHUB_APP_CLIENT_ID',
      clientSecret ? null : 'GITHUB_APP_CLIENT_SECRET',
      stateSecret ? null : 'GITHUB_APP_STATE_SECRET or JWT_SECRET',
    ].filter((item): item is string => Boolean(item));

    return {
      configured: missing.length === 0,
      missing,
      slug,
      appId,
      privateKey,
      privateKeyValid,
      clientId,
      clientSecret,
      stateSecret,
    };
  }

  private createGithubAppJwt() {
    const appId = this.configService.get<string>('GITHUB_APP_ID')?.trim();
    const privateKey = this.getGithubPrivateKey();
    if (!appId || !privateKey) {
      throw new InternalServerErrorException(
        'GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are required.',
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }),
    ).toString('base64url');
    const body = `${header}.${payload}`;
    const signature = createSign('RSA-SHA256')
      .update(body)
      .sign(privateKey)
      .toString('base64url');

    return `${body}.${signature}`;
  }

  private getGithubPrivateKey() {
    const raw = this.configService.get<string>('GITHUB_APP_PRIVATE_KEY')?.trim();
    return raw ? this.normalizeGithubPrivateKey(raw) : '';
  }

  private normalizeGithubPrivateKey(raw: string) {
    return raw
      .trim()
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/(-----BEGIN [A-Z ]*PRIVATE KEY-----)([^\r\n])/g, '$1\n$2')
      .replace(/([^\r\n])(-----END [A-Z ]*PRIVATE KEY-----)/g, '$1\n$2');
  }

  private isGithubPrivateKeyValid(privateKey: string) {
    try {
      createPrivateKey(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  private buildFrontendRedirect(next: string) {
    const base = (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4000'
    )
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');
    const safePath = next.startsWith('/') ? next : '/industry/assessments/new';
    return `${base}${safePath}`;
  }

  private withGithubResult(next: string, result: 'connected' | 'error') {
    const safePath = next.startsWith('/') ? next : '/industry/assessments/new';
    const glue = safePath.includes('?') ? '&' : '?';
    return safePath.includes('github=')
      ? safePath
      : `${safePath}${glue}github=${result}`;
  }

  private signGithubState(payload: GithubStatePayload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.stateHmac(encoded);
    return `${encoded}.${signature}`;
  }

  private verifyGithubState(state: string): GithubStatePayload {
    const [encoded, signature] = state.split('.');
    if (!encoded || !signature) {
      throw new BadRequestException('Invalid GitHub installation state.');
    }

    const expected = this.stateHmac(encoded);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('Invalid GitHub installation state.');
    }

    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    ) as GithubStatePayload;
    if (!payload.companyId || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new BadRequestException('GitHub installation state has expired.');
    }
    return payload;
  }

  private stateHmac(encodedPayload: string) {
    const secret = this.getGithubStateSecret();
    if (!secret) {
      throw new InternalServerErrorException(
        'GITHUB_APP_STATE_SECRET or JWT_SECRET is required.',
      );
    }

    return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  }

  private getGithubStateSecret() {
    return (
      this.configService.get<string>('GITHUB_APP_STATE_SECRET')?.trim() ||
      this.configService.get<string>('JWT_SECRET')?.trim() ||
      ''
    );
  }

  private githubRequiredPermissions() {
    return {
      repository: {
        contents: 'read',
        metadata: 'read',
      },
      account: {},
    };
  }

  private githubSafeErrorMessage(error: unknown) {
    if (error instanceof HttpException) {
      const response = error.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : Array.isArray((response as { message?: unknown })?.message)
            ? (response as { message: string[] }).message.join(', ')
            : typeof (response as { message?: unknown })?.message === 'string'
              ? String((response as { message: string }).message)
              : error.message;
      return message.slice(0, 180);
    }

    if (error instanceof Error) {
      return error.message.slice(0, 180);
    }
    return 'GitHub connection failed.';
  }
}
