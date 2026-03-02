import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/user.entity';
import { MockTest } from './mock-test.entity';
import { MockTestStudentResponse } from './mock-test-student-response.entity';

@Entity('mock_test_results')
export class MockTestResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => MockTest, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'mock_test_id' })
    mockTest: MockTest;

    @Column({ name: 'start_time', type: 'timestamp' })
    startTime: Date;

    @Column({ name: 'end_time', type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ name: 'total_marks', type: 'int', default: 0 })
    totalMarks: number;

    @Column({ name: 'marks_obtained', type: 'decimal', precision: 5, scale: 2, default: 0 })
    marksObtained: number;

    // Track if grading is finished (e.g. Gemini finishes evaluating CODE/TEXT questions)
    @Column({ name: 'is_evaluated', type: 'boolean', default: false })
    isEvaluated: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => MockTestStudentResponse, response => response.mockTestResult, { cascade: true })
    responses: MockTestStudentResponse[];
}
