import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    STUDENT = 'student',
    MENTOR = 'mentor',
    COMPANY_ADMIN = 'company_admin',
    COLLEGE_ADMIN = 'college_admin',
    SUPER_ADMIN = 'super_admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    firstName: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    lastName: string | null;

    @Column({ select: false }) // Don't return password by default
    password: string;

    @Column({
        type: 'varchar',
        default: UserRole.STUDENT,
    })
    role: UserRole;

    @Column({
        type: 'varchar',
        default: 'free', // free, placement_plus, industry_plus, we2_max
    })
    subscriptionPlan: string;

    @Column({
        type: 'varchar',
        default: 'inactive', // active, inactive, expired
    })
    subscriptionStatus: string;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionEndDate: Date;

    @Column({ default: false })
    isTwoFactorEnabled: boolean;

    @Column({ nullable: true })
    twoFactorSecret?: string;

    @Column({ type: 'uuid', nullable: true })
    collegeId?: string | null;

    // --- Usage Limits ---
    @Column({ type: 'timestamp', nullable: true })
    usageLastReset: Date | null;

    @Column({ default: 0 })
    audioDrillUsage: number;

    @Column({ default: 0 })
    videoInterviewUsage: number;

    @Column({ default: 0 })
    drillTopicsRefreshCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
