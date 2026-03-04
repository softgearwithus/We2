import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('vapi_resume_assets')
@Index(['userId'])
export class VapiResumeAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fileType: string | null;

  @Column({ type: 'varchar', length: 80 })
  vapiFileId: string;

  @Column({ type: 'varchar', length: 80 })
  vapiToolId: string;

  @Column({ type: 'varchar', length: 80 })
  vapiToolName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
