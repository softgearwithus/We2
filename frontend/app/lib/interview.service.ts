import { API_ENDPOINTS } from './api-config';

export interface InterviewSession {
    id: string;
    status: 'active' | 'completed';
    history: any[];
}

export interface InterviewResponse {
    text: string;
    interviewId: string;
}

export const startInterviewSession = async (userId: string = 'guest'): Promise<InterviewSession> => {
    const response = await fetch(`${API_ENDPOINTS.INTERVIEWS}/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
        throw new Error('Failed to start interview session');
    }

    return response.json();
};

export const sendInterviewMessage = async (interviewId: string, message: string): Promise<InterviewResponse> => {
    const response = await fetch(`${API_ENDPOINTS.INTERVIEWS}/${interviewId}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
};

export const endInterviewSession = async (interviewId: string): Promise<void> => {
    const response = await fetch(`${API_ENDPOINTS.INTERVIEWS}/${interviewId}/end`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to end interview session');
    }
};
