import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('github_installations')
@Index(['companyId', 'installationId'], { unique: true })
export class GithubInstallation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 80 })
  @Index()
  installationId: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  accountLogin: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  accountType: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  accountId: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  repositorySelection: string | null;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  installedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
