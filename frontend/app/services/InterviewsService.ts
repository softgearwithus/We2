
export interface InterviewSession {
    id: string;
    date: Date;
    topic: string;
    type?: string;
    provider?: string;
    status?: 'completed' | 'analyzing' | 'error';
    overallScore?: number;
    analysis?: {
        overallScore: number;
        reading?: any[];
        listening?: any[];
        extempore?: any;
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
    private storageKey = 'prep0_interview_sessions';
    private apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
            analysis: apiSession.analysis ? {
                overallScore: overallScore as number,
                reading: apiSession.analysis?.reading,
                listening: apiSession.analysis?.listening,
                extempore: apiSession.analysis?.extempore,
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
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${this.apiBaseUrl}/interviews/me`, {
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

    async saveSession(session: InterviewSession): Promise<void> {
        const sessions = await this.getSessions();
        const existingIndex = sessions.findIndex((s) => s.id === session.id);
        if (existingIndex >= 0) {
            sessions[existingIndex] = session;
        } else {
            sessions.push(session);
        }
        localStorage.setItem(this.storageKey, JSON.stringify(sessions));
    }

    async getSessionById(id: string): Promise<InterviewSession | undefined> {
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${this.apiBaseUrl}/interviews/${id}`, {
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
