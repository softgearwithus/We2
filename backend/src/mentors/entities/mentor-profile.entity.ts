import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('mentor_profiles')
export class MentorProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 160 })
    name: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    headline: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    companies: string | null;

    @Column({ type: 'varchar', length: 120, nullable: true })
    experience: string | null;

    @Column({ type: 'text', nullable: true })
    about: string | null;

    @Column({ type: 'int', default: 0 })
    pricePerMinute: number;

    @Column({ type: 'simple-json', nullable: true })
    tags: string[] | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatarUrl: string | null;

    @Column({ type: 'float', default: 0 })
    rating: number;

    @Column({ type: 'int', default: 0 })
    sessionsCount: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
