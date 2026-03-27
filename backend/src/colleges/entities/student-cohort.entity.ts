import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { College } from './college.entity';

@Entity('student_cohorts')
export class StudentCohort {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  collegeId: string;

  @Column({ type: 'varchar', length: 120 })
  code: string;

  @Column({ type: 'varchar', length: 20 })
  year: string;

  @Column({ type: 'varchar', length: 80 })
  department: string;

  @Column({ type: 'int' })
  count: number;

  @Column({ type: 'simple-json' })
  credentials: Array<{ uid: string; password: string }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => College, (college) => college.cohorts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collegeId' })
  college: College;
}
