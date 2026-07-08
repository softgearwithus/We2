import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('github_repositories')
@Index(['companyId', 'githubRepositoryId'], { unique: true })
export class GithubRepository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid' })
  @Index()
  installationRecordId: string;

  @Column({ type: 'varchar', length: 80 })
  @Index()
  installationId: string;

  @Column({ type: 'varchar', length: 80 })
  githubRepositoryId: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 140 })
  owner: string;

  @Column({ type: 'varchar', length: 140 })
  name: string;

  @Column({ type: 'text' })
  htmlUrl: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  defaultBranch: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  selectedBranch: string | null;

  @Column({ type: 'boolean', default: false })
  private: boolean;

  @Column({ type: 'boolean', default: false })
  isLinked: boolean;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, any> | null;

  @Column({ type: 'varchar', length: 24, nullable: true })
  contextStatus: string | null;

  @Column({ type: 'jsonb', nullable: true })
  contextSnapshot: Record<string, any> | null;

  @Column({ type: 'timestamp', nullable: true })
  contextSyncedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  contextError: string | null;

  @Column({ type: 'timestamp', nullable: true })
  linkedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
