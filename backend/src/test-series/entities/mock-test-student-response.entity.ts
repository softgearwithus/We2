import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MockTestResult } from './mock-test-result.entity';
import { MockTestQuestion } from './mock-test-question.entity';

@Entity('mock_test_student_responses')
export class MockTestStudentResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MockTestResult, (result) => result.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mock_test_result_id' })
  mockTestResult: MockTestResult;

  @ManyToOne(() => MockTestQuestion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'question_id' })
  question: MockTestQuestion;

  @Column({ name: 'subject_mcq_id', type: 'uuid', nullable: true })
  subjectMcqId: string;

  @Column({ name: 'time_spent_seconds', type: 'int', default: 0 })
  timeSpentSeconds: number;

  // The student's answer:
  // For SINGLE_CORRECT: string index
  // For MULTI_CORRECT: comma separated string indices
  // For TEXT/CODE: raw text body
  @Column({ name: 'response_value', type: 'text', nullable: true })
  responseValue: string;

  // Evaluated outcome
  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({
    name: 'marks_awarded',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  marksAwarded: number;

  // If evaluated by Gemini (useful for CODE/TEXT feedback)
  @Column({ name: 'ai_feedback', type: 'text', nullable: true })
  aiFeedback: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
