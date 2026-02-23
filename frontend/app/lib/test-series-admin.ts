import API_BASE_URL from './api-config';

export type McqAdminItem = {
    id: string;
    category: 'subject' | 'company';
    groupKey: string;
    groupLabel: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    createdAt: string;
};

export type McqAdminListResponse = {
    items: McqAdminItem[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
};

export type McqGroup = {
    key: string;
    label: string;
    count: number;
};

export type WriteXQuestion = {
    id: string;
    prompt: string;
    active: boolean;
    createdAt: string;
};

export type CreateMcqPayload = {
    category: 'subject' | 'company';
    group: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
};

export type UpdateMcqPayload = Partial<CreateMcqPayload>;


export type CreateWriteXPayload = {
    prompt: string;
    active?: boolean;
};

export type UpdateWriteXPayload = {
    prompt?: string;
    active?: boolean;
};

export const fetchAdminMcqs = async (token: string, query: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value));
        }
    });
    const response = await fetch(`${API_BASE_URL}/mcqs/admin?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch MCQs');
    return response.json() as Promise<McqAdminListResponse>;
};

export const createMcq = async (token: string, payload: CreateMcqPayload) => {
    const response = await fetch(`${API_BASE_URL}/mcqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create MCQ');
    return response.json();
};

export const updateMcq = async (token: string, id: string, payload: UpdateMcqPayload) => {
    const response = await fetch(`${API_BASE_URL}/mcqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update MCQ');
    return response.json();
};

export const deleteMcq = async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/mcqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete MCQ');
    return response.json();
};

export const bulkDeleteMcqs = async (
    token: string,
    query: Record<string, string | number | undefined>,
) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value));
        }
    });
    const response = await fetch(`${API_BASE_URL}/mcqs/admin?${params.toString()}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to bulk delete MCQs');
    return response.json();
};

export const importMcqsCsv = async (apiKey: string, csv: string) => {
    const response = await fetch(`${API_BASE_URL}/mcqs/import`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({ csv }),
    });
    if (!response.ok) throw new Error('Failed to import MCQs from CSV');
    return response.json();
};

export const fetchMcqGroups = async (token: string, category: 'subject' | 'company') => {
    const response = await fetch(`${API_BASE_URL}/mcqs/groups?category=${category}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch MCQ groups');
    return response.json() as Promise<McqGroup[]>;
};

export const fetchWriteXQuestions = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/writex/questions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch WriteX questions');
    return response.json() as Promise<WriteXQuestion[]>;
};

export const createWriteXQuestion = async (token: string, payload: CreateWriteXPayload) => {
    const response = await fetch(`${API_BASE_URL}/writex/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create WriteX question');
    return response.json();
};

export const updateWriteXQuestion = async (token: string, id: string, payload: UpdateWriteXPayload) => {
    const response = await fetch(`${API_BASE_URL}/writex/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update WriteX question');
    return response.json();
};

export const deleteWriteXQuestion = async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/writex/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete WriteX question');
    return response.json();
};
