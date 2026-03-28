import { fetchApi } from '../lib/apiClient';

import API_BASE_URL from './api-config';

export type ProjectLabComplexity = 'Beginner' | 'Intermediate' | 'Advanced';

export type ProjectLabTask = {
    id: string;
    title: string;
    status: string;
};

export type ProjectLabReadme = {
    problem: string;
    solution: string;
    features: string[];
    outcomes: string[];
};

export type ProjectLabResource = {
    title: string;
    url: string;
    type: 'docs' | 'design' | 'guide' | 'video';
};

export type ProjectLabDetails = {
    frontend?: string;
    backend?: string;
    database?: string;
    architecture?: string;
    prerequisites: string[];
    tools: string[];
    resources: ProjectLabResource[];
};

export type ProjectLab = {
    id: string;
    domainId: string;
    title: string;
    description: string;
    complexity: ProjectLabComplexity;
    estimatedTime: string;
    skills: string[] | null;
    tags: string[] | null;
    tasks: ProjectLabTask[] | null;
    readme: ProjectLabReadme | null;
    details: ProjectLabDetails | null;
    isActive: boolean;
};

export type ProjectLabDomainSummary = {
    domainId: string;
    count: number;
};

export type ProjectLabSubmission = {
    id: string;
    projectId: string;
    userId: string;
    repositoryUrl: string;
    liveDemoUrl: string | null;
    status: string;
    reviewNotes: string | null;
    submittedAt: string;
    reviewedAt: string | null;
    completedAt: string | null;
};

export type ProjectLabProgress = {
    submittedProjectIds: string[];
    completedProjectIds: string[];
};

export const fetchProjectLabDomains = async (): Promise<ProjectLabDomainSummary[]> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/domains`);
    if (!response.ok) throw new Error('Failed to fetch project lab domains');
    return response.json();
};

export const fetchProjectLabs = async (domainId?: string): Promise<ProjectLab[]> => {
    const url = domainId
        ? `${API_BASE_URL}/project-labs?domainId=${encodeURIComponent(domainId)}`
        : `${API_BASE_URL}/project-labs`;
    const response = await fetchApi(url);
    if (!response.ok) throw new Error('Failed to fetch project labs');
    return response.json();
};

export const fetchProjectLab = async (id: string): Promise<ProjectLab> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project lab');
    return response.json();
};

export const fetchProjectLabProgress = async (token: string): Promise<ProjectLabProgress> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/me/progress`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch project lab progress');
    return response.json();
};

export const fetchProjectLabSubmissions = async (token: string): Promise<ProjectLabSubmission[]> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/me/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch project lab submissions');
    return response.json();
};

export const submitProjectLab = async (
    token: string,
    projectId: string,
    payload: { repositoryUrl: string; liveDemoUrl?: string },
): Promise<ProjectLabSubmission> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/${projectId}/submissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to submit project lab');
    return response.json();
};

export const fetchProjectLabsAdmin = async (token: string): Promise<ProjectLab[]> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch project labs');
    return response.json();
};

export const createProjectLab = async (token: string, payload: Partial<ProjectLab>) => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create project lab');
    return response.json();
};

export const updateProjectLab = async (
    token: string,
    id: string,
    payload: Partial<ProjectLab>,
): Promise<ProjectLab> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update project lab');
    return response.json();
};

export const deleteProjectLab = async (token: string, id: string) => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete project lab');
    return response.json();
};

export const updateProjectLabSubmission = async (
    token: string,
    submissionId: string,
    payload: { status?: string; reviewNotes?: string },
): Promise<ProjectLabSubmission> => {
    const response = await fetchApi(`${API_BASE_URL}/project-labs/admin/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update project submission');
    return response.json();
};
