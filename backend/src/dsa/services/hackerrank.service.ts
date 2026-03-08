import { Injectable, Logger } from '@nestjs/common';

interface HRProblemSummary {
    slug: string;
    name: string;
    difficulty_name: string;
    preview: string;
    url: string;
    primaryContestSlug?: string;
}

interface HRProblemDetail {
    slug: string;
    title: string;
    difficulty: string;
    description: string;  // HTML
    externalUrl: string;
    starterCode: Record<string, string>;
    languageMeta: Array<{ lang: string; langSlug: string }>;
}

@Injectable()
export class HackerRankService {
    private readonly logger = new Logger(HackerRankService.name);

    // HackerRank difficulty names to our enum
    private mapDifficulty(hr: string): 'easy' | 'medium' | 'hard' {
        const d = (hr || '').toLowerCase();
        if (d === 'hard' || d === 'expert' || d === 'advanced') return 'hard';
        if (d === 'medium' || d === 'intermediate') return 'medium';
        return 'easy';
    }

    private langSlugMap: Record<string, string> = {
        c: 'c',
        cpp: 'cpp',
        cpp14: 'cpp',
        java: 'java',
        java8: 'java',
        python: 'python',
        python3: 'python3',
        javascript: 'javascript',
        ruby: 'ruby',
        scala: 'scala',
        kotlin: 'kotlin',
        go: 'go',
        haskell: 'haskell',
        rust: 'rust',
        swift: 'swift',
        sql: 'sql',
        mysql: 'mysql',
        oracle: 'oracle',
        tsql: 'tsql',
    };

    /**
     * Fetch a single HackerRank problem's detail by its slug.
     * Uses the public HackerRank challenges API.
     */
    async fetchProblemDetail(slug: string): Promise<HRProblemDetail | null> {
        try {
            const url = `https://www.hackerrank.com/rest/contests/master/challenges/${slug}`;
            const response = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'user-agent': 'Mozilla/5.0',
                },
            });

            if (!response.ok) {
                this.logger.warn(`HackerRank API returned ${response.status} for slug: ${slug}`);
                return null;
            }

            const json = await response.json();
            const model = json?.model;
            if (!model) return null;

            const difficulty = this.mapDifficulty(model.difficulty_name || model.difficulty || '');
            const externalUrl = `https://www.hackerrank.com/challenges/${slug}/problem`;

            // Build starter code stubs for available languages
            const supportedLangs: Array<{ lang: string; langSlug: string }> = [];
            const starterCode: Record<string, string> = {};

            const langKeys: string[] = model.languages || [];
            for (const lang of langKeys) {
                const normalized = this.langSlugMap[lang] || lang;
                if (!supportedLangs.find((l) => l.langSlug === normalized)) {
                    const displayName = this.getDisplayName(normalized);
                    supportedLangs.push({ lang: displayName, langSlug: normalized });
                    starterCode[normalized] = `// ${displayName} solution\n`;
                }
            }

            // Use the problem body_html as description
            const description = model.body_html || model.preview || '<p>See problem on HackerRank.</p>';

            return {
                slug,
                title: model.name || slug,
                difficulty,
                description,
                externalUrl,
                starterCode,
                languageMeta: supportedLangs,
            };
        } catch (err: any) {
            this.logger.warn(`Failed to fetch HackerRank problem "${slug}": ${err.message}`);
            return null;
        }
    }

    /**
     * Search HackerRank problems by track (e.g. "algorithms", "data-structures", "sql").
     * Returns up to `limit` problem summaries.
     */
    async listProblems(track: string = 'algorithms', limit: number = 50, offset: number = 0): Promise<HRProblemSummary[]> {
        try {
            const url = `https://www.hackerrank.com/rest/contests/master/tracks/${track}/challenges?limit=${limit}&offset=${offset}`;
            const response = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'user-agent': 'Mozilla/5.0',
                },
            });

            if (!response.ok) {
                this.logger.warn(`HackerRank list API returned ${response.status} for track: ${track}`);
                return [];
            }

            const json = await response.json();
            const models: any[] = json?.models || [];
            return models.map((m) => ({
                slug: m.slug,
                name: m.name,
                difficulty_name: m.difficulty_name || '',
                preview: m.preview || '',
                url: `https://www.hackerrank.com/challenges/${m.slug}/problem`,
            }));
        } catch (err: any) {
            this.logger.warn(`Failed to list HackerRank problems for track "${track}": ${err.message}`);
            return [];
        }
    }

    private getDisplayName(langSlug: string): string {
        const map: Record<string, string> = {
            c: 'C',
            cpp: 'C++',
            java: 'Java',
            python: 'Python',
            python3: 'Python 3',
            javascript: 'JavaScript',
            ruby: 'Ruby',
            scala: 'Scala',
            kotlin: 'Kotlin',
            go: 'Go',
            haskell: 'Haskell',
            rust: 'Rust',
            swift: 'Swift',
            sql: 'SQL',
            mysql: 'MySQL',
            oracle: 'Oracle SQL',
            tsql: 'MS SQL Server',
        };
        return map[langSlug] || langSlug;
    }
}
