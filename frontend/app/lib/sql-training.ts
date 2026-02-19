import API_BASE_URL from './api-config';

export type SqlTrainingTask = {
    sessionId: string;
    problem: any;
    mastery: number;
    nextReviewAt: string | null;
    canSubmit: boolean;
    mode?: 'srs' | 'manual';
};

export type SqlTrainingSubmission = {
    id: string;
    problemId: string;
    language: string;
    status: string;
    score: number | null;
    evaluationSummary: string | null;
    evaluationStrengths: string[] | null;
    evaluationImprovements: string[] | null;
    evaluationModel: string | null;
    evaluationRaw: Record<string, any> | null;
    submittedAt: string;
};

export type SqlTrainingSubmitResult = {
    status: 'accepted' | 'rejected';
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    nextReviewAt: string;
    mastery: number;
};

export const fetchSqlTrainingTask = async (token: string): Promise<SqlTrainingTask | { message: string }> => {
    const response = await fetch(`${API_BASE_URL}/sql-training/task`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch SQL training task');
    }

    return response.json();
};

export const fetchSqlTrainingTaskForProblem = async (
    token: string,
    problemId: string,
): Promise<SqlTrainingTask> => {
    const response = await fetch(`${API_BASE_URL}/sql-training/task/${problemId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        let errorMessage = 'Failed to fetch selected SQL training task';
        try {
            const data = await response.json();
            if (data?.message) {
                errorMessage = data.message;
            }
        } catch (error) {
            // ignore parsing errors
        }
        throw new Error(errorMessage);
    }

    return response.json();
};

export const submitSqlTrainingTask = async (
    token: string,
    payload: { sessionId: string; code: string; language: string },
): Promise<SqlTrainingSubmitResult | { message: string }> => {
    const response = await fetch(`${API_BASE_URL}/sql-training/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Failed to submit SQL training task');
    }

    return response.json();
};

export const fetchSqlTrainingInsight = async (token: string, problemId: string) => {
    const response = await fetch(`${API_BASE_URL}/sql-training/learn/${problemId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch SQL learning insight');
    }

    return response.json();
};

export const generateSqlTrainingInsight = async (token: string, problemId: string) => {
    const response = await fetch(`${API_BASE_URL}/sql-training/learn/${problemId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to generate SQL learning insight');
    }

    return response.json();
};

export const fetchSqlTrainingSubmissions = async (token: string, problemId?: string): Promise<SqlTrainingSubmission[]> => {
    const url = problemId
        ? `${API_BASE_URL}/sql-training/submissions/${problemId}`
        : `${API_BASE_URL}/sql-training/submissions`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch SQL training submissions');
    }

    return response.json();
};
