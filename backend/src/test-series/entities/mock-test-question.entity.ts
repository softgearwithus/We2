import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MockTestSection } from './mock-test-section.entity';

export enum MockQuestionType {
    MCQ = 'MCQ',
    TEXT = 'TEXT',
}

@Entity('mock_test_questions')
export class MockTestQuestion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sectionId: string;

    @ManyToOne(() => MockTestSection, section => section.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sectionId' })
    section: MockTestSection;

    @Column({
        type: 'enum',
        enum: MockQuestionType,
        default: MockQuestionType.MCQ
    })
    questionType: MockQuestionType;

    @Column({ type: 'text' })
    questionText: string;

    @Column({ type: 'jsonb', nullable: true })
    optionsJson?: any;

    @Column({ nullable: true })
    correctAnswer?: string; // Either an index "1" for MCQ, or text for writeX

    @Column({ type: 'int', nullable: true })
    marks?: number;

    @Column({ type: 'int', default: 0 })
    order: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
