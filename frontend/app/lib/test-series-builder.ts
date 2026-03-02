export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchCompaniesList(token: string, isAdmin = false) {
    const route = isAdmin ? 'admin/companies' : 'student/companies';
    const res = await fetch(`${API_BASE}/test-series/${route}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch companies');
    return res.json();
}

export async function createCompany(token: string, payload: any) {
    const res = await fetch(`${API_BASE}/test-series/admin/companies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create company');
    return res.json();
}

export async function updateCompany(token: string, id: string, payload: any) {
    const res = await fetch(`${API_BASE}/test-series/admin/companies/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update company');
    return res.json();
}

export async function deleteCompany(token: string, id: string) {
    const res = await fetch(`${API_BASE}/test-series/admin/companies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete company');
    return res.json();
}

export async function fetchCompanyHierarchy(token: string, id: string) {
    const res = await fetch(`${API_BASE}/test-series/student/companies/${id}/hierarchy`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch hierarchy');
    return res.json();
}

export async function createMockTest(token: string, payload: any) {
    const res = await fetch(`${API_BASE}/test-series/admin/mock-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create mock test');
    return res.json();
}

export async function updateMockTest(token: string, id: string, payload: any) {
    const res = await fetch(`${API_BASE}/test-series/admin/mock-tests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update mock test');
    return res.json();
}

export async function deleteMockTest(token: string, id: string) {
    const res = await fetch(`${API_BASE}/test-series/admin/mock-tests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete mock test');
    return res.json();
}

export async function createSection(token: string, payload: any) {
    const res = await fetch(`${API_BASE}/test-series/admin/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create section');
    return res.json();
}

export async function updateSection(token: string, id: string, payload: any) {
    const res = await fetch(`${API_BASE}/test-series/admin/sections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update section');
    return res.json();
}

export async function deleteSection(token: string, id: string) {
    const res = await fetch(`${API_BASE}/test-series/admin/sections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete section');
    return res.json();
}

export async function importBulkQuestions(token: string, sectionId: string, questions: any[]) {
    const res = await fetch(`${API_BASE}/test-series/admin/sections/${sectionId}/bulk-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questions })
    });
    if (!res.ok) throw new Error('Failed to import bulk questions');
    return res.json();
}

export async function addQuestion(token: string, sectionId: string, question: any) {
    const res = await fetch(`${API_BASE}/test-series/admin/sections/${sectionId}/bulk-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // Using existing bulk endpoint to just push 1 question
        body: JSON.stringify({ questions: [question] })
    });
    if (!res.ok) throw new Error('Failed to add question');
    return res.json();
}

export async function fetchMockTestFull(token: string, id: string) {
    const res = await fetch(`${API_BASE}/test-series/student/mock-tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch mock test details');
    return res.json();
}

export async function fetchStudentResults(token: string) {
    const res = await fetch(`${API_BASE}/test-series/student/results`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
}

export async function submitMockTest(token: string, id: string, payload: {
    startTime: string | Date,
    endTime: string | Date,
    responses: { questionId: string, responseValue: string, timeSpentSeconds: number }[]
}) {
    const res = await fetch(`${API_BASE}/test-series/student/mock-tests/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit test');
    return res.json();
}
