import { fetchApi } from '../lib/apiClient';

import API_BASE_URL from './api-config';

export interface FeatureEngagement {
    name: string;
    time: string;
    percentage: number;
    color: string;
}

export interface FunnelStage {
    stage: string;
    count: string;
    percentage: number;
}

export interface AnalyticsData {
    visitors: number;
    subscribers: number;
    activeNow: number;
    featureEngagement: FeatureEngagement[];
    funnels: FunnelStage[];
}

export const fetchAdminAnalytics = async (token: string, range?: string): Promise<AnalyticsData> => {
    const query = range ? `?range=${encodeURIComponent(range)}` : '';
    const response = await fetchApi(`${API_BASE_URL}/admin/analytics${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch admin analytics');
    return await response.json();
};

export interface Student {
    id: string;
    name: string;
    email: string;
    mobile: string;
    college: string;
    subscription: string;
    avatarBase: string; // Used to generate DiceBear avatar
    joinedAt: string; // ISO date string
    status: 'active' | 'disabled';
}

export interface StudentsData {
    totalStudents: number;
    premiumUsers: number;
    newThisWeek: number;
    students: Student[];
}

export interface SubscriptionPaymentRecord {
    id: string;
    userId: string;
    userEmail: string | null;
    userName: string | null;
    plan: string;
    amountInPaise: number;
    amount: number;
    currency: string;
    paymentId: string | null;
    orderId: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
}

export const fetchAdminStudents = async (token: string): Promise<StudentsData> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch admin students');
    return await response.json();
};

export const fetchAdminSubscriptionPayments = async (token: string, limit = 50): Promise<SubscriptionPaymentRecord[]> => {
    const response = await fetchApi(`${API_BASE_URL}/admin/subscriptions/payments?limit=${encodeURIComponent(String(limit))}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch subscription payments');
    return await response.json();
};
