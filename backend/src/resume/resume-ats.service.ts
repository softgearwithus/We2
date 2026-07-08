import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import pdfParse from 'pdf-parse';

const MAX_RESUME_TEXT_CHARS = 35_000;
const MAX_CONTEXT_CHARS = 20_000;
const KEYWORD_LIMIT = 120;
const NON_ROLE_SIGNAL_TOKENS = new Set([
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

export type ResumeParseStatus = 'parsed' | 'empty' | 'unsupported' | 'failed';

export type ResumeParseResult = {
  text: string;
  contentType: string | null;
  extractionStatus: ResumeParseStatus;
  extractionError?: string | null;
};

export type ResumeEvidenceSnippet = {
  label: string;
  snippet: string;
};

export type ResumeAtsAnalysisResult = {
  score: number;
  confidence: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  matchedSkills: string[];
  missingSkills: string[];
  evidenceSnippets: ResumeEvidenceSnippet[];
  method: string;
};

@Injectable()
export class ResumeAtsService {
  private genAI?: GoogleGenerativeAI;
  private model?: GenerativeModel;

  constructor(private readonly configService: ConfigService) {
    this.initializeModel();
  }

  private initializeModel() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) return;
    this.genAI = new GoogleGenerativeAI(apiKey);
    const modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async extractPdfText(buffer: Buffer): Promise<ResumeParseResult> {
    try {
      const parsed = (await pdfParse(buffer)) as { text?: string };
      const text = this.limitText(parsed.text || '', MAX_RESUME_TEXT_CHARS);
      return {
        text,
        contentType: 'application/pdf',
        extractionStatus: text.trim() ? 'parsed' : 'empty',
        extractionError: text.trim() ? null : 'Could not extract readable text from the PDF.',
      };
    } catch (error) {
      return {
        text: '',
        contentType: 'application/pdf',
        extractionStatus: 'failed',
        extractionError:
          error instanceof Error ? error.message.slice(0, 400) : 'Resume parsing failed.',
      };
    }
  }

  async analyzePdf(input: {
    buffer: Buffer;
    jobDescription?: string | null;
    requiredSkills?: string[];
    roleContext?: string | null;
    useAi?: boolean;
  }) {
    const parsed = await this.extractPdfText(input.buffer);
    const analysis = await this.analyzeText({
      resumeText: parsed.text,
      jobDescription: input.jobDescription,
      requiredSkills: input.requiredSkills,
      roleContext: input.roleContext,
      useAi: input.useAi,
      parseStatus: parsed.extractionStatus,
    });
    return { parsed, analysis };
  }

  async analyzeText(input: {
    resumeText: string;
    jobDescription?: string | null;
    requiredSkills?: string[];
    roleContext?: string | null;
    useAi?: boolean;
    parseStatus?: ResumeParseStatus;
  }): Promise<ResumeAtsAnalysisResult> {
    const deterministic = this.deterministicAnalyze(input);
    if (input.useAi === false || !input.resumeText.trim()) {
      return deterministic;
    }

    if (!this.model) this.initializeModel();
    if (!this.model) return deterministic;

    try {
      const prompt = this.buildPrompt(input, deterministic);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const raw = response.text();
      const parsed = this.parseModelJson(raw);
      return this.validateModelResult(parsed, deterministic);
    } catch {
      return deterministic;
    }
  }

  private deterministicAnalyze(input: {
    resumeText: string;
    jobDescription?: string | null;
    requiredSkills?: string[];
    roleContext?: string | null;
    parseStatus?: ResumeParseStatus;
  }): ResumeAtsAnalysisResult {
    const resumeText = this.limitText(input.resumeText || '', MAX_RESUME_TEXT_CHARS);
    const normalizedResume = resumeText.toLowerCase();
    const resumeTokens = new Set(this.tokenize(normalizedResume));
    const context = [
      input.jobDescription,
      input.roleContext,
      ...(input.requiredSkills || []),
    ]
      .filter(Boolean)
      .join(' ');
    const contextTokens = this.tokenize(context).slice(0, KEYWORD_LIMIT);
    const requiredSkills = Array.from(new Set(input.requiredSkills || [])).filter(Boolean);
    const matchedSkills = requiredSkills.filter((skill) =>
      this.skillMatches(skill, normalizedResume, resumeTokens),
    );
    const missingSkills = requiredSkills.filter(
      (skill) => !matchedSkills.includes(skill),
    );
    const contextHits = contextTokens.filter((token) => resumeTokens.has(token));
    const skillScore = requiredSkills.length
      ? (matchedSkills.length / requiredSkills.length) * 60
      : contextHits.length
        ? 45
        : 25;
    const contextScore = contextTokens.length
      ? Math.min(30, (contextHits.length / Math.max(12, contextTokens.length)) * 50)
      : 12;
    const evidenceBonus = resumeText.trim().length > 500 ? 10 : 0;
    const score = this.clampScore(skillScore + contextScore + evidenceBonus);
    const confidence = this.estimateConfidence({
      resumeText,
      parseStatus: input.parseStatus,
      requiredSkills,
      matchedSkills,
      contextHits,
    });
    const evidenceSnippets = [
      ...matchedSkills.map((skill) => ({
        label: skill,
        snippet: this.findEvidenceSnippet(resumeText, skill),
      })),
      ...contextHits.slice(0, 5).map((token) => ({
        label: token,
        snippet: this.findEvidenceSnippet(resumeText, token),
      })),
    ].filter((item) => item.snippet);

    return {
      score,
      confidence,
      summary: [
        matchedSkills.length
          ? `Matched ${matchedSkills.length} required skill${matchedSkills.length === 1 ? '' : 's'}: ${matchedSkills.slice(0, 8).join(', ')}.`
          : 'Required skill evidence is limited in the parsed resume text.',
        missingSkills.length
          ? `Missing or unclear: ${missingSkills.slice(0, 8).join(', ')}.`
          : 'No required skill gaps were detected by the ATS scan.',
        confidence < 0.5
          ? 'Manual review is recommended because parse confidence is low.'
          : 'Resume evidence is sufficient for automated screening.',
      ].join(' '),
      strengths: matchedSkills.slice(0, 6).map((skill) => `Shows evidence of ${skill}.`),
      weaknesses: missingSkills.slice(0, 6).map((skill) => `${skill} is missing or unclear.`),
      suggestions: missingSkills.slice(0, 5).map((skill) => `Add measurable project or work evidence for ${skill}.`),
      matchedSkills,
      missingSkills,
      evidenceSnippets: evidenceSnippets.slice(0, 10),
      method: 'deterministic_ats_v1',
    };
  }

  private buildPrompt(
    input: {
      resumeText: string;
      jobDescription?: string | null;
      requiredSkills?: string[];
      roleContext?: string | null;
    },
    fallback: ResumeAtsAnalysisResult,
  ) {
    return `
You are Emble's guarded ATS resume screening engine.
Score only role-relevant evidence from the resume. Do not score or infer from name, email, phone, age, gender, photo, location, nationality, college prestige, or protected traits.
Return strict JSON only. No markdown.

Target context:
${this.limitText([input.jobDescription, input.roleContext].filter(Boolean).join('\n'), MAX_CONTEXT_CHARS)}

Required skills:
${(input.requiredSkills || []).join(', ') || 'None supplied'}

Resume text:
${this.limitText(input.resumeText, MAX_RESUME_TEXT_CHARS)}

Fallback deterministic result:
${JSON.stringify(fallback)}

JSON shape:
{
  "score": 0,
  "confidence": 0.0,
  "summary": "short evidence-based summary",
  "strengths": ["role-relevant strength"],
  "weaknesses": ["role-relevant gap"],
  "suggestions": ["candidate improvement suggestion"],
  "matchedSkills": ["skill with direct resume evidence"],
  "missingSkills": ["required skill missing or unclear"],
  "evidenceSnippets": [{"label":"skill","snippet":"short exact resume evidence"}]
}`;
  }

  private parseModelJson(raw: string) {
    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
    return JSON.parse(cleaned);
  }

  private validateModelResult(
    value: any,
    fallback: ResumeAtsAnalysisResult,
  ): ResumeAtsAnalysisResult {
    const score = this.clampScore(value?.score);
    const confidence = this.clampConfidence(value?.confidence);
    const evidence = Array.isArray(value?.evidenceSnippets)
      ? value.evidenceSnippets
          .map((item: any) => ({
            label: String(item?.label || '').trim().slice(0, 80),
            snippet: String(item?.snippet || '').trim().slice(0, 320),
          }))
          .filter((item: ResumeEvidenceSnippet) => item.label && item.snippet)
          .slice(0, 10)
      : fallback.evidenceSnippets;

    return {
      score,
      confidence,
      summary: String(value?.summary || fallback.summary).trim().slice(0, 900),
      strengths: this.safeStringArray(value?.strengths, fallback.strengths),
      weaknesses: this.safeStringArray(value?.weaknesses, fallback.weaknesses),
      suggestions: this.safeStringArray(value?.suggestions, fallback.suggestions),
      matchedSkills: this.safeStringArray(value?.matchedSkills, fallback.matchedSkills),
      missingSkills: this.safeStringArray(value?.missingSkills, fallback.missingSkills),
      evidenceSnippets: evidence.length ? evidence : fallback.evidenceSnippets,
      method: 'gemini_guarded_ats_v1',
    };
  }

  private estimateConfidence(input: {
    resumeText: string;
    parseStatus?: ResumeParseStatus;
    requiredSkills: string[];
    matchedSkills: string[];
    contextHits: string[];
  }) {
    if (input.parseStatus && input.parseStatus !== 'parsed') return 0.15;
    const lengthScore = input.resumeText.trim().length > 1200 ? 0.35 : input.resumeText.trim().length > 400 ? 0.22 : 0.08;
    const skillScore = input.requiredSkills.length
      ? Math.min(0.45, (input.matchedSkills.length / input.requiredSkills.length) * 0.45)
      : 0.18;
    const contextScore = Math.min(0.2, input.contextHits.length * 0.02);
    return this.clampConfidence(lengthScore + skillScore + contextScore);
  }

  private safeStringArray(value: unknown, fallback: string[]) {
    const source = Array.isArray(value) ? value : fallback;
    return source
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 12);
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
              !NON_ROLE_SIGNAL_TOKENS.has(token),
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
    if (NON_ROLE_SIGNAL_TOKENS.has(normalized)) return false;
    if (normalized.length === 1) {
      return new RegExp(`(^|[^a-z0-9+#.])${this.escapeRegExp(normalized)}(?=[^a-z0-9+#.]|$)`).test(resumeText);
    }
    if (resumeText.includes(normalized)) return true;
    const parts = normalized.split(/\s+/).filter(Boolean);
    return parts.length > 0 && parts.every((part) => resumeTokens.has(part));
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private findEvidenceSnippet(text: string, term: string) {
    const normalized = text || '';
    const index = normalized.toLowerCase().indexOf(term.toLowerCase());
    if (index < 0) return '';
    const start = Math.max(0, index - 90);
    const end = Math.min(normalized.length, index + term.length + 140);
    return normalized.slice(start, end).replace(/\s+/g, ' ').trim();
  }

  private clampScore(value: unknown) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(100, Math.round(numeric)));
  }

  private clampConfidence(value: unknown) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(1, Number(numeric.toFixed(2))));
  }

  private limitText(value: string, maxLength: number) {
    const normalized = (value || '').replace(/\r\n/g, '\n').trim();
    return normalized.length > maxLength
      ? normalized.slice(0, maxLength).trim()
      : normalized;
  }
}
