import API_BASE_URL from './api-config';

export type SectionUsageState = {
    remainingSeconds: number;
    usedSeconds: number;
    limitSeconds: number;
    isLimited: boolean;
    lastResetAt: string | null;
};

export const fetchSectionUsage = async (token: string, sectionKey: string): Promise<SectionUsageState> => {
    const response = await fetch(`${API_BASE_URL}/usage/sections/${sectionKey}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch usage');
    return response.json();
};

export const startSectionUsage = async (token: string, sectionKey: string): Promise<SectionUsageState> => {
    const response = await fetch(`${API_BASE_URL}/usage/sections/${sectionKey}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to start usage');
    return response.json();
};

export const heartbeatSectionUsage = async (token: string, sectionKey: string): Promise<SectionUsageState> => {
    const response = await fetch(`${API_BASE_URL}/usage/sections/${sectionKey}/heartbeat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to update usage');
    return response.json();
};

export const stopSectionUsage = async (token: string, sectionKey: string): Promise<SectionUsageState> => {
    const response = await fetch(`${API_BASE_URL}/usage/sections/${sectionKey}/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to stop usage');
    return response.json();
};
