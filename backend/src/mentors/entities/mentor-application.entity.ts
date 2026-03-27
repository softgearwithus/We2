import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mentor_applications')
export class MentorApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'int', default: 0 })
  feePerMinuteInr: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  expertise: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  offerings: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  linkedin: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  totalExperience: string | null;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status: 'Pending' | 'Approved' | 'Rejected';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
