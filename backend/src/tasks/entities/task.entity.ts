import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Simulation } from '../../simulations/entities/simulation.entity';
import { User } from '../../users/user.entity';
import { Performance } from '../../performance/entities/performance.entity';

export enum TaskType {
  BUG_FIX = 'bug_fix',
  FEATURE = 'feature',
  RESEARCH = 'research',
  CODE_REVIEW = 'code_review',
  DOCUMENTATION = 'documentation',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TaskDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  simulationId: string;

  @Column({ type: 'uuid', nullable: true })
  assignedBy: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
  })
  type: TaskType;

  @Column({
    type: 'varchar',
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({
    type: 'varchar',
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  submissionContent: string | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({
    type: 'varchar',
    default: TaskDifficulty.MEDIUM,
  })
  difficulty: TaskDifficulty;

  @Column({ type: 'int', default: 0 })
  estimatedHours: number;

  @Column({ type: 'int', nullable: true })
  actualHours: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Simulation, (simulation) => simulation.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'simulationId' })
  simulation: Simulation;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedBy' })
  assigner: User | null;

  @OneToOne(() => Performance, (performance) => performance.task, {
    nullable: true,
  })
  performance: Performance | null;
}
