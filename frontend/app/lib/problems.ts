import API_BASE_URL from './api-config';

export interface TestCase {
    input: string;
    expected: string;
    isHidden?: boolean;
}

export interface Problem {
    id: string; // slug
    uuid: string; // database UUID
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string; // HTML/Markdown
    examples: Array<{ input: string; output: string; explanation?: string }>;
    constraints: string[];
    starterCode: Record<string, string>;
    codeTemplates?: Record<string, string>;
    languageMeta?: Array<{ lang: string; langSlug: string }>;
    leetcodeUrl?: string | null;
    externalUrl?: string | null;
    platform?: string | null;
    testCases: TestCase[];
    // New Fields
    acceptanceRate: number;
    status: 'Solved' | 'Attempted' | 'Todo';
    tags: string[];
    companies: string[];
    likes: number;
    dislikes: number;
    hints: string[];
}

const mapProblem = (p: any): Problem => ({
    id: p.slug,
    uuid: p.id,
    title: p.title,
    difficulty: p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1),
    description: p.description,
    examples: p.examples,
    constraints: p.constraints,
    starterCode: p.starterCode,
    codeTemplates: p.codeTemplates || null,
    languageMeta: p.languageMeta || null,
    leetcodeUrl: p.leetcodeUrl || null,
    externalUrl: p.externalUrl || p.leetcodeUrl || null,
    platform: p.platform || 'leetcode',
    testCases: p.testCases,
    acceptanceRate: p.submissions > 0 ? Math.round((p.accepted / p.submissions) * 100 * 10) / 10 : 0,
    status: 'Todo',
    tags: p.categories || [],
    companies: p.companyTags || [],
    likes: p.likes,
    dislikes: p.dislikes,
    hints: p.hints || [],
});

export const fetchProblems = async (platform?: string): Promise<Problem[]> => {
    try {
        const params = platform ? `?platform=${platform}` : '';
        const response = await fetch(`${API_BASE_URL}/dsa/problems${params}`);
        if (!response.ok) throw new Error('Failed to fetch problems');
        const data = await response.json();
        return data.map(mapProblem);
    } catch (error) {
        console.error('Error fetching problems:', error);
        return [];
    }
};

export const fetchProblemBySlug = async (slug: string): Promise<Problem | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dsa/problems/slug/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch problem');
        const p = await response.json();
        return mapProblem(p);
    } catch (error) {
        console.error('Error fetching problem:', error);
        return null;
    }
};

// --- SQL Problems ---

export interface SqlProblem {
    id: string; // slug
    uuid: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    leetcodeUrl?: string | null;
    externalUrl?: string | null;
    platform?: string | null;
    companies: string[];
}

export const fetchSqlProblems = async (platform?: string): Promise<SqlProblem[]> => {
    try {
        const params = platform ? `?platform=${platform}` : '';
        const response = await fetch(`${API_BASE_URL}/sql/problems${params}`);
        if (!response.ok) throw new Error('Failed to fetch SQL problems');
        const data = await response.json();
        return data.map((p: any): SqlProblem => ({
            id: p.slug,
            uuid: p.id,
            title: p.title,
            difficulty: p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1),
            leetcodeUrl: p.leetcodeUrl || null,
            externalUrl: p.externalUrl || p.leetcodeUrl || null,
            platform: p.platform || 'leetcode',
            companies: p.companyTags || [],
        }));
    } catch (error) {
        console.error('Error fetching SQL problems:', error);
        return [];
    }
};
