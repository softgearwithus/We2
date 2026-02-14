import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(email: string, password: string, role?: string, subscriptionPlan?: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);

        let initialStatus = 'inactive';
        let endDate: Date | null = null;

        if (subscriptionPlan && subscriptionPlan !== 'free') {
            initialStatus = 'active';
            endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        }

        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            role: role as any || 'student',
            subscriptionPlan: subscriptionPlan || 'free',
            subscriptionStatus: initialStatus,
            subscriptionEndDate: endDate as Date,
        });
        return this.usersRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'role', 'isTwoFactorEnabled'],
        });
    }

    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);

        if (updateUserDto.email) {
            user.email = updateUserDto.email;
        }

        if (updateUserDto.password) {
            user.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.usersRepository.save(user);
    }

    async validatePassword(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        console.log(`[UsersService] Password validation result: ${isValid}`);
        return isValid;
    }
    async getDashboardStats(userId: string) {
        // TODO: Replace with real DB queries
        // const completedTasks = await this.tasksRepository.count({ where: { userId, status: TaskStatus.COMPLETED } });
        // const completedInterviews = await this.interviewsRepository.count({ where: { userId, status: InterviewStatus.COMPLETED } });

        return {
            readinessScore: 850,
            problemsSolved: 142,
            interviewsCompleted: 12,
            streakDays: 15,
            skillProficiency: [65, 40, 75, 55, 80, 95, 85],
            recentActivity: [
                { title: 'Solved "Two Sum"', time: '2 mins ago', icon: 'check_circle', color: 'text-emerald-500' },
                { title: 'Mock Interview Feedback', time: '2 hours ago', icon: 'chat', color: 'text-blue-500' },
                { title: 'Resume Updated', time: '1 day ago', icon: 'edit', color: 'text-slate-400' },
            ]
        };
    }

    async upgradeSubscription(id: string, plan: string): Promise<User> {
        const user = await this.findById(id);
        user.subscriptionPlan = plan;
        user.subscriptionStatus = 'active';
        user.subscriptionEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // 1 year from now
        return this.usersRepository.save(user);
    }
}
