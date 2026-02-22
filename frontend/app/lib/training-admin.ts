import API_BASE_URL from './api-config';

export type TrainingProblemListResponse<T> = {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
};

export type DsaAdminProblem = {
    id: string;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    categories?: string[];
    createdAt: string;
    isActive: boolean;
};

export type SqlAdminProblem = {
    id: string;
    title: string;
    slug: string;
    difficulty: 'easy' | 'medium' | 'hard';
    categories?: string[];
    createdAt: string;
    isActive: boolean;
};

export const fetchAdminDsaProblems = async (
    token: string,
    query: Record<string, string | number | undefined>,
) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value));
        }
    });
    const response = await fetch(`${API_BASE_URL}/dsa-training/admin/problems?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch DSA problems');
    return response.json() as Promise<TrainingProblemListResponse<DsaAdminProblem>>;
};

export const fetchAdminSqlProblems = async (
    token: string,
    query: Record<string, string | number | undefined>,
) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value));
        }
    });
    const response = await fetch(`${API_BASE_URL}/sql-training/admin/problems?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch SQL problems');
    return response.json() as Promise<TrainingProblemListResponse<SqlAdminProblem>>;
};
