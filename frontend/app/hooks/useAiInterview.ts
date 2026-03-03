import { useEffect, useMemo, useRef, useState } from 'react';

type AiEvent = {
    event: string;
    payload: any;
};

export const useAiInterview = (sessionId?: string) => {
    const [connected, setConnected] = useState(false);
    const [lastQuestion, setLastQuestion] = useState<string | null>(null);
    const [warnings, setWarnings] = useState(0);
    const [scores, setScores] = useState<any[]>([]);
    const [queue, setQueue] = useState<any[]>([]);
    const [terminated, setTerminated] = useState<{ reason?: string } | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const wsUrl = useMemo(() => {
        if (!sessionId) return null;
        const explicitWsBase = process.env.NEXT_PUBLIC_AI_INTERVIEW_WS_URL;
        const apiBase = process.env.NEXT_PUBLIC_API_URL;
        const base = explicitWsBase || apiBase;
        if (!base) return null;

        try {
            // Allow passing a ws:// base directly.
            if (/^wss?:\/\//i.test(base)) {
                return `${base.replace(/\/$/, '')}/ai-interview/sessions/${sessionId}/stream`;
            }

            const u = new URL(base);
            // Strip any path/query from NEXT_PUBLIC_API_URL.
            u.pathname = '';
            u.search = '';
            u.hash = '';

            // Local dev convenience: if not explicitly set, assume FastAPI runs on 8002.
            if (!explicitWsBase) {
                const isLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
                if (isLocal && (u.port === '3001' || u.port === '3000' || u.port === '')) {
                    u.port = '8002';
                }
            }

            u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
            const origin = u.toString().replace(/\/$/, '');
            return `${origin}/ai-interview/sessions/${sessionId}/stream`;
        } catch {
            const url = base.replace(/^http/, 'ws').replace(/\/$/, '');
            return `${url}/ai-interview/sessions/${sessionId}/stream`;
        }
    }, [sessionId]);

    useEffect(() => {
        if (!wsUrl) return;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => {
            setConnected(true);
            setQueue([]);
            setTerminated(null);
        };
        ws.onclose = () => setConnected(false);
        ws.onmessage = (evt) => {
            try {
                const data = JSON.parse(evt.data) as AiEvent;
                if (data.event === 'question.ask') setLastQuestion(data.payload?.question || null);
                if (data.event === 'score.update') setScores((prev) => [...prev, data.payload]);
                if (data.event === 'moderation.warning') {
                    const lvl = Number(data.payload?.warning_level);
                    if (Number.isFinite(lvl) && lvl > 0) {
                        setWarnings(Math.min(3, lvl));
                    } else {
                        setWarnings((prev) => Math.min(3, prev + 1));
                    }
                }
                if (data.event === 'session.terminated') {
                    setTerminated({ reason: data.payload?.reason });
                }
            } catch (err) {
                console.warn('WS parse error', err);
            }
        };
        return () => {
            ws.close();
        };
    }, [wsUrl]);

    const sendTranscript = (transcript: string, signals?: Record<string, any>, token?: string) => {
        const payload = { transcript, signals, token };
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setQueue((prev) => [...prev, payload]);
            return;
        }
        wsRef.current.send(JSON.stringify(payload));
    };

    useEffect(() => {
        if (!connected || !wsRef.current) return;
        if (queue.length) {
            queue.forEach((payload) => wsRef.current?.send(JSON.stringify(payload)));
            setQueue([]);
        }
    }, [connected, queue.length]);

    const sendStart = (payload?: Record<string, any>, token?: string) => {
        sendTranscript('[SESSION_START]', payload || {}, token);
    };

    const sendEnd = (payload?: Record<string, any>, token?: string) => {
        sendTranscript('[SESSION_END]', payload || {}, token);
    };

    return { connected, lastQuestion, warnings, scores, terminated, sendTranscript, sendStart, sendEnd };
};
