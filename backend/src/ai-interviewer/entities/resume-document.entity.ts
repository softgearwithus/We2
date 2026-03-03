import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('resume_documents')
@Index(['userId'])
export class ResumeDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'text', nullable: true })
    blobUrl: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    fileName: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    fileType: string | null;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    parseStatus: string;

    @Column({ type: 'json', nullable: true })
    parsedJson: Record<string, any> | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
