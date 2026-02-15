import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Team } from '../../teams/entities/team.entity';

export enum SimulationType {
    MODE_1_PLACEMENT = 'mode_1_placement',
    MODE_2_INDUSTRY = 'mode_2_industry',
}

export enum SimulationStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned',
}

export enum SimulationPhase {
    ONBOARDING = 'onboarding',
    TRAINING = 'training',
    PRESSURE = 'pressure',
    DELIVERY = 'delivery',
}

@Entity('simulations')
export class Simulation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'varchar',
    })
    type: SimulationType;

    @Column({
        type: 'varchar',
        default: SimulationStatus.NOT_STARTED,
    })
    status: SimulationStatus;

    @Column({ type: 'int', default: 0 })
    currentDay: number;

    @Column({
        type: 'varchar',
        nullable: true,
    })
    currentPhase: SimulationPhase | null;

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date | null;

    @Column({ type: 'int', nullable: true })
    score: number | null;

    @Column({ type: 'simple-json', nullable: true })
    metadata: Record<string, any> | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => Task, (task) => task.simulation)
    tasks: Task[];

    @ManyToOne(() => Team, (team) => team.simulations, { nullable: true })
    @JoinColumn({ name: 'teamId' })
    team: Team | null;

    @Column({ type: 'uuid', nullable: true })
    teamId: string | null;
}
