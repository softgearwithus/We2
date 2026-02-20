import type { Student, DepartmentStats, PlacementMetrics } from './types';

// Helpers
const DEPARTMENTS = ['Computer Science', 'Mechanical', 'Electronics', 'Civil'] as const;
const FIRST_NAMES = [
    'Aarav', 'Aditi', 'Ananya', 'Arjun', 'Dev',
    'Diya', 'Ishaan', 'Kavya', 'Meera', 'Neha',
    'Nikhil', 'Priya', 'Rahul', 'Riya', 'Rohan',
    'Sanya', 'Sneha', 'Tanvi', 'Varun', 'Yash'
];
const LAST_NAMES = [
    'Sharma', 'Patel', 'Gupta', 'Kumar', 'Reddy',
    'Mehta', 'Iyer', 'Singh', 'Bose', 'Kapoor',
    'Jain', 'Verma', 'Das', 'Nair', 'Joshi',
    'Chopra', 'Rao', 'Saxena', 'Malhotra', 'Menon'
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const toOneDecimal = (value: number) => Math.round(value * 10) / 10;

const buildName = (index: number) => {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
    return `${first} ${last}`;
};

const resolveStatus = (readiness: number, attendance: number): Student['status'] => {
    if (readiness >= 80) return 'Placed';
    if (readiness >= 65) return 'Looking';
    if (attendance < 65) return 'At Risk';
    return 'Higher Studies';
};

// Generator Functions
export const generateStudents = (count: number = 120): Student[] => {
    return Array.from({ length: count }).map((_, index) => {
        const seed = index + 1;
        const collegeId = `college_${(seed % 3) + 1}`;
        const attendance = clamp(60 + (seed * 7) % 41, 50, 100);
        const placementReadiness = clamp(32 + (seed * 11) % 67, 30, 98);
        const skills = {
            coding: clamp(30 + (seed * 9) % 66, 20, 95),
            aptitude: clamp(28 + (seed * 7) % 70, 30, 95),
            communication: clamp(35 + (seed * 5) % 56, 40, 90),
            core: clamp(30 + (seed * 6) % 61, 30, 90),
        };

        return {
            id: `stu_${seed.toString().padStart(4, '0')}`,
            name: buildName(index),
            department: DEPARTMENTS[seed % DEPARTMENTS.length],
            year: ((seed % 4) + 1) as Student['year'],
            cgpa: toOneDecimal(5.5 + (seed % 46) * 0.1),
            attendance,
            placementReadiness,
            skills,
            status: resolveStatus(placementReadiness, attendance),
            collegeId,
        };
    });
};

export const getDepartmentStats = (students: Student[]): DepartmentStats[] => {
    return DEPARTMENTS.map(dept => {
        const deptStudents = students.filter(s => s.department === dept);
        const count = deptStudents.length;
        if (count === 0) return { name: dept, studentCount: 0, avgAttendance: 0, avgReadiness: 0, placementRate: 0 };

        const avgAttendance = deptStudents.reduce((acc, s) => acc + s.attendance, 0) / count;
        const avgReadiness = deptStudents.reduce((acc, s) => acc + s.placementReadiness, 0) / count;
        const placedCount = deptStudents.filter(s => s.status === 'Placed').length;

        return {
            name: dept,
            studentCount: count,
            avgAttendance: parseFloat(avgAttendance.toFixed(1)),
            avgReadiness: parseFloat(avgReadiness.toFixed(1)),
            placementRate: parseFloat(((placedCount / count) * 100).toFixed(1)),
        };
    });
};

export const getPlacementMetrics = (students: Student[]): PlacementMetrics => {
    if (!students.length) {
        return { coding: 0, aptitude: 0, communication: 0, core: 0 };
    }
    const totals = students.reduce((acc, student) => {
        acc.coding += student.skills.coding;
        acc.aptitude += student.skills.aptitude;
        acc.communication += student.skills.communication;
        acc.core += student.skills.core;
        return acc;
    }, { coding: 0, aptitude: 0, communication: 0, core: 0 });

    return {
        coding: toOneDecimal(totals.coding / students.length),
        aptitude: toOneDecimal(totals.aptitude / students.length),
        communication: toOneDecimal(totals.communication / students.length),
        core: toOneDecimal(totals.core / students.length)
    };
};

// Initial Mock Data
export const mockStudents = generateStudents(120);
export const mockDepartmentStats = getDepartmentStats(mockStudents);
