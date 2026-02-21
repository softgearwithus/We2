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

export const fetchAdminOverview = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch admin overview');
    return response.json();
};

export const fetchAdminAnalytics = async (token: string): Promise<AnalyticsData> => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch admin analytics');
        return await response.json();
    } catch (error) {
        // Fallback to mock data for frontend demonstration until backend is ready
        console.warn('Backend unavailable. Using mock analytics data.');
        return {
            visitors: 12402,
            subscribers: 848,
            activeNow: 124,
            featureEngagement: [
                { name: 'Placement Preparation', time: '1,240h', percentage: 95, color: 'bg-indigo-500' },
                { name: 'DSA Training', time: '980h', percentage: 80, color: 'bg-blue-500' },
                { name: 'Test Series', time: '750h', percentage: 65, color: 'bg-emerald-500' },
                { name: 'AI Interview', time: '520h', percentage: 50, color: 'bg-rose-500' },
                { name: 'Project Labs', time: '410h', percentage: 40, color: 'bg-amber-500' },
                { name: 'SQL Training', time: '380h', percentage: 35, color: 'bg-cyan-500' },
                { name: 'Resume Builder', time: '290h', percentage: 30, color: 'bg-violet-500' },
                { name: 'Synapse (Intelligence)', time: '210h', percentage: 20, color: 'bg-orange-500' },
                { name: 'Dashboard Overview', time: '150h', percentage: 15, color: 'bg-slate-500' },
            ],
            funnels: [
                { stage: 'Platform Landing', count: '12.4k', percentage: 100 },
                { stage: 'Entered Placement Mode', count: '8.2k', percentage: 66 },
                { stage: 'Started Training', count: '4.1k', percentage: 33 },
                { stage: 'Subscribed to Pro', count: '848', percentage: 7 },
            ]
        };
    }
};

export interface Student {
    id: string;
    name: string;
    email: string;
    mobile: string;
    college: string;
    subscription: 'Free' | 'Standard (Monthly)' | 'Standard (Yearly)' | 'Pro (Monthly)' | 'Pro (Yearly)';
    avatarBase: string; // Used to generate DiceBear avatar
    joinedAt: string; // ISO date string
    status: 'active' | 'disabled';
}

export interface StudentsData {
    totalStudents: number;
    premiumUsers: number;
    newThisWeek: number;
    recentRegistrations: Pick<Student, 'id' | 'name' | 'college' | 'joinedAt' | 'avatarBase'>[];
    students: Student[];
}

export const fetchAdminStudents = async (token: string): Promise<StudentsData> => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/students`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch admin students');
        return await response.json();
    } catch (error) {
        // Fallback to mock data for frontend demonstration until backend is ready
        console.warn('Backend unavailable. Using mock students data.');

        const mockStudents: Student[] = [
            { id: 'usr_001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', mobile: '+91 9876543210', college: 'IIT Bombay', subscription: 'Pro (Yearly)', avatarBase: 'Aarav', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'active' },
            { id: 'usr_002', name: 'Priya Patel', email: 'priya.p@example.com', mobile: '+91 9876543211', college: 'BITS Pilani', subscription: 'Standard (Monthly)', avatarBase: 'Priya', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'active' },
            { id: 'usr_003', name: 'Rohan Gupta', email: 'rohan.g@test.com', mobile: '+91 9876543212', college: 'Independent Learner', subscription: 'Free', avatarBase: 'Rohan', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'active' },
            { id: 'usr_004', name: 'Ananya Singh', email: 'ananya.singh@university.edu', mobile: '+91 9876543213', college: 'VIT Vellore', subscription: 'Pro (Monthly)', avatarBase: 'Ananya', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'active' },
            { id: 'usr_005', name: 'Vikram Reddy', email: 'vikram.r@domain.com', mobile: '+91 9876543214', college: 'Independent Learner', subscription: 'Free', avatarBase: 'Vikram', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), status: 'active' },
            { id: 'usr_006', name: 'Neha Kumar', email: 'neha.k@test.in', mobile: '+91 9876543215', college: 'SRM Institute of Science and Technology', subscription: 'Standard (Yearly)', avatarBase: 'Neha', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), status: 'active' },
            { id: 'usr_007', name: 'Aditya Verma', email: 'aditya.v@example.org', mobile: '+91 9876543216', college: 'Independent Learner', subscription: 'Free', avatarBase: 'Aditya', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), status: 'active' },
            { id: 'usr_008', name: 'Kavya Desai', email: 'kavya.d@college.edu', mobile: '+91 9876543217', college: 'Manipal Institute of Technology', subscription: 'Pro (Yearly)', avatarBase: 'Kavya', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(), status: 'active' },
            { id: 'usr_009', name: 'Arjun Nair', email: 'arjun.n@test.com', mobile: '+91 9876543218', college: 'Independent Learner', subscription: 'Standard (Monthly)', avatarBase: 'Arjun', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), status: 'active' },
            { id: 'usr_010', name: 'Isha Joshi', email: 'isha.j@university.in', mobile: '+91 9876543219', college: 'Jadavpur University', subscription: 'Standard (Monthly)', avatarBase: 'Isha', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(), status: 'active' },
        ];

        return {
            totalStudents: 12402,
            premiumUsers: 848,
            newThisWeek: 312,
            recentRegistrations: mockStudents.slice(0, 5).map(s => ({ id: s.id, name: s.name, college: s.college, joinedAt: s.joinedAt, avatarBase: s.avatarBase })),
            students: mockStudents,
        };
    }
};
