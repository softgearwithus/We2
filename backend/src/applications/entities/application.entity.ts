import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Placement } from '../../placements/entities/placement.entity';

export enum ApplicationStatus {
  APPLIED = 'Applied',
  REVIEWING = 'Reviewing',
  INTERVIEWING = 'Interviewing',
  OFFERED = 'Offered',
  REJECTED = 'Rejected',
}

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: string;

  @ManyToOne(() => Placement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placementId' })
  placement: Placement;

  @Column()
  placementId: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  candidateName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  candidateEmail: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  candidatePhone: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  candidateDepartment: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  candidateYear: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  candidateLocation: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  candidateLinkedinUrl: string | null;

  @Column({ type: 'text', nullable: true })
  resumeDriveUrl: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  appliedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
