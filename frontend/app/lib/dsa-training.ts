import API_BASE_URL from './api-config';

export type TrainingTask = {
    sessionId: string;
    problem: any;
    mastery: number;
    nextReviewAt: string | null;
    canSubmit: boolean;
    mode?: 'srs' | 'manual';
};

export type TrainingSubmission = {
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

export type TrainingSubmitResult = {
    status: 'accepted' | 'rejected';
    score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    nextReviewAt: string;
    mastery: number;
};

export const fetchTrainingTask = async (token: string, platform?: string): Promise<TrainingTask | { message: string }> => {
    const params = platform ? `?platform=${platform}` : '';
    const response = await fetch(`${API_BASE_URL}/dsa-training/task${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch training task');
    }

    return response.json();
};

export const fetchTrainingTaskForProblem = async (
    token: string,
    problemId: string,
): Promise<TrainingTask> => {
    const response = await fetch(`${API_BASE_URL}/dsa-training/task/${problemId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        let errorMessage = 'Failed to fetch selected training task';
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

export const submitTrainingTask = async (
    token: string,
    payload: { sessionId: string; code: string; language: string },
): Promise<TrainingSubmitResult | { message: string }> => {
    const response = await fetch(`${API_BASE_URL}/dsa-training/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error('Failed to submit training task');
    }

    return response.json();
};

export const fetchTrainingInsight = async (token: string, problemId: string) => {
    const response = await fetch(`${API_BASE_URL}/dsa-training/learn/${problemId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch learning insight');
    }

    return response.json();
};

export const generateTrainingInsight = async (token: string, problemId: string) => {
    const response = await fetch(`${API_BASE_URL}/dsa-training/learn/${problemId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to generate learning insight');
    }

    return response.json();
};

export const fetchTrainingSubmissions = async (token: string, problemId?: string): Promise<TrainingSubmission[]> => {
    const url = problemId
        ? `${API_BASE_URL}/dsa-training/submissions/${problemId}`
        : `${API_BASE_URL}/dsa-training/submissions`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch training submissions');
    }

    return response.json();
};
