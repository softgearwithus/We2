import { Injectable, Logger } from '@nestjs/common';

interface CFProblem {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
}

interface CFProblemDetail {
    externalId: string;       // "1234A"
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    externalUrl: string;
    tags: string[];
    rating?: number;
    starterCode: Record<string, string>;
    languageMeta: Array<{ lang: string; langSlug: string }>;
}

// Codeforces uses a numeric rating (800-3500) rather than easy/medium/hard
function cfRatingToDifficulty(rating?: number): 'easy' | 'medium' | 'hard' {
    if (!rating) return 'medium';
    if (rating <= 1200) return 'easy';
    if (rating <= 2000) return 'medium';
    return 'hard';
}

const CF_LANGUAGES: Array<{ lang: string; langSlug: string }> = [
    { lang: 'C++', langSlug: 'cpp' },
    { lang: 'Java', langSlug: 'java' },
    { lang: 'Python 3', langSlug: 'python3' },
    { lang: 'C', langSlug: 'c' },
    { lang: 'C#', langSlug: 'csharp' },
    { lang: 'Go', langSlug: 'go' },
    { lang: 'Rust', langSlug: 'rust' },
    { lang: 'JavaScript', langSlug: 'javascript' },
    { lang: 'Kotlin', langSlug: 'kotlin' },
];

@Injectable()
export class CodeForcesService {
    private readonly logger = new Logger(CodeForcesService.name);
    private problemsCache: CFProblem[] | null = null;
    private cacheAt: Date | null = null;
    private readonly CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

    /**
     * Get the full Codeforces problem set (cached for 6 hours).
     * Uses the official public API: https://codeforces.com/api/problemset.problems
     */
    async getProblemSet(): Promise<CFProblem[]> {
        if (this.problemsCache && this.cacheAt && (Date.now() - this.cacheAt.getTime()) < this.CACHE_TTL_MS) {
            return this.problemsCache;
        }

        try {
            const response = await fetch('https://codeforces.com/api/problemset.problems', {
                headers: { 'accept': 'application/json' },
            });

            if (!response.ok) {
                this.logger.warn(`Codeforces API returned ${response.status}`);
                return this.problemsCache || [];
            }

            const json = await response.json();
            if (json?.status !== 'OK') {
                this.logger.warn(`Codeforces API status: ${json?.status}`);
                return this.problemsCache || [];
            }

            const problems: CFProblem[] = (json?.result?.problems || []);
            this.problemsCache = problems;
            this.cacheAt = new Date();
            return problems;
        } catch (err: any) {
            this.logger.warn(`Failed to fetch Codeforces problem set: ${err.message}`);
            return this.problemsCache || [];
        }
    }

    /**
     * Get a specific problem by contestId+index (e.g. contestId=1234, index="A").
     * The external ID is formatted as "{contestId}{index}" e.g. "1234A".
     */
    async getProblemDetail(externalId: string): Promise<CFProblemDetail | null> {
        try {
            // Parse externalId: digits = contestId, trailing letters = index
            const match = externalId.match(/^(\d+)([A-Z0-9]+)$/i);
            if (!match) {
                this.logger.warn(`Invalid Codeforces externalId format: ${externalId}`);
                return null;
            }
            const contestId = parseInt(match[1], 10);
            const index = match[2].toUpperCase();

            const problems = await this.getProblemSet();
            const problem = problems.find((p) => p.contestId === contestId && p.index === index);

            if (!problem) {
                this.logger.warn(`Codeforces problem not found: ${externalId}`);
                return null;
            }

            const difficulty = cfRatingToDifficulty(problem.rating);
            const externalUrl = `https://codeforces.com/problemset/problem/${contestId}/${index}`;

            // Codeforces does not expose full problem statements via their public API
            // (it requires scraping the problem page). We provide a link instead.
            const description = `<p>View this problem on Codeforces: <a href="${externalUrl}" target="_blank" rel="noreferrer">${externalUrl}</a></p>` +
                (problem.tags?.length ? `<p><strong>Tags:</strong> ${problem.tags.join(', ')}</p>` : '') +
                (problem.rating ? `<p><strong>Rating:</strong> ${problem.rating}</p>` : '');

            const starterCode: Record<string, string> = {};
            for (const lang of CF_LANGUAGES) {
                starterCode[lang.langSlug] = `// ${lang.lang} solution\n`;
            }

            return {
                externalId,
                title: problem.name,
                difficulty,
                description,
                externalUrl,
                tags: problem.tags || [],
                rating: problem.rating,
                starterCode,
                languageMeta: CF_LANGUAGES,
            };
        } catch (err: any) {
            this.logger.warn(`Failed to get Codeforces problem detail "${externalId}": ${err.message}`);
            return null;
        }
    }

    /**
     * Search Codeforces problems by tags and optional difficulty range.
     */
    async searchProblems(opts: {
        tags?: string[];
        minRating?: number;
        maxRating?: number;
        limit?: number;
    } = {}): Promise<CFProblemDetail[]> {
        const problems = await this.getProblemSet();
        const limit = opts.limit ?? 50;

        const filtered = problems.filter((p) => {
            if (opts.minRating && (p.rating ?? 0) < opts.minRating) return false;
            if (opts.maxRating && (p.rating ?? 9999) > opts.maxRating) return false;
            if (opts.tags?.length) {
                const problemTags = p.tags || [];
                return opts.tags.some((t) => problemTags.includes(t));
            }
            return true;
        });

        return filtered.slice(0, limit).map((problem) => {
            const contestId = problem.contestId;
            const index = problem.index;
            const extId = `${contestId}${index}`;
            const externalUrl = `https://codeforces.com/problemset/problem/${contestId}/${index}`;
            const difficulty = cfRatingToDifficulty(problem.rating);
            const description = `<p>View this problem on Codeforces: <a href="${externalUrl}" target="_blank" rel="noreferrer">${externalUrl}</a></p>` +
                (problem.tags?.length ? `<p><strong>Tags:</strong> ${problem.tags.join(', ')}</p>` : '') +
                (problem.rating ? `<p><strong>Rating:</strong> ${problem.rating}</p>` : '');

            const starterCode: Record<string, string> = {};
            for (const lang of CF_LANGUAGES) {
                starterCode[lang.langSlug] = `// ${lang.lang} solution\n`;
            }

            return {
                externalId: extId,
                title: problem.name,
                difficulty,
                description,
                externalUrl,
                tags: problem.tags || [],
                rating: problem.rating,
                starterCode,
                languageMeta: CF_LANGUAGES,
            };
        });
    }
}
