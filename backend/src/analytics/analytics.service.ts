import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission, SubmissionStatus } from '../dsa/entities/submission.entity';
import { DsaProblem } from '../dsa/entities/dsa-problem.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';

@Injectable()
export class AnalyticsService {
    private instituteStudentCache: ReturnType<AnalyticsService['generateInstituteStudents']> | null = null;

    constructor(
        @InjectRepository(Submission)
        private submissionRepo: Repository<Submission>,
        @InjectRepository(UserGamification)
        private gamificationRepo: Repository<UserGamification>,
        @InjectRepository(DsaProblem)
        private dsaProblemRepo: Repository<DsaProblem>,
    ) { }

    async getUserDashboardStats(userId: string) {
        // 1. Get Gamification Stats
        const gamification = await this.gamificationRepo.findOne({ where: { userId } });

        // 2. Get Submission Stats
        const submissions = await this.submissionRepo.find({
            where: { userId },
            relations: ['problem'],
            order: { submittedAt: 'DESC' },
        });

        const totalSubmissions = submissions.length;
        const acceptedSubmissions = submissions.filter(s => s.status === SubmissionStatus.ACCEPTED);
        const uniqueSolved = new Set(acceptedSubmissions.map(s => s.problemId)).size;

        // Calculate Acceptance Rate
        const acceptanceRate = totalSubmissions > 0
            ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100)
            : 0;

        // 3. Difficulty Breakdown
        const difficultyStats: Record<string, number> = {
            Easy: 0,
            Medium: 0,
            Hard: 0,
        };
        const solvedProblemIds = new Set<string>();

        acceptedSubmissions.forEach(s => {
            if (s.problem && !solvedProblemIds.has(s.problemId)) {
                solvedProblemIds.add(s.problemId);
                const diff = s.problem.difficulty;
                if (difficultyStats[diff]) { // e.g. 'Easy', 'Medium', 'Hard'
                    difficultyStats[diff]++;
                }
            }
        });

