import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CollegeStaff } from './college-staff.entity';
import { StudentCohort } from './student-cohort.entity';
import { CollegeStudent } from './college-student.entity';

@Entity('colleges')
export class College {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 180 })
  name: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  type: string | null;

  @Column({ type: 'varchar', length: 40, default: 'Active' })
  status: string;

  @Column({ type: 'simple-json' })
  years: string[];

  @Column({ type: 'simple-json' })
  departments: string[];

  @Column({ type: 'int', default: 0 })
  studentCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adminEmail: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CollegeStaff, (staff) => staff.college)
  staff: CollegeStaff[];

  @OneToMany(() => StudentCohort, (cohort) => cohort.college)
  cohorts: StudentCohort[];

  @OneToMany(() => CollegeStudent, (student) => student.college)
  students: CollegeStudent[];
}
