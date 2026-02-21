import API_BASE_URL from './api-config';

export type InstituteStudent = {
    id: string;
    name: string;
    department: string;
    year: number;
    cgpa: number;
    attendance: number;
    placementReadiness: number;
    skills: {
        coding: number;
        aptitude: number;
        communication: number;
        core: number;
    };
    status: string;
};

export const fetchInstituteDashboard = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/institute/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch institute dashboard');
    return response.json();
};

export const fetchInstituteStudents = async (
    token: string,
    params: { year?: number; department?: string; status?: string; search?: string },
) => {
    const query = new URLSearchParams();
    if (params.year) query.set('year', String(params.year));
    if (params.department) query.set('department', params.department);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    const response = await fetch(`${API_BASE_URL}/institute/students?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch institute students');
    return response.json();
};

export const fetchInstitutePlacements = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/institute/placements`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch institute placements');
    return response.json();
};

export const fetchInstituteSkills = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/institute/skills`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch institute skills');
    return response.json();
};

export const fetchInstituteReports = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/institute/reports`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch institute reports');
    return response.json();
};
