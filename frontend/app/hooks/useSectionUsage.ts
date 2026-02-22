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

const formatSeconds = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds === Infinity) return 'Unlimited';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
};

export function useSectionUsage(sectionKey: string, options?: { enabled?: boolean }) {
    const { user } = useAuth();
    const [state, setState] = useState<SectionUsageState | null>(null);
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

    const startHeartbeat = () => {
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
        }, 60000);
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
                const nextState = await startSectionUsage(token, sectionKey);
                if (!active) return;
                setState(nextState);
                setStatus(nextState.isLimited ? 'limited' : 'active');
                if (!nextState.isLimited) {
                    startHeartbeat();
                }
            } catch (err: any) {
                if (!active) return;
                setError(err?.message || 'Usage unavailable');
                setStatus('error');
            }
        };

        init();

        return () => {
            active = false;
            clearHeartbeat();
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
            setStatus(nextState.isLimited ? 'limited' : 'active');
        } catch (err: any) {
            setError(err?.message || 'Usage unavailable');
            setStatus('error');
        }
    };

    const remainingLabel = state ? formatSeconds(state.remainingSeconds) : '—';

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
