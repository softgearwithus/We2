'use client';

import { useEffect, useRef, useState } from 'react';
import {
    fetchSectionUsage,
    heartbeatSectionUsage,
    SectionUsageState,
    startSectionUsage,
    stopSectionUsage,
} from '@/app/lib/section-usage';
import { useAuth } from '@/app/context/AuthContext';

type UsageStatus = 'idle' | 'loading' | 'active' | 'limited' | 'error';
const DEFAULT_HEARTBEAT_MS = 1000;

const formatSeconds = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds === Infinity) return 'Unlimited';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
};

export function useSectionUsage(sectionKey: string, options?: { enabled?: boolean }) {
    const { user } = useAuth();
    const [state, setState] = useState<SectionUsageState | null>(null);
    const [displayRemaining, setDisplayRemaining] = useState<number | null>(null);
    const displayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [status, setStatus] = useState<UsageStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const tokenRef = useRef<string | null>(null);
    const enabled = options?.enabled ?? true;

    const clearHeartbeat = () => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    };

    const clearDisplayTimer = () => {
        if (displayTimerRef.current) {
            clearInterval(displayTimerRef.current);
            displayTimerRef.current = null;
        }
    };

    const startDisplayTimer = (initialSeconds: number) => {
        clearDisplayTimer();
        setDisplayRemaining(initialSeconds);
        if (!Number.isFinite(initialSeconds) || initialSeconds === Infinity) {
            return;
        }
        displayTimerRef.current = setInterval(() => {
            setDisplayRemaining((prev) => {
                if (prev === null) return prev;
                if (prev <= 0) {
                    clearDisplayTimer();
                    clearHeartbeat();
                    setStatus('limited');
                    setState(s => s ? { ...s, remainingSeconds: 0, isLimited: true } : null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startHeartbeat = (intervalMs = DEFAULT_HEARTBEAT_MS) => {
        clearHeartbeat();
        heartbeatRef.current = setInterval(async () => {
            const token = tokenRef.current;
            if (!token) return;
            try {
                const nextState = await heartbeatSectionUsage(token, sectionKey);
                setState(nextState);
                if (nextState.isLimited) {
                    setStatus('limited');
                    clearHeartbeat();
                }
            } catch (err: any) {
                setError(err?.message || 'Usage update failed');
                setStatus('error');
            }
        }, intervalMs);
    };

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('accessToken');
        tokenRef.current = token;
        if (!token) return;

        let active = true;
        setStatus('loading');
        setError(null);

        const init = async () => {
            try {
                const baseState = await fetchSectionUsage(token, sectionKey);
                if (!active) return;
                setState(baseState);
                setDisplayRemaining(baseState.remainingSeconds);
                if (Number.isFinite(baseState.remainingSeconds)) {
                    startDisplayTimer(baseState.remainingSeconds);
                }
                if (baseState.isLimited) {
                    setStatus('limited');
                    clearHeartbeat();
                    clearDisplayTimer();
                    setDisplayRemaining(baseState.remainingSeconds);
                    return;
                }
                const nextState = await startSectionUsage(token, sectionKey);
                if (!active) return;
                setState(nextState);
                setDisplayRemaining(nextState.remainingSeconds);
                setStatus(nextState.isLimited ? 'limited' : 'active');
                if (!nextState.isLimited) {
                    if (Number.isFinite(nextState.remainingSeconds)) {
                        startDisplayTimer(nextState.remainingSeconds);
                    }
                    const intervalMs = Number(process.env.NEXT_PUBLIC_USAGE_HEARTBEAT_MS || `${DEFAULT_HEARTBEAT_MS}`);
                    const safeInterval = Number.isFinite(intervalMs) ? intervalMs : DEFAULT_HEARTBEAT_MS;
                    startHeartbeat(safeInterval);
                } else {
                    clearHeartbeat();
                    clearDisplayTimer();
                    setDisplayRemaining(nextState.remainingSeconds);
                }
            } catch (err: any) {
                if (!active) return;
                const nextState = await fetchSectionUsage(token, sectionKey).catch(() => null);
                if (nextState) {
                    setState(nextState);
                    setDisplayRemaining(nextState.remainingSeconds);
                    if (nextState.isLimited) {
                        setStatus('limited');
                        clearHeartbeat();
                        clearDisplayTimer();
                        return;
                    }
                    setStatus('active');
                    const intervalMs = Number(process.env.NEXT_PUBLIC_USAGE_HEARTBEAT_MS || `${DEFAULT_HEARTBEAT_MS}`);
                    const safeInterval = Number.isFinite(intervalMs) ? intervalMs : DEFAULT_HEARTBEAT_MS;
                    startHeartbeat(safeInterval);
                    return;
                }
                clearDisplayTimer();
                setError(err?.message || 'Usage unavailable');
                setStatus('error');
            }
        };

        init();

        return () => {
            active = false;
            clearHeartbeat();
            clearDisplayTimer();
            if (token) {
                stopSectionUsage(token, sectionKey).catch(() => undefined);
            }
        };
    }, [enabled, sectionKey]);

    const refresh = async () => {
        const token = tokenRef.current;
        if (!token) return;
        try {
            const nextState = await fetchSectionUsage(token, sectionKey);
            setState(nextState);
            setDisplayRemaining(nextState.remainingSeconds);
            if (Number.isFinite(nextState.remainingSeconds)) {
                startDisplayTimer(nextState.remainingSeconds);
            }
            setStatus(nextState.isLimited ? 'limited' : 'active');
        } catch (err: any) {
            setError(err?.message || 'Usage unavailable');
            setStatus('error');
        }
    };

    const remainingLabel = state
        ? formatSeconds(displayRemaining ?? state.remainingSeconds)
        : '—';

    return {
        state,
        status,
        error,
        remainingLabel,
        isLimited: state?.isLimited ?? false,
        isFreePlan: (user?.subscriptionPlan || 'free') === 'free',
        refresh,
    };
}
