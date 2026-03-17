import API_BASE_URL from './api-config';

const readErrorMessage = async (response: Response, fallback: string) => {
    const payload = await response.json().catch(() => null);

    if (typeof payload?.message === 'string' && payload.message.trim()) {
        return payload.message;
    }

    if (Array.isArray(payload?.message) && payload.message.length > 0) {
        return payload.message.join(', ');
    }

    return fallback;
};

export type McqAdminItem = {
    id: string;
    category: 'subject' | 'company';
    groupKey: string;
    groupLabel: string;
    topicKey?: string | null;
    topicLabel?: string | null;
    question: string;
    options: string[];
    correctOptionIndex: number;
    isNew?: boolean;
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
    durationMinutes?: number;
};

export type WriteXQuestion = {
    id: string;
    prompt: string;
    active: boolean;
    isNew?: boolean;
    topicKey?: string | null;
    topicLabel?: string | null;
    createdAt: string;
};

export type CreateMcqPayload = {
    category: 'subject' | 'company';
    group: string;
    topic?: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    isNew?: boolean;
};

export type UpdateMcqPayload = Partial<CreateMcqPayload>;


export type CreateWriteXPayload = {
    prompt: string;
    active?: boolean;
    isNew?: boolean;
    topicKey?: string;
    topicLabel?: string;
};

export type UpdateWriteXPayload = {
    prompt?: string;
    active?: boolean;
    isNew?: boolean;
    topicKey?: string;
    topicLabel?: string;
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
    if (!response.ok) throw new Error(await readErrorMessage(response, 'Failed to create MCQ'));
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

export async function deleteMcq(token: string, id: string) {
    const res = await fetch(`${API_BASE_URL}/mcqs/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error('Failed to delete MCQ');
    return res.json();
}

// --- WriteX ---
export async function fetchAdminWritex(
    token: string,
    params?: { search?: string; limit?: number; page?: number }
) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.page) query.set('page', params.page.toString());

    const res = await fetch(`${API_BASE_URL}/write-x/admin?${query.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch WriteX prompts');
    }

    return res.json();
}

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

export const deleteMcqModule = async (token: string, category: 'subject' | 'company', groupKey: string, topicKey: string) => {
    const params = new URLSearchParams({
        category,
        groupKey,
        topicKey
    });
    const response = await fetch(`${API_BASE_URL}/mcqs/admin?${params.toString()}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete module');
    return response.json();
};

export const deleteMcqSubject = async (token: string, category: 'subject' | 'company', groupKey: string) => {
    const params = new URLSearchParams({
        category,
        groupKey
    });
    const response = await fetch(`${API_BASE_URL}/mcqs/admin?${params.toString()}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete subject');
    return response.json();
};

export const updateMcqModuleDuration = async (token: string, category: 'subject' | 'company', groupKey: string, topicKey: string, durationMinutes: number) => {
    const response = await fetch(`${API_BASE_URL}/mcqs/admin/duration`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, groupKey, topicKey, durationMinutes }),
    });
    if (!response.ok) throw new Error('Failed to update module duration');
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
    const response = await fetch(`${API_BASE_URL}/mcqs/groups?category=${category}&groupBy=group`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await readErrorMessage(response, 'Failed to fetch MCQ groups'));
    return response.json() as Promise<McqGroup[]>;
};

export const fetchMcqTopics = async (token: string, category: 'subject' | 'company', groupKey: string) => {
    const response = await fetch(`${API_BASE_URL}/mcqs/groups?category=${category}&groupBy=topic&groupKey=${encodeURIComponent(groupKey)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await readErrorMessage(response, 'Failed to fetch MCQ topics'));
    return response.json() as Promise<McqGroup[]>;
};

export const fetchWriteXGroups = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/writex/groups`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch WriteX groups');
    return response.json() as Promise<McqGroup[]>;
};

export const fetchWriteXQuestions = async (token: string, topicKey?: string) => {
    const query = topicKey ? `?topicKey=${encodeURIComponent(topicKey)}` : '';
    const response = await fetch(`${API_BASE_URL}/writex/questions${query}`, {
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
