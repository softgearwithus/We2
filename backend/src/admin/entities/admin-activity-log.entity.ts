import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('admin_activity_logs')
export class AdminActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ type: 'varchar', length: 180 })
  actorName: string;

  @Column({ type: 'varchar', length: 120 })
  action: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  target: string | null;

  @Column({ type: 'varchar', length: 40, default: 'info' })
  severity: 'info' | 'warning' | 'critical';

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
