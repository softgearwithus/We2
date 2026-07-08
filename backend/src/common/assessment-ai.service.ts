import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AssessmentGenerationMode = 'fast' | 'balanced' | 'deep';

export type GeneratedAssessmentTask = {
  title: string;
  instructions: string;
  deliverables: string[];
  estimatedMinutes?: number;
};

export type GeneratedAssessmentRubricItem = {
  criterion: string;
  points: number;
  signals: string[];
};

export type GeneratedAssessmentPayload = {
  title: string;
  brief: string;
  tasks: GeneratedAssessmentTask[];
  files: Array<{ path: string; content: string }>;
  constraints: string[];
  timeLimitMinutes: number;
  scoringRubric: GeneratedAssessmentRubricItem[];
  reviewerNotes: string[];
  interviewerHandoffNotes: string[];
  language?: string | null;
};

export type AssessmentGenerationResult = {
  provider: string;
  model: string;
  usedFallback: boolean;
  assessment: GeneratedAssessmentPayload;
  rawText?: string;
};

export type RepoIntelligence = {
  provider: string;
  model: string;
  generatedAt: string;
  usedFallback: boolean;
  stackSummary: string;
  architectureHints: string[];
  roleRelevantSkills: string[];
  assessmentIdeas: string[];
  importantFiles: string[];
  contextQualityNotes: string[];
};

type ModelConfig = {
  endpoint: string;
  apiKey: string;
  model: string;
  apiVersion: string;
};

