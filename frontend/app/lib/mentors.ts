import API_BASE_URL from './api-config';

export type MentorProfile = {
    id: string;
    userId?: string;
    name: string;
    headline: string | null;
    companies: string | null;
    experience: string | null;
    about: string | null;
    pricePerMinute: number;
    tags: string[] | null;
    avatarUrl: string | null;
    rating: number;
    sessionsCount: number;
    isActive: boolean;
};

export type MentorSession = {
    id: string;
    studentId: string;
    mentorId: string;
    topic: string;
    durationMinutes: number;
    priceInr: number;
    status: 'requested' | 'accepted' | 'declined' | 'completed';
    meetingLink: string | null;
    createdAt: string;
    updatedAt?: string | null;
    mentorName?: string | null;
    avatarUrl?: string | null;
    studentName?: string | null;
    requestedAt?: string | null;
    scheduledAt?: string | null;
    date?: string | null;
};

export type MentorPayout = {
    id: string;
    mentorId: string;
    amountInr: number;
    referenceId: string | null;
    status: 'Paid' | 'Pending';
    paidAt: string | null;
    createdAt: string;
};

export type MentorApplicationPayload = {
    name: string;
    email: string;
    phone: string;
    headline?: string;
    bio?: string;
    feePerMinuteInr: number;
    expertise?: string;
    offerings?: string;
    linkedin?: string;
    totalExperience?: string;
};

export const fetchMentors = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch mentors');
    return res.json();
};

export const fetchStudentMentorSessions = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/mentor-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch mentor sessions');
    return res.json();
};

export const createMentorPaymentOrder = async (token: string, payload: { mentorId: string; durationMinutes: number }) => {
    const res = await fetch(`${API_BASE_URL}/mentor-payments/order`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create payment order');
    return res.json();
};

export const verifyMentorPayment = async (token: string, payload: any) => {
    const res = await fetch(`${API_BASE_URL}/mentor-payments/verify`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to verify payment');
    return res.json();
};

export const submitMentorApplication = async (payload: MentorApplicationPayload) => {
    const res = await fetch(`${API_BASE_URL}/mentor-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit mentor application');
    return res.json();
};

export const fetchMentorRequests = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/mentor/requests`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch mentor requests');
    return res.json();
};

export const acceptMentorRequest = async (token: string, sessionId: string, meetingLink: string) => {
    const res = await fetch(`${API_BASE_URL}/mentor/requests/${sessionId}/accept`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingLink }),
    });
    if (!res.ok) throw new Error('Failed to accept request');
    return res.json();
};

export const declineMentorRequest = async (token: string, sessionId: string) => {
    const res = await fetch(`${API_BASE_URL}/mentor/requests/${sessionId}/decline`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to decline request');
    return res.json();
};

export const fetchMentorSessions = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/mentor/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch mentor sessions');
    return res.json();
};

export const fetchMentorPayouts = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/mentor/payouts`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch mentor payouts');
    return res.json();
};

export const fetchAdminMentors = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch mentors');
    return res.json();
};

export const fetchAdminMentorApplications = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentor-applications`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch mentor applications');
    return res.json();
};

export const approveMentorApplication = async (token: string, id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentor-applications/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to approve mentor');
    return res.json();
};

export const rejectMentorApplication = async (token: string, id: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentor-applications/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to reject mentor');
    return res.json();
};

export const toggleMentorStatus = async (token: string, id: string, isActive: boolean) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentors/${id}/status`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error('Failed to update mentor status');
    return res.json();
};

export const fetchAdminMentorPayouts = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentor-payouts`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch payouts');
    return res.json();
};

export const createAdminMentorPayout = async (token: string, payload: { mentorId: string; amountInr: number; referenceId: string }) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentor-payouts`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log payout');
    return res.json();
};

export const fetchAdminMentorSessions = async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/mentor-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
};
