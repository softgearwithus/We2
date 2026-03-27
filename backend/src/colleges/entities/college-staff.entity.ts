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
import { UserRole } from '../../users/user.entity';

@Entity('college_staff')
export class CollegeStaff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  collegeId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 40 })
  role: UserRole;

  @Column({ type: 'varchar', length: 80, nullable: true })
  roleLabel: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  department: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  year: string | null;

  @Column({ type: 'varchar', length: 80 })
  credentialId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tempPassword: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => College, (college) => college.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collegeId' })
  college: College;
}
