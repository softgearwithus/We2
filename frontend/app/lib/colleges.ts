import API_BASE_URL from './api-config';

export type CollegePayload = {
    name: string;
    code: string;
    location?: string;
    type?: string;
    years: string[];
    departments: string[];
    adminEmail?: string;
};

export const fetchColleges = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch colleges');
    return response.json();
};

export const createCollege = async (token: string, payload: CollegePayload) => {
    const response = await fetch(`${API_BASE_URL}/colleges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create college');
    return response.json();
};

export const updateCollege = async (token: string, id: string, payload: Partial<CollegePayload>) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update college');
    return response.json();
};

export const fetchCollegeById = async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch college');
    return response.json();
};

export const deleteCollege = async (token: string, id: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete college');
    return response.json();
};

export const fetchCollegeStaff = async (token: string, collegeId: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${collegeId}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch staff');
    return response.json();
};

export const createCollegeStaff = async (token: string, collegeId: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${collegeId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to add staff');
    return response.json();
};

export const deleteCollegeStaff = async (token: string, collegeId: string, staffId: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${collegeId}/staff/${staffId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to remove staff');
    return response.json();
};

export const fetchCollegeCohorts = async (token: string, collegeId: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${collegeId}/cohorts`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch cohorts');
    return response.json();
};

export const createCollegeCohort = async (token: string, collegeId: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${collegeId}/cohorts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create cohort');
    return response.json();
};

export const exportCollegeCohort = async (token: string, collegeId: string, cohortId: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${collegeId}/cohorts/${cohortId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to export cohort');
    return response;
};

export const deleteCollegeCohort = async (token: string, collegeId: string, cohortId: string) => {
    const response = await fetch(`${API_BASE_URL}/colleges/${collegeId}/cohorts/${cohortId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete cohort');
    return response.json();
};
