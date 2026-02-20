import API_BASE_URL from '@/app/lib/api-config';
import {
    type DepartmentStats,
    type PlacementMetrics,
    type Student,
} from './types';
import {
    getDepartmentStats,
    getPlacementMetrics,
    mockStudents,
} from './mockData';

const defaultStudents = mockStudents;

type StudentQuery = {
    query?: string;
    department?: string | null;
    year?: number | null;
    status?: string | null;
    page?: number;
    limit?: number;
};

const normalizeQuery = (value?: string | null) => (value ?? '').trim().toLowerCase();

const matchesQuery = (student: Student, query: string) => {
    if (!query) return true;
    const name = student.name.toLowerCase();
    const id = student.id.toLowerCase();
    return name.includes(query) || id.includes(query);
};

const applyFilters = (students: Student[], filters: StudentQuery) => {
    const query = normalizeQuery(filters.query);
    return students.filter((student) => {
        if (!matchesQuery(student, query)) return false;
        if (filters.department && student.department !== filters.department) return false;
        if (filters.year && student.year !== filters.year) return false;
        if (filters.status && student.status !== filters.status) return false;
        return true;
    });
};

const paginate = (students: Student[], page: number, limit: number) => {
    const safePage = Math.max(0, page);
    const safeLimit = Math.max(1, limit);
    const start = safePage * safeLimit;
    const end = start + safeLimit;
    return students.slice(start, end);
};

const safeFetch = async <T,>(url: string): Promise<T | null> => {
    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        return null;
    }
};

export const fetchInstituteDashboard = async (): Promise<{
    students: Student[];
    totalStudents: number;
    placedStudents: number;
    placementRate: number;
    topStudents: Student[];
    departmentStats: DepartmentStats[];
}> => {
    const data = await safeFetch<any>(`${API_BASE_URL}/institute/dashboard`);
    const students: Student[] = Array.isArray(data?.students)
        ? (data.students as Student[])
        : defaultStudents;
    const totalStudents = data?.totalStudents ?? students.length;
    const placedStudents = data?.placedStudents ?? students.filter((s) => s.status === 'Placed').length;
    const placementRate = data?.placementRate ?? (totalStudents ? Math.round((placedStudents / totalStudents) * 1000) / 10 : 0);
    const topStudents: Student[] = Array.isArray(data?.topStudents)
        ? (data.topStudents as Student[])
        : [...students].sort((a, b) => b.placementReadiness - a.placementReadiness).slice(0, 3);
    const departmentStats: DepartmentStats[] = Array.isArray(data?.departmentStats)
        ? (data.departmentStats as DepartmentStats[])
        : getDepartmentStats(students);

    return {
        students,
        totalStudents,
        placedStudents,
        placementRate,
        topStudents,
        departmentStats,
    };
};

export const fetchPlacementMetrics = async (): Promise<PlacementMetrics> => {
    const data = await safeFetch<PlacementMetrics>(`${API_BASE_URL}/institute/placements/metrics`);
    if (data) return data;
    return getPlacementMetrics(defaultStudents);
};

export const fetchInstituteStudents = async (filters: StudentQuery = {}): Promise<{
    data: Student[];
    total: number;
    page: number;
    pageSize: number;
}> => {
    const { page = 0, limit = 25 } = filters;
    const data = await safeFetch<any>(`${API_BASE_URL}/institute/students`);
    const students = Array.isArray(data?.data) ? data.data : defaultStudents;
    const filtered = applyFilters(students, filters);
    const total = filtered.length;
    const pageSize = limit;
    const pageData = paginate(filtered, page, pageSize);

    return {
        data: pageData,
        total,
        page,
        pageSize,
    };
};
