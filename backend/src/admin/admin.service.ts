import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { College } from '../colleges/entities/college.entity';
import { CollegeStaff } from '../colleges/entities/college-staff.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(College)
        private collegesRepo: Repository<College>,
        @InjectRepository(CollegeStaff)
        private staffRepo: Repository<CollegeStaff>,
        @InjectRepository(AdminActivityLog)
        private logRepo: Repository<AdminActivityLog>,
    ) {}

    async getOverview() {
        const totalColleges = await this.collegesRepo.count();
        const totalStudents = await this.collegesRepo
            .createQueryBuilder('college')
            .select('COALESCE(SUM(college.studentCount), 0)', 'total')
            .getRawOne();
        const recentLogs = await this.logRepo.find({ order: { createdAt: 'DESC' }, take: 5 });
        const recentSignups = await this.staffRepo.find({ order: { createdAt: 'DESC' }, take: 5 });

        return {
            totalColleges,
            totalStudents: Number(totalStudents?.total || 0),
            partners: 48,
            uptime: '99.9%',
            recentLogs,
            recentSignups,
        };
    }

    async getAnalytics() {
        return {
            visitors: 12402,
            subscribers: 848,
            activeNow: 124,
            funnels: [
                { stage: 'Platform Landing', count: '12.4k', percentage: 100 },
                { stage: 'Entered Placement Mode', count: '8.2k', percentage: 66 },
                { stage: 'Started Training', count: '4.1k', percentage: 33 },
                { stage: 'Subscribed to Pro', count: '848', percentage: 7 },
            ],
            featureEngagement: [
                { name: 'DSA Training', time: '840h users', percentage: 90, color: 'bg-blue-500' },
                { name: 'VS School (Prep)', time: '620h users', percentage: 75, color: 'bg-indigo-500' },
                { name: 'Mock Interviews', time: '410h users', percentage: 60, color: 'bg-rose-500' },
                { name: 'Placement Mode Dashboard', time: '580h users', percentage: 70, color: 'bg-emerald-500' },
                { name: 'Synapse Intelligence', time: '340h users', percentage: 45, color: 'bg-amber-500' },
            ],
        };
    }

    async logAction(payload: Partial<AdminActivityLog>) {
        const log = this.logRepo.create({
            actorId: payload.actorId || null,
            actorName: payload.actorName || 'System',
            action: payload.action || 'Action',
            target: payload.target || null,
            severity: payload.severity || 'info',
            metadata: payload.metadata || null,
        });
        return this.logRepo.save(log);
    }
}
