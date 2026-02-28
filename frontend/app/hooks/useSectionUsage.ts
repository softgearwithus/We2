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
import { getActiveUserId } from '@/app/lib/auth-storage';

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
    const [status, setStatus] = useState<UsageStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const enabled = options?.enabled ?? true;
    const isFreePlan = (user?.subscriptionPlan || 'free') === 'free';
    const storedUserId = typeof window !== 'undefined' ? getActiveUserId() : null;
    const effectiveUserId = user?.id || storedUserId;

    const clearHeartbeat = () => {
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
        }
    };

    const startHeartbeat = (intervalMs = DEFAULT_HEARTBEAT_MS) => {
        clearHeartbeat();
        heartbeatRef.current = setInterval(async () => {
            try {
                const nextState = await heartbeatSectionUsage(sectionKey, effectiveUserId);
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
        let active = true;

        if (!isFreePlan) {
            setState({
                remainingSeconds: Infinity,
                usedSeconds: 0,
                limitSeconds: Infinity,
                isLimited: false,
                lastResetAt: null,
            });
            setStatus('active');
            setError(null);
            stopSectionUsage(sectionKey, effectiveUserId).catch(() => undefined);
            return () => {
                clearHeartbeat();
            };
        }

        const init = async () => {
            setStatus('loading');
            setError(null);

            try {
                const baseState = await fetchSectionUsage(sectionKey, effectiveUserId);
                if (!active) return;
                setState(baseState);
                if (baseState.isLimited) {
                    setStatus('limited');
                    clearHeartbeat();
                    return;
                }
                const nextState = await startSectionUsage(sectionKey, effectiveUserId);
                if (!active) return;
                setState(nextState);
                setStatus(nextState.isLimited ? 'limited' : 'active');
                if (!nextState.isLimited) {
                    const intervalMs = Number(process.env.NEXT_PUBLIC_USAGE_HEARTBEAT_MS || `${DEFAULT_HEARTBEAT_MS}`);
                    const safeInterval = Number.isFinite(intervalMs) ? intervalMs : DEFAULT_HEARTBEAT_MS;
                    startHeartbeat(safeInterval);
                } else {
                    clearHeartbeat();
                }
            } catch (err: any) {
                if (!active) return;
                const nextState = await fetchSectionUsage(sectionKey, effectiveUserId).catch(() => null);
                if (nextState) {
                    setState(nextState);
                    if (nextState.isLimited) {
                        setStatus('limited');
                        clearHeartbeat();
                        return;
                    }
                    setStatus('active');
                    const intervalMs = Number(process.env.NEXT_PUBLIC_USAGE_HEARTBEAT_MS || `${DEFAULT_HEARTBEAT_MS}`);
                    const safeInterval = Number.isFinite(intervalMs) ? intervalMs : DEFAULT_HEARTBEAT_MS;
                    startHeartbeat(safeInterval);
                    return;
                }
                setError(err?.message || 'Usage unavailable');
                setStatus('error');
            }
        };

        init();

        return () => {
            active = false;
            clearHeartbeat();
            stopSectionUsage(sectionKey, effectiveUserId).catch(() => undefined);
        };
    }, [enabled, sectionKey, effectiveUserId, isFreePlan]);

    const refresh = async () => {
        try {
            const nextState = await fetchSectionUsage(sectionKey, effectiveUserId);
            setState(nextState);
            setStatus(nextState.isLimited ? 'limited' : 'active');
        } catch (err: any) {
            setError(err?.message || 'Usage unavailable');
            setStatus('error');
        }
    };

    const remainingLabel = state
        ? formatSeconds(state.remainingSeconds)
        : '—';

    return {
        state,
        status,
        error,
        remainingLabel,
        isLimited: state?.isLimited ?? false,
        isFreePlan,
        refresh,
    };
}
