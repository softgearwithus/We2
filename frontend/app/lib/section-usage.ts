export type SectionUsageState = {
    remainingSeconds: number;
    usedSeconds: number;
    limitSeconds: number;
    isLimited: boolean;
    lastResetAt: string | null;
};

import API_BASE_URL from './api-config';
import { getActiveToken } from './auth-storage';

const authHeaders = () => {
    const token = getActiveToken();
    if (!token) {
        throw new Error('Authentication required');
    }
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

const fetchUsage = async (endpoint: string): Promise<SectionUsageState> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: authHeaders(),
        cache: 'no-store',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Usage request failed');
    }
    return response.json();
};

export const fetchSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    if (typeof window === 'undefined' || !userId) {
        return {
            remainingSeconds: 0,
            usedSeconds: 0,
            limitSeconds: 0,
            isLimited: false,
            lastResetAt: null,
        };
    }
    const ts = Date.now();
    const response = await fetch(`${API_BASE_URL}/usage/sections/${sectionKey}?t=${ts}`, {
        method: 'GET',
        headers: {
            Authorization: authHeaders().Authorization,
        },
        cache: 'no-store',
    });
    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Unable to fetch usage');
    }
    return response.json();
};

export const startSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    if (typeof window === 'undefined' || !userId) {
        return fetchSectionUsage(sectionKey, userId);
    }
    return fetchUsage(`/usage/sections/${sectionKey}/start`);
};

export const heartbeatSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    if (typeof window === 'undefined' || !userId) {
        return fetchSectionUsage(sectionKey, userId);
    }
    return fetchUsage(`/usage/sections/${sectionKey}/heartbeat`);
};

export const stopSectionUsage = async (sectionKey: string, userId?: string | null): Promise<SectionUsageState> => {
    if (typeof window === 'undefined' || !userId) {
        return fetchSectionUsage(sectionKey, userId);
    }
    return fetchUsage(`/usage/sections/${sectionKey}/stop`);
};