        return {
            totalXp: gamification?.totalXp || 0,
            currentLevel: gamification?.currentLevel || 1,
            currentStreak: gamification?.currentStreak || 0,
            problemsSolved: uniqueSolved,
            totalSubmissions,
            acceptanceRate,
            difficultyStats,
            recentActivity: submissions.slice(0, 5).map(s => ({
                id: s.id,
                problemTitle: s.problem?.title,
                status: s.status,
                submittedAt: s.submittedAt,
            }))
        };
    }

    async getHeatmapData(userId: string) {
        // Get all submissions for the last year
        // For simplicity, fetch all and aggregate in memory (optimize later with SQL GROUP BY)
        const submissions = await this.submissionRepo.find({
            where: { userId },
            select: ['submittedAt', 'status']
        });

        const heatmap: Record<string, number> = {};

        submissions.forEach(s => {
            const date = s.submittedAt.toISOString().split('T')[0]; // YYYY-MM-DD
            heatmap[date] = (heatmap[date] || 0) + 1;
        });

        // Format for frontend (e.g., array of { date, count })
        return Object.entries(heatmap).map(([date, count]) => ({ date, count }));
    }

    async getSkillRadar(userId: string) {
        // Fetch passed submissions with problem tags
        // This requires 'categories' or 'tags' on DsaProblem. 
        // Assuming 'categories' is a string[] or json column.

        const submissions = await this.submissionRepo.find({
            where: { userId, status: SubmissionStatus.ACCEPTED },
            relations: ['problem'],
        });

        const skillMap: Record<string, number> = {};

        submissions.forEach(s => {
            if (s.problem && s.problem.categories) {
                s.problem.categories.forEach(tag => {
                    skillMap[tag] = (skillMap[tag] || 0) + 1;
                });
            }
        });

        // Return top 6 categories
        return Object.entries(skillMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([subject, A]) => ({ subject, A, fullMark: 20 })); // Normalized or raw
    }

    async getInstituteDashboard(collegeId?: string | null) {
        const problemCount = await this.dsaProblemRepo.count();
        const students = this.getCachedInstituteStudents(120, collegeId);
        const departmentStats = this.getDepartmentStats(students);
        const totalStudents = students.length;
        const placedStudents = students.filter((student) => student.status === 'Placed').length;
        const placementRate = totalStudents
            ? Math.round((placedStudents / totalStudents) * 1000) / 10
            : 0;
        const topStudents = [...students]
            .sort((a, b) => b.placementReadiness - a.placementReadiness)
            .slice(0, 3);

        return {
            totalStudents,
            placedStudents,
            placementRate,
            departmentStats,
            topStudents,
            problemCount,
        };
    }

    async getInstituteStudents(query?: { query?: string; department?: string; year?: number; status?: string; page?: number; limit?: number; collegeId?: string | null }) {
        const students = this.getCachedInstituteStudents(120, query?.collegeId);
        const filtered = students.filter((student) => {
            if (query?.query && !student.name.toLowerCase().includes(query.query.toLowerCase())) return false;
            if (query?.department && student.department !== query.department) return false;
            if (query?.year && student.year !== query.year) return false;
            if (query?.status && student.status !== query.status) return false;
            return true;
        });

        const total = filtered.length;
        const pageSize = Math.min(Math.max(query?.limit || 25, 1), 100);
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const page = Math.min(Math.max(query?.page || 0, 0), totalPages - 1);
        const start = page * pageSize;
        const data = filtered.slice(start, start + pageSize);

        return { data, total, page, pageSize };
    }

    async getInstitutePlacements(collegeId?: string | null) {
        const students = this.getCachedInstituteStudents(120, collegeId);
        const totals = students.reduce((acc, student) => {
            acc.coding += student.skills.coding;
            acc.aptitude += student.skills.aptitude;
            acc.communication += student.skills.communication;
            acc.core += student.skills.core;
            return acc;
        }, { coding: 0, aptitude: 0, communication: 0, core: 0 });

        return {
            coding: Math.round((totals.coding / students.length) * 10) / 10,
            aptitude: Math.round((totals.aptitude / students.length) * 10) / 10,
            communication: Math.round((totals.communication / students.length) * 10) / 10,
            core: Math.round((totals.core / students.length) * 10) / 10,
        };
    }

    private getCachedInstituteStudents(count: number, collegeId?: string | null) {
        if (!this.instituteStudentCache || this.instituteStudentCache.length !== count) {
            this.instituteStudentCache = this.generateInstituteStudents(count);
        }
        if (!collegeId) return this.instituteStudentCache;
        return this.instituteStudentCache.filter((student) => student.collegeId === collegeId);
    }

    private generateInstituteStudents(count: number) {
        const departments = ['Computer Science', 'Mechanical', 'Electronics', 'Civil'] as const;
        const firstNames = [
            'Aarav', 'Aditi', 'Ananya', 'Arjun', 'Dev',
            'Diya', 'Ishaan', 'Kavya', 'Meera', 'Neha',
            'Nikhil', 'Priya', 'Rahul', 'Riya', 'Rohan',
            'Sanya', 'Sneha', 'Tanvi', 'Varun', 'Yash'
        ];
        const lastNames = [
            'Sharma', 'Patel', 'Gupta', 'Kumar', 'Reddy',
            'Mehta', 'Iyer', 'Singh', 'Bose', 'Kapoor',
            'Jain', 'Verma', 'Das', 'Nair', 'Joshi',
            'Chopra', 'Rao', 'Saxena', 'Malhotra', 'Menon'
        ];

        const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
        const toOneDecimal = (value: number) => Math.round(value * 10) / 10;
        const buildName = (index: number) => {
            const first = firstNames[index % firstNames.length];
            const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
            return `${first} ${last}`;
        };
        const resolveStatus = (readiness: number, attendance: number) => {
            if (readiness >= 80) return 'Placed';
            if (readiness >= 65) return 'Looking';
            if (attendance < 65) return 'At Risk';
            return 'Higher Studies';
        };

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
                department: departments[seed % departments.length],
                year: ((seed % 4) + 1) as 1 | 2 | 3 | 4,
                cgpa: toOneDecimal(5.5 + (seed % 46) * 0.1),
                attendance,
                placementReadiness,
                skills,
                status: resolveStatus(placementReadiness, attendance),
                collegeId,
            };
        });
    }

    private getDepartmentStats(students: ReturnType<AnalyticsService['generateInstituteStudents']>) {
        const departments = ['Computer Science', 'Mechanical', 'Electronics', 'Civil'] as const;
        return departments.map((dept) => {
            const deptStudents = students.filter((student) => student.department === dept);
            const count = deptStudents.length;
            if (!count) {
                return { name: dept, studentCount: 0, avgAttendance: 0, avgReadiness: 0, placementRate: 0 };
            }
            const avgAttendance = deptStudents.reduce((acc, student) => acc + student.attendance, 0) / count;
            const avgReadiness = deptStudents.reduce((acc, student) => acc + student.placementReadiness, 0) / count;
            const placedCount = deptStudents.filter((student) => student.status === 'Placed').length;
            return {
                name: dept,
                studentCount: count,
                avgAttendance: Math.round(avgAttendance * 10) / 10,
                avgReadiness: Math.round(avgReadiness * 10) / 10,
                placementRate: Math.round((placedCount / count) * 1000) / 10,
            };
        });
    }
}
