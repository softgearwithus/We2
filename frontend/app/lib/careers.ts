import { fetchApi } from '../lib/apiClient';

export interface Career {
    id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    experience?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCareerData {
    title: string;
    description: string;
    location: string;
    type: string;
    experience?: string;
    isActive?: boolean;
}

export interface UpdateCareerData extends Partial<CreateCareerData> { }

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCareersAdmin(token: string): Promise<Career[]> {
    const res = await fetchApi(`${API_URL}/careers`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch careers');
    }

    return res.json();
}

export async function getCareerById(id: string): Promise<Career> {
    const res = await fetchApi(`${API_URL}/careers/${id}`);

    if (!res.ok) {
        throw new Error(`Failed to fetch career with ID: ${id}`);
    }

    return res.json();
}

export async function createCareer(token: string, data: CreateCareerData): Promise<Career> {
    const res = await fetchApi(`${API_URL}/careers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create career');
    }

    return res.json();
}

export async function updateCareer(token: string, id: string, data: UpdateCareerData): Promise<Career> {
    const res = await fetchApi(`${API_URL}/careers/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update career');
    }

    return res.json();
}

export async function deleteCareer(token: string, id: string): Promise<void> {
    const res = await fetchApi(`${API_URL}/careers/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete career');
    }
}
