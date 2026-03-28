import { fetchApi } from '../lib/apiClient';


export interface InterviewSession {
    id: string;
    date: Date;
    topic: string;
    type?: string;
    provider?: string;
    status?: 'completed' | 'analyzing' | 'error';
    overallScore?: number;
    durationSeconds?: number;
    analysis?: {
        overallScore: number;
        reading?: any[];
        listening?: any[];
        extempore?: any;
        technical?: any[];
        metrics?: any;
        transcript?: string;
        summary?: string;
        feedback?: Array<{ type: 'strength' | 'improvement'; text: string }>;
        logs?: any;
        logUrl?: string;
        raw?: any;
    };
    feedback?: any;
}

export class InterviewsService {
    private apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    private extractErrorMessage(payload: any, fallback: string): string {
        const message = payload?.message;
        if (Array.isArray(message) && message.length > 0) {
            return String(message[0]);
        }
        if (typeof message === 'string' && message.trim().length > 0) {
            return message;
        }
        return fallback;
    }

    private mapStatus(status?: string): 'completed' | 'analyzing' | 'error' {
        if (status === 'completed') return 'completed';
        if (status === 'in_progress') return 'analyzing';
        if (status === 'cancelled') return 'error';
        return 'completed';
    }

    private mapSession(apiSession: any): InterviewSession {
        const overallScore = typeof apiSession.overallScore === 'number'
            ? apiSession.overallScore
            : (typeof apiSession.analysis?.overallScore === 'number' ? apiSession.analysis.overallScore : undefined);

        return {
            id: apiSession.id,
            date: new Date(apiSession.createdAt || apiSession.completedAt || apiSession.startedAt || Date.now()),
            topic: apiSession.questions?.[0]?.context || apiSession.analysis?.theme || 'General Assessment',
            type: apiSession.type,
            provider: apiSession.analysisProvider,
            status: this.mapStatus(apiSession.status),
            overallScore,
            durationSeconds: typeof apiSession.duration === 'number' ? apiSession.duration : undefined,
            analysis: apiSession.analysis ? {
                overallScore: overallScore as number,
                reading: apiSession.analysis?.reading,
                listening: apiSession.analysis?.listening,
                extempore: apiSession.analysis?.extempore,
                technical: apiSession.analysis?.technical,
                metrics: apiSession.analysis?.metrics,
                transcript: apiSession.analysis?.transcript,
                summary: apiSession.analysis?.summary,
                feedback: apiSession.analysis?.feedback,
                logs: apiSession.analysis?.logs,
                logUrl: apiSession.analysis?.logUrl,
                raw: apiSession.analysis?.raw,
            } : (typeof overallScore === 'number' ? { overallScore } : undefined)
        };
    }

    async getSessions(): Promise<InterviewSession[]> {
        if (typeof window === 'undefined') return [];
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();

        try {
            const response = await fetchApi(`${this.apiBaseUrl}/interviews/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }

            const data = await response.json();
            const sessions = Array.isArray(data) ? data : [];
            return sessions
                .map((session) => this.mapSession(session))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (e) {
            console.error("Failed to fetch sessions", e);
            return [];
        }
    }

    async generateCommunicationDrill(topic?: string): Promise<any> {
        if (typeof window === 'undefined') {
            throw new Error('Communication drill generation is only available in the browser.');
        }

        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();

        const response = await fetchApi(`${this.apiBaseUrl}/interviews/communication/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(topic ? { topic } : {})
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            if (response.status === 403) {
                throw new Error(this.extractErrorMessage(payload, 'Pro subscription required for interview features.'));
            }
            throw new Error(this.extractErrorMessage(payload, 'Failed to generate communication drill.'));
        }

        return response.json();
    }

    async saveSession(session: InterviewSession): Promise<void> {
        return;
    }

    async getSessionById(id: string): Promise<InterviewSession | undefined> {
        const { getActiveToken } = await import('@/app/lib/auth-storage');
        const token = getActiveToken();

        try {
            const response = await fetchApi(`${this.apiBaseUrl}/interviews/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch session');
            }

            const session = await response.json();
            return this.mapSession(session);
        } catch (e) {
            console.error("Failed to fetch session", e);
            return undefined;
        }
    }
}
