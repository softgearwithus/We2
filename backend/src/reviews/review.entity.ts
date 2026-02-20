import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'needs_changes' | 'published';
export type ReviewSource = 'student' | 'mentor' | 'admin';
export type ReviewType = 'code_review' | 'resume' | 'project' | 'general';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: true })
    userId: string | null;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', default: 'general' })
    type: ReviewType;

    @Column({ type: 'varchar', default: 'pending' })
    status: ReviewStatus;

    @Column({ type: 'varchar', default: 'student' })
    source: ReviewSource;

    @Column({ type: 'int', default: 0 })
    score: number;

    @Column({ type: 'text', nullable: true })
    feedback: string | null;

    @Column({ type: 'text', nullable: true })
    reviewerNotes: string | null;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any> | null;

    @Column({ type: 'boolean', default: false })
    isPublished: boolean;

    @Column({ type: 'boolean', default: false })
    isFeatured: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
