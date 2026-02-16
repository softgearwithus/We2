import { faker } from '@faker-js/faker';

// Types
export interface Student {
    id: string;
    name: string;
    department: 'Computer Science' | 'Mechanical' | 'Electronics' | 'Civil';
    year: 1 | 2 | 3 | 4;
    cgpa: number;
    attendance: number;
    placementReadiness: number; // 0-100
    skills: {
        coding: number;
        aptitude: number;
        communication: number;
        core: number;
    };
    status: 'Placed' | 'Looking' | 'Higher Studies' | 'At Risk';
}

export interface DepartmentStats {
    name: string;
    studentCount: number;
    avgAttendance: number;
    avgReadiness: number;
    placementRate: number;
}

// Helpers
const DEPARTMENTS = ['Computer Science', 'Mechanical', 'Electronics', 'Civil'] as const;

// Generator Functions
export const generateStudents = (count: number = 100): Student[] => {
    return Array.from({ length: count }).map(() => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        department: faker.helpers.arrayElement(DEPARTMENTS),
        year: faker.helpers.arrayElement([1, 2, 3, 4]),
        cgpa: faker.number.float({ min: 5, max: 10, fractionDigits: 1 }),
        attendance: faker.number.int({ min: 50, max: 100 }),
        placementReadiness: faker.number.int({ min: 30, max: 98 }),
        skills: {
            coding: faker.number.int({ min: 20, max: 95 }),
            aptitude: faker.number.int({ min: 30, max: 95 }),
            communication: faker.number.int({ min: 40, max: 90 }),
            core: faker.number.int({ min: 30, max: 90 }),
        },
        status: faker.helpers.arrayElement(['Placed', 'Looking', 'Higher Studies', 'At Risk']),
    }));
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

// Initial Mock Data
faker.seed(123); // Ensure deterministic data for SSR/Hydration consistency
export const mockStudents = generateStudents(500);
export const mockDepartmentStats = getDepartmentStats(mockStudents);
