import API_BASE_URL from './api-config';

export interface SqlProblem {
    id: string;
    uuid: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    examples: Array<{ input: string; output: string; explanation?: string }>;
    constraints: string[];
    starterCode: Record<string, string>;
    codeTemplates?: Record<string, string> | null;
    languageMeta?: Array<{ lang: string; langSlug: string }> | null;
    leetcodeUrl?: string | null;
    externalUrl?: string | null;
    platform?: string | null;
    testCases: Array<{ input: string; expected: string; isHidden?: boolean }>;
    acceptanceRate: number;
    status: 'Solved' | 'Attempted' | 'Todo';
    tags: string[];
    companies: string[];
    likes: number;
    dislikes: number;
    hints: string[];
}

const mapDifficulty = (raw: string): 'Easy' | 'Medium' | 'Hard' => {
    const value = String(raw || '').toLowerCase();
    if (value === 'hard') return 'Hard';
    if (value === 'medium') return 'Medium';
    return 'Easy';
};

const mapSqlProblem = (p: any): SqlProblem => ({
    id: p.slug,
    uuid: p.id,
    title: p.title,
    difficulty: mapDifficulty(p.difficulty),
    description: p.description,
    examples: p.examples || [],
    constraints: p.constraints || [],
    starterCode: p.starterCode || {},
    codeTemplates: p.codeTemplates || null,
    languageMeta: p.languageMeta || null,
    leetcodeUrl: p.leetcodeUrl || null,
    externalUrl: p.externalUrl || p.leetcodeUrl || null,
    platform: p.platform || 'leetcode',
    testCases: p.testCases || [],
    acceptanceRate: p.submissions > 0 ? Math.round((p.accepted / p.submissions) * 100 * 10) / 10 : 0,
    status: 'Todo',
    tags: p.categories || [],
    companies: p.companyTags || [],
    likes: p.likes || 0,
    dislikes: p.dislikes || 0,
    hints: p.hints || [],
});

export const fetchSqlProblems = async (platform?: string): Promise<SqlProblem[]> => {
    const params = platform ? `?platform=${platform}` : '';
    const response = await fetch(`${API_BASE_URL}/sql/problems${params}`);
    if (!response.ok) throw new Error('Failed to fetch SQL problems');
    const data = await response.json();
    return data.map(mapSqlProblem);
};

export const fetchSqlProblemBySlug = async (slug: string): Promise<SqlProblem | null> => {
    const response = await fetch(`${API_BASE_URL}/sql/problems/slug/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch SQL problem');
    const p = await response.json();
    return mapSqlProblem(p);
};
