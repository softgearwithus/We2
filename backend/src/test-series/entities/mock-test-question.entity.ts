import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MockTestSection } from './mock-test-section.entity';

export enum MockQuestionType {
    SINGLE_CORRECT = 'SINGLE_CORRECT',
    MULTI_CORRECT = 'MULTI_CORRECT',
    TEXT = 'TEXT',
    CODE = 'CODE',
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
        default: MockQuestionType.SINGLE_CORRECT
    })
    questionType: MockQuestionType;

    @Column({ type: 'text' })
    questionText: string;

    @Column({ type: 'jsonb', nullable: true })
    optionsJson?: any;

    @Column({ type: 'text', nullable: true })
    correctAnswer: string;

    @Column({ type: 'text', nullable: true })
    solutionText: string;

    @Column({ type: 'int', default: 1 })
    marks: number;

    @Column({ type: 'int', default: 0 })
    order: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
