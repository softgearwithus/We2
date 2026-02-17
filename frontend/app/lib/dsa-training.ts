import API_BASE_URL from './api-config';

export type TrainingTask = {
    sessionId: string;
    problem: any;
    mastery: number;
    nextReviewAt: string | null;
    canSubmit: boolean;
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

export const fetchTrainingTask = async (token: string): Promise<TrainingTask | { message: string }> => {
    const response = await fetch(`${API_BASE_URL}/dsa-training/task`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch training task');
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
