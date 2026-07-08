import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Index({ unique: true })
  companyId: string;

  @Column({ type: 'varchar', length: 160 })
  displayName: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  legalName: string | null;

  @Column({ type: 'varchar', length: 140, unique: true })
  @Index({ unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supportEmail: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationEmail: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  industry: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  productType: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  domain: string | null;

  @Column({ type: 'text', nullable: true })
  companyContext: string | null;

  @Column({ type: 'jsonb', nullable: true })
  hiringDefaults: Record<string, any> | null;

  @Column({ type: 'varchar', length: 40, default: 'free' })
  subscriptionPlan: string;

  @Column({ type: 'varchar', length: 40, default: 'inactive' })
  subscriptionStatus: string;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  billingStartedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  usageSnapshot: Record<string, any> | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
