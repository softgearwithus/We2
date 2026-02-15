import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';

export enum ProjectStatus {
    PLANNING = 'planning',
    DEVELOPMENT = 'development',
    TESTING = 'testing',
    DEPLOYED = 'deployed',
    ARCHIVED = 'archived',
}

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    teamId: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    repositoryUrl: string | null;

    @Column({
        type: 'varchar',
        default: ProjectStatus.PLANNING,
    })
    status: ProjectStatus;

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    dueDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null;

    @Column({ type: 'simple-json', nullable: true })
    techStack: string[] | null; // e.g., ["React", "Node.js"]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Team, (team) => team.projects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'teamId' })
    team: Team;
}
