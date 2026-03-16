import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['userId']) // Removed unique constraint to allow multiple resumes
export class Resume {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 255, default: 'Untitled Resume' })
    title: string;

    @Column({ type: 'simple-json', nullable: true })
    data: Record<string, any> | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
