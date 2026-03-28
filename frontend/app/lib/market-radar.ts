import { fetchApi } from '../lib/apiClient';

import API_BASE_URL from './api-config';
import { MarketRadarPayload } from './market-data';

export type MarketRadarResponse = {
    id: string;
    payload: MarketRadarPayload;
    publishedBy: string | null;
    publishedAt: string | null;
    updatedAt?: string | null;
};

export const fetchMarketRadar = async (token: string): Promise<MarketRadarResponse> => {
    const response = await fetchApi(`${API_BASE_URL}/market-radar`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Market radar data not found');
    return response.json();
};

export const fetchAdminMarketRadar = async (token: string): Promise<MarketRadarResponse> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/market-radar`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Market radar data not found');
    return response.json();
};

export const publishMarketRadar = async (token: string, payload: MarketRadarPayload): Promise<MarketRadarResponse> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/market-radar`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload }),
    });
    if (!response.ok) throw new Error('Failed to publish market radar data');
    return response.json();
};
