export type PlacementMetrics = {
    coding: number;
    aptitude: number;
    communication: number;
    core: number;
};

export type Student = {
    id: string;
    name: string;
    department: string;
    year: 1 | 2 | 3 | 4;
    cgpa: number;
    attendance: number;
    placementReadiness: number;
    skills: PlacementMetrics;
    status: 'Placed' | 'Looking' | 'At Risk' | 'Higher Studies';
    collegeId: string;
};

export type DepartmentStats = {
    name: string;
    studentCount: number;
    avgAttendance: number;
    avgReadiness: number;
    placementRate: number;
};
