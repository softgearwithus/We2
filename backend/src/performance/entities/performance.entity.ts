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
import { User } from '../../users/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Simulation } from '../../simulations/entities/simulation.entity';

export enum PerformanceCategory {
  TECHNICAL = 'technical',
  COMMUNICATION = 'communication',
  COLLABORATION = 'collaboration',
  PROBLEM_SOLVING = 'problem_solving',
}

@Entity('performance')
export class Performance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  taskId: string | null;

  @Column({ type: 'uuid', nullable: true })
  simulationId: string | null;

  @Column({
    type: 'varchar',
  })
  category: PerformanceCategory;

  @Column({ type: 'int' })
  score: number; // 0-100

  @Column({ type: 'text' })
  feedback: string;

  @Column({ type: 'varchar', length: 255 })
  evaluatedBy: string; // "AI" or userId

  @Column({ type: 'timestamp' })
  evaluatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Task, (task) => task.performance, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task: Task | null;

  @ManyToOne(() => Simulation, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'simulationId' })
  simulation: Simulation | null;
}
