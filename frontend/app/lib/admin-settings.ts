import { fetchApi } from '../lib/apiClient';

import API_BASE_URL from './api-config';

export type UpdateFlag = { href: string; enabled: boolean };

export const fetchAdminUpdateFlags = async (token: string): Promise<UpdateFlag[]> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/updates`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch update flags');
    return response.json();
};

export const saveAdminUpdateFlags = async (token: string, flags: UpdateFlag[]) => {
    const response = await fetchApi(`${API_BASE_URL}/admin/updates`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flags }),
    });
    if (!response.ok) throw new Error('Failed to save update flags');
    return response.json();
};

export const fetchPublicUpdateFlags = async (): Promise<UpdateFlag[]> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/public/updates`);
    if (!response.ok) throw new Error('Failed to fetch public update flags');
    return response.json();
};

export type PublicPlatformSettings = PlatformSettings;

export const fetchPublicPlatformSettings = async (): Promise<PublicPlatformSettings> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/public/settings`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch public platform settings');
    return response.json();
};

export type PlatformSettings = {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    supportEmail: string;
    maxUploadSizeMB: number;
    upgradesEnabled?: boolean;
    subscriptionPrices?: {
        pro?: {
            '1m'?: number;
        };
        display?: {
            proMonthlyUsd?: number;
        };
        [key: string]: any;
    };
    freeTierLimitMinutes?: number;
    freeTierResetAt?: string | null;
};

export const fetchPlatformSettings = async (token: string): Promise<PlatformSettings> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/settings/platform`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch platform settings');
    return response.json();
};

export const updatePlatformSettings = async (token: string, payload: PlatformSettings) => {
    const response = await fetchApi(`${API_BASE_URL}/admin/settings/platform`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update platform settings');
    return response.json();
};

export const refreshFreeTier = async (token: string) => {
    const response = await fetchApi(`${API_BASE_URL}/admin/settings/platform/free-tier-refresh`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to refresh free tier');
    return response.json();
};

export type AdminProfilePayload = {
    fullName: string;
    email: string;
    timezone: string;
    avatarUrl: string;
};

export const updateAdminProfile = async (token: string, payload: AdminProfilePayload) => {
    const response = await fetchApi(`${API_BASE_URL}/admin/settings/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update profile settings');
    return response.json();
};

export type AdminSecurityPayload = {
    currentPassword?: string;
    newPassword?: string;
    twoFactorEnabled?: boolean;
};

export const updateAdminSecurity = async (token: string, payload: AdminSecurityPayload) => {
    const response = await fetchApi(`${API_BASE_URL}/admin/settings/security`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update security settings');
    return response.json();
};
