import API_BASE_URL from './api-config';

export const fetchAdminOverview = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch admin overview');
    return response.json();
};

export const fetchAdminAnalytics = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch admin analytics');
    return response.json();
};
