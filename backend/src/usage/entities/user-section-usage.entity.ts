import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('user_section_usage')
@Index(['userId', 'sectionKey'], { unique: true })
export class UserSectionUsage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 60 })
    sectionKey: string;

    @Column({ type: 'int', default: 0 })
    usedSeconds: number;

    @Column({ type: 'timestamp', nullable: true })
    lastResetAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    lastHeartbeatAt: Date | null;

    @Column({ type: 'boolean', default: false })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