const DEFAULT_API_VERSION = '2024-10-21';
const DEFAULT_MAX_CONTEXT_CHARS = 48_000;
const SECRET_PATTERNS: RegExp[] = [
  /(api[_-]?key|secret|token|password|client[_-]?secret)\s*[:=]\s*["']?[^"'\s]+/gi,
  /(AKIA[0-9A-Z]{16})/g,
  /(ghp_[A-Za-z0-9_]{20,})/g,
  /(-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----)/g,
];

@Injectable()
export class AssessmentAiService {
  constructor(private readonly configService: ConfigService) {}

  async summarizeRepositoryContext(input: {
    repoFullName: string;
    htmlUrl: string;
    snapshot: Record<string, any>;
  }): Promise<RepoIntelligence> {
    const fallback = this.buildFallbackRepoIntelligence(input);
    const config = this.resolveConfig('fast');
    if (!config) return fallback;

    const prompt = {
      task: 'Summarize a GitHub repository for hiring assessment context.',
      repository: {
        fullName: input.repoFullName,
        htmlUrl: input.htmlUrl,
      },
      context: this.compactRepoSnapshotForModel(input.snapshot),
      return_schema: {
        stackSummary: '1-2 sentence technical stack summary',
        architectureHints: ['short architecture/product hints'],
        roleRelevantSkills: ['skills worth assessing'],
        assessmentIdeas: ['practical assessment ideas grounded in this repo'],
        importantFiles: ['file paths from the context that influenced you'],
        contextQualityNotes: ['missing/weak context notes'],
      },
      rules: [
        'Return strict JSON only.',
        'Do not include secrets or raw private source content.',
        'Do not invent frameworks that are not supported by the context.',
      ],
    };

    try {
      const text = await this.callChatJson(config, [
        {
          role: 'system',
          content:
            'You turn repository metadata into concise hiring-assessment context. Return strict JSON only.',
        },
        { role: 'user', content: JSON.stringify(prompt) },
      ], 900);
      const parsed = this.extractJsonObject(text);
      return {
        ...fallback,
        provider: 'foundry',
        model: config.model,
        usedFallback: false,
        stackSummary: this.stringOrFallback(
          parsed.stackSummary,
          fallback.stackSummary,
        ),
        architectureHints: this.stringArrayOrFallback(
          parsed.architectureHints,
          fallback.architectureHints,
        ),
        roleRelevantSkills: this.stringArrayOrFallback(
          parsed.roleRelevantSkills,
          fallback.roleRelevantSkills,
        ),
        assessmentIdeas: this.stringArrayOrFallback(
          parsed.assessmentIdeas,
          fallback.assessmentIdeas,
        ),
        importantFiles: this.stringArrayOrFallback(
          parsed.importantFiles,
          fallback.importantFiles,
        ),
        contextQualityNotes: this.stringArrayOrFallback(
          parsed.contextQualityNotes,
          fallback.contextQualityNotes,
        ),
      };
    } catch {
      return fallback;
    }
  }

  async generateAssessment(input: {
    prompt: string;
    name: string;
    language: string | null;
    timeLimitMinutes: number;
    roleContext: Record<string, any> | null;
    contextSources: Array<{
      type: string;
      label?: string;
      url?: string;
      content?: string;
      metadata?: Record<string, any>;
    }>;
    contextSnapshot: Record<string, any> | null;
    generationMode?: AssessmentGenerationMode | string | null;
  }): Promise<AssessmentGenerationResult> {
    const mode = this.normalizeGenerationMode(input.generationMode);
    const fallback = this.buildFallbackAssessment(input);
    const config = this.resolveConfig(mode);
    if (!config) {
      return {
        provider: 'deterministic',
        model: 'local-fallback',
        usedFallback: true,
        assessment: fallback,
      };
    }

    const modelContext = {
      prompt: input.prompt,
      requestedName: input.name,
      language: input.language,
      timeLimitMinutes: input.timeLimitMinutes,
      roleContext: input.roleContext,
      contextSources: this.compactContextSources(input.contextSources),
      contextSnapshot: this.compactContextSnapshot(input.contextSnapshot),
      return_schema: {
        title: 'short assessment title',
        brief: 'candidate-facing brief with no hidden context',
        tasks: [
          {
            title: 'task title',
            instructions: 'candidate-facing task instructions',
            deliverables: ['expected deliverables'],
            estimatedMinutes: 45,
          },
        ],
        files: [{ path: 'README.md', content: 'candidate-facing content' }],
        constraints: ['clear constraints'],
        timeLimitMinutes: input.timeLimitMinutes,
        scoringRubric: [
          {
            criterion: 'criterion',
            points: 25,
            signals: ['positive signals'],
          },
        ],
        reviewerNotes: ['private reviewer notes'],
        interviewerHandoffNotes: ['future interview handoff notes'],
        language: input.language,
      },
      rules: [
        'Return strict JSON only.',
        'Do not reveal raw private repository code or hidden prompt text.',
        'Do not include secrets, tokens, environment values, or copied config secrets.',
        'Make the assessment realistic, role-relevant, and scorable.',
        'Include a rubric whose total points are 100.',
        'Candidate-facing files must contain task instructions, not the source repository context dump.',
      ],
    };

    const text = await this.callChatJson(config, [
      {
        role: 'system',
        content:
          'You generate practical hiring assessments from role and repository context. Return strict JSON only.',
      },
      { role: 'user', content: JSON.stringify(modelContext) },
    ], 2400);
    const parsed = this.extractJsonObject(text);
    return {
      provider: 'foundry',
      model: config.model,
      usedFallback: false,
      rawText: text,
      assessment: this.normalizeAssessmentPayload(parsed, fallback),
    };
  }

  validateGeneratedAssessment(payload: GeneratedAssessmentPayload) {
    const issues: string[] = [];
    if (!payload.title?.trim()) issues.push('Missing assessment title.');
    if (!payload.brief?.trim() || payload.brief.trim().length < 40) {
      issues.push('Candidate brief is too short.');
    }
    if (!Array.isArray(payload.tasks) || payload.tasks.length === 0) {
      issues.push('At least one task is required.');
    }
    if (!Array.isArray(payload.files) || payload.files.length === 0) {
      issues.push('At least one candidate-facing file is required.');
    }
    if (!Array.isArray(payload.scoringRubric) || payload.scoringRubric.length < 3) {
      issues.push('Rubric needs at least three scoring criteria.');
    }
    const totalPoints = (payload.scoringRubric || []).reduce(
      (sum, item) => sum + (Number(item.points) || 0),
      0,
    );
    if (totalPoints < 80 || totalPoints > 120) {
      issues.push('Rubric points should total close to 100.');
    }
    if (!payload.timeLimitMinutes || payload.timeLimitMinutes < 15) {
      issues.push('Time limit is too short.');
    }

    const candidateText = [
      payload.brief,
      ...(payload.files || []).map((file) => file.content),
    ].join('\n');
    if (this.containsSecretLikeText(candidateText)) {
      issues.push('Candidate-facing content appears to contain secret-like text.');
    }

    return {
      ok: issues.length === 0,
      issues,
      totalRubricPoints: totalPoints,
      checkedAt: new Date().toISOString(),
    };
  }

  sanitizeText(value: string, maxChars = DEFAULT_MAX_CONTEXT_CHARS) {
    let sanitized = (value || '').replace(/\r\n/g, '\n');
    for (const pattern of SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]');
    }
    sanitized = sanitized.replace(/[^\S\r\n]+/g, ' ').trim();
    return sanitized.slice(0, Math.max(1000, maxChars));
  }

  private resolveConfig(mode: AssessmentGenerationMode): ModelConfig | null {
    const provider = (
      this.configService.get<string>('ASSESSMENT_AI_PROVIDER') || 'foundry'
    )
      .trim()
      .toLowerCase();
    if (!['foundry', 'microsoft_foundry', 'azure_openai'].includes(provider)) {
      return null;
    }
    const endpoint = (
      this.configService.get<string>('FOUNDRY_ENDPOINT') ||
      this.configService.get<string>('AZURE_OPENAI_ENDPOINT') ||
      ''
    )
      .trim()
      .replace(/\/+$/, '');
    const apiKey = (
      this.configService.get<string>('FOUNDRY_API_KEY') ||
      this.configService.get<string>('AZURE_OPENAI_API_KEY') ||
      ''
    ).trim();
    const model =
      mode === 'deep'
        ? this.configService.get<string>('ASSESSMENT_DEEP_MODEL') ||
          this.configService.get<string>('ASSESSMENT_BALANCED_MODEL')
        : mode === 'fast'
          ? this.configService.get<string>('ASSESSMENT_FAST_MODEL') ||
            this.configService.get<string>('ASSESSMENT_BALANCED_MODEL')
          : this.configService.get<string>('ASSESSMENT_BALANCED_MODEL') ||
            this.configService.get<string>('ASSESSMENT_FAST_MODEL');

    if (!endpoint || !apiKey || !model?.trim()) return null;
    return {
      endpoint,
      apiKey,
      model: model.trim(),
      apiVersion:
        this.configService.get<string>('FOUNDRY_API_VERSION') ||
        DEFAULT_API_VERSION,
    };
  }

  private async callChatJson(
    config: ModelConfig,
    messages: Array<{ role: string; content: string }>,
    maxTokens: number,
  ) {
    const payload = {
      messages,
      temperature: 0.15,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    };
    const isAzureOpenAiEndpoint =
      config.endpoint.includes('openai.azure.com') ||
      config.endpoint.includes('/openai');
    const url = isAzureOpenAiEndpoint
      ? `${config.endpoint}/openai/deployments/${encodeURIComponent(
          config.model,
        )}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`
      : `${config.endpoint}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isAzureOpenAiEndpoint
          ? { 'api-key': config.apiKey }
          : { Authorization: `Bearer ${config.apiKey}` }),
      },
      body: JSON.stringify(
        isAzureOpenAiEndpoint ? payload : { ...payload, model: config.model },
      ),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Foundry model request failed (${response.status}): ${detail.slice(0, 500)}`,
      );
    }
    const body = (await response.json().catch(() => null)) as any;
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content === 'string' && content.trim()) return content.trim();
    throw new Error('Foundry model response did not include content.');
  }

  private extractJsonObject(value: string): Record<string, any> {
    const trimmed = value.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      const start = trimmed.indexOf('{');
      const end = trimmed.lastIndexOf('}');
      if (start === -1 || end <= start) throw new Error('Model output was not JSON.');
      return JSON.parse(trimmed.slice(start, end + 1));
    }
  }

  private normalizeAssessmentPayload(
    value: Record<string, any>,
    fallback: GeneratedAssessmentPayload,
  ): GeneratedAssessmentPayload {
    const rubric = Array.isArray(value.scoringRubric)
      ? value.scoringRubric
          .map((item: any) => ({
            criterion: this.stringOrFallback(item?.criterion, 'Practical quality'),
            points: Math.max(1, Math.min(100, Number(item?.points) || 20)),
            signals: this.stringArrayOrFallback(item?.signals, ['Clear evidence']),
          }))
          .slice(0, 8)
      : fallback.scoringRubric;
    const files = Array.isArray(value.files)
      ? value.files
          .map((file: any) => ({
            path: this.safeAssessmentPath(file?.path || 'README.md'),
            content: this.sanitizeCandidateFacingText(
              this.stringOrFallback(file?.content, fallback.files[0].content),
            ),
          }))
          .filter((file) => file.content.trim())
          .slice(0, 12)
      : fallback.files;

    return {
      title: this.stringOrFallback(value.title, fallback.title).slice(0, 160),
      brief: this.sanitizeCandidateFacingText(
        this.stringOrFallback(value.brief, fallback.brief),
      ),
      tasks: Array.isArray(value.tasks)
        ? value.tasks
            .map((task: any, index: number) => ({
              title: this.stringOrFallback(task?.title, `Task ${index + 1}`),
              instructions: this.sanitizeCandidateFacingText(
                this.stringOrFallback(task?.instructions, fallback.tasks[0].instructions),
              ),
              deliverables: this.stringArrayOrFallback(
                task?.deliverables,
                fallback.tasks[0].deliverables,
              ),
              estimatedMinutes: Number(task?.estimatedMinutes) || undefined,
            }))
            .slice(0, 6)
        : fallback.tasks,
      files: files.length ? files : fallback.files,
      constraints: this.stringArrayOrFallback(value.constraints, fallback.constraints),
      timeLimitMinutes: Math.max(
        15,
        Math.min(480, Number(value.timeLimitMinutes) || fallback.timeLimitMinutes),
      ),
      scoringRubric: rubric.length ? rubric : fallback.scoringRubric,
      reviewerNotes: this.stringArrayOrFallback(value.reviewerNotes, fallback.reviewerNotes),
      interviewerHandoffNotes: this.stringArrayOrFallback(
        value.interviewerHandoffNotes,
        fallback.interviewerHandoffNotes,
      ),
      language: value.language ? String(value.language).slice(0, 40) : fallback.language,
    };
  }

  private buildFallbackAssessment(input: {
    prompt: string;
    name: string;
    language: string | null;
    timeLimitMinutes: number;
    roleContext: Record<string, any> | null;
    contextSources: Array<{ type: string; label?: string; metadata?: Record<string, any> }>;
  }): GeneratedAssessmentPayload {
    const repoLabels = input.contextSources
      .filter((source) => source.type === 'repo')
      .map((source) => source.label)
      .filter(Boolean);
    const roleTitle =
      input.roleContext?.title ||
      input.roleContext?.jobProfile ||
      input.name ||
      'Hiring assessment';
    const title = input.name || `${roleTitle} assessment`;
    const repoLine = repoLabels.length
      ? ` The exercise should reflect the product and engineering signals from ${repoLabels.join(', ')} without exposing private source.`
      : '';
    const brief = `${input.prompt.trim()}${repoLine} Build a small, reviewable solution and document practical tradeoffs, validation steps, and assumptions.`;
    return {
      title,
      brief,
      tasks: [
        {
          title: 'Build and explain a focused solution',
          instructions:
            'Implement a scoped solution for the scenario, keep the design easy to review, and include notes on tradeoffs, edge cases, and validation.',
          deliverables: [
            'A short implementation or design artifact',
            'A README explaining assumptions and tradeoffs',
            'Validation evidence such as tests, sample output, or manual checks',
          ],
          estimatedMinutes: input.timeLimitMinutes,
        },
      ],
      files: [
        {
          path: 'README.md',
          content: [
            `# ${title}`,
            '',
            '## Candidate Brief',
            brief,
            '',
            '## Deliverables',
            '- A focused implementation, design note, or debugging response.',
            '- A short explanation of assumptions, tradeoffs, and validation.',
            '- Any tests, screenshots, logs, or examples needed to support the answer.',
            '',
            '## Constraints',
            '- Keep the solution scoped to the requested scenario.',
            '- Prefer clear, maintainable choices over over-engineering.',
            '- Do not include secrets, credentials, or private company data.',
          ].join('\n'),
        },
        {
          path: 'RUBRIC.md',
          content:
            'Review correctness, code/design quality, product judgment, validation, and communication. Award partial credit for clear reasoning even when implementation is incomplete.',
        },
      ],
      constraints: [
        'No secrets or private credentials in the submission.',
        'State assumptions explicitly.',
        'Include validation evidence.',
      ],
      timeLimitMinutes: input.timeLimitMinutes,
      scoringRubric: [
        {
          criterion: 'Correctness and completeness',
          points: 30,
          signals: ['Solves the core scenario', 'Handles expected edge cases'],
        },
        {
          criterion: 'Engineering quality',
          points: 25,
          signals: ['Readable structure', 'Appropriate abstractions', 'Maintainable choices'],
        },
        {
          criterion: 'Validation',
          points: 20,
          signals: ['Useful tests or checks', 'Clear evidence of working behavior'],
        },
        {
          criterion: 'Product and tradeoff judgment',
          points: 15,
          signals: ['Practical scope', 'Clear tradeoffs', 'Good assumptions'],
        },
        {
          criterion: 'Communication',
          points: 10,
          signals: ['Concise README', 'Easy reviewer handoff'],
        },
      ],
      reviewerNotes: [
        'Compare the submission against the role context and requested prompt.',
        'Look for evidence rather than polish alone.',
      ],
      interviewerHandoffNotes: [
        'Ask the candidate to explain tradeoffs and validation evidence.',
        'Probe any missing tests, unclear assumptions, or surprising design choices.',
      ],
      language: input.language,
    };
  }

  private buildFallbackRepoIntelligence(input: {
    repoFullName: string;
    snapshot: Record<string, any>;
  }): RepoIntelligence {
    const languages = input.snapshot.languages as Record<string, number> | undefined;
    const languageNames = languages
      ? Object.entries(languages)
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .slice(0, 5)
          .map(([language]) => language)
      : [];
    const tree = (input.snapshot.tree || {}) as Record<string, any>;
    const importantFiles = Array.isArray(tree.importantPaths)
      ? tree.importantPaths.slice(0, 12).map(String)
      : [];
    const primary = input.snapshot.primaryLanguage || languageNames[0] || 'unknown';
    return {
      provider: 'deterministic',
      model: 'local-fallback',
      generatedAt: new Date().toISOString(),
      usedFallback: true,
      stackSummary: `${input.repoFullName} appears to be a ${primary} repository${
        languageNames.length ? ` with ${languageNames.join(', ')} signals` : ''
      }.`,
      architectureHints: importantFiles.slice(0, 5),
      roleRelevantSkills: languageNames.length
        ? languageNames
        : ['Code comprehension', 'Debugging', 'Testing'],
      assessmentIdeas: [
        'Ask candidates to make a small scoped change and explain validation.',
        'Ask candidates to review a realistic bug or edge case from the stack.',
      ],
      importantFiles,
      contextQualityNotes: [
        input.snapshot.readme?.content
          ? 'README context is available.'
          : 'README was not found or could not be parsed.',
      ],
    };
  }

  private compactRepoSnapshotForModel(snapshot: Record<string, any>) {
    const maxChars = this.maxContextChars();
    return {
      primaryLanguage: snapshot.primaryLanguage,
      languages: snapshot.languages,
      topics: snapshot.topics,
      tree: snapshot.tree,
      readme: snapshot.readme
        ? {
            ...snapshot.readme,
            content: this.sanitizeText(String(snapshot.readme.content || ''), maxChars / 3),
          }
        : null,
      manifests: Array.isArray(snapshot.manifests)
        ? snapshot.manifests.slice(0, 8).map((file: any) => ({
            path: file.path,
            truncated: file.truncated,
            content: this.sanitizeText(String(file.content || ''), maxChars / 8),
          }))
        : [],
    };
  }

  private compactContextSources(
    sources: Array<{
      type: string;
      label?: string;
      url?: string;
      content?: string;
      metadata?: Record<string, any>;
    }>,
  ) {
    const maxChars = this.maxContextChars();
    const perSource = Math.max(1500, Math.floor(maxChars / Math.max(1, sources.length)));
    return sources.map((source) => ({
      type: source.type,
      label: source.label,
      url: source.url,
      content: source.content ? this.sanitizeText(source.content, perSource) : undefined,
      metadata: {
        repositoryId: source.metadata?.repositoryId,
        branch: source.metadata?.branch,
        language: source.metadata?.language,
        repoIntelligence: source.metadata?.contextSnapshot?.repoIntelligence,
        source: source.metadata?.source,
        inherited: source.metadata?.inherited,
      },
    }));
  }

  private compactContextSnapshot(snapshot: Record<string, any> | null) {
    if (!snapshot) return null;
    return {
      mode: snapshot.mode || null,
      role: snapshot.selectedRole
        ? {
            title: snapshot.selectedRole.title,
            jobProfile: snapshot.selectedRole.jobProfile,
            skillsRequired: snapshot.selectedRole.skillsRequired,
          }
        : snapshot.title
          ? {
              title: snapshot.title,
              jobProfile: snapshot.jobProfile,
              skillsRequired: snapshot.skillsRequired,
            }
          : null,
      roleDraft: snapshot.roleDraft
        ? {
            title: snapshot.roleDraft.title,
            jobProfile: snapshot.roleDraft.jobProfile,
            skills: snapshot.roleDraft.skills,
            workContext: this.sanitizeText(
              String(snapshot.roleDraft.workContext || ''),
              4000,
            ),
          }
        : null,
      jobDescription: snapshot.jobDescription
        ? {
            url: snapshot.jobDescription.url || null,
            fileName: snapshot.jobDescription.fileName || null,
            text: this.sanitizeText(
              String(snapshot.jobDescription.text || ''),
              8000,
            ),
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
      companyProfileIncluded: snapshot.companyProfileIncluded ?? null,
    };
  }

  private normalizeGenerationMode(value?: string | null): AssessmentGenerationMode {
    return value === 'fast' || value === 'deep' ? value : 'balanced';
  }

  private maxContextChars() {
    const configured = Number(
      this.configService.get<string>('ASSESSMENT_MAX_CONTEXT_CHARS') || 0,
    );
    return Number.isFinite(configured) && configured > 4000
      ? configured
      : DEFAULT_MAX_CONTEXT_CHARS;
  }

  private stringOrFallback(value: unknown, fallback: string) {
    const text = typeof value === 'string' ? value.trim() : '';
    return text || fallback;
  }

  private stringArrayOrFallback(value: unknown, fallback: string[]) {
    if (!Array.isArray(value)) return fallback;
    const items = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 12);
    return items.length ? items : fallback;
  }

  private safeAssessmentPath(value: string) {
    const normalized = String(value || 'README.md')
      .replace(/\\/g, '/')
      .replace(/^\.+/, '')
      .replace(/\/+/g, '/')
      .trim();
    return normalized && !normalized.startsWith('/') ? normalized : 'README.md';
  }

  private sanitizeCandidateFacingText(value: string) {
    return this.sanitizeText(value, 60_000)
      .replace(/contextSnapshot/gi, 'context')
      .replace(/system prompt/gi, 'instructions');
  }

  private containsSecretLikeText(value: string) {
    return SECRET_PATTERNS.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(value);
    });
  }
}
