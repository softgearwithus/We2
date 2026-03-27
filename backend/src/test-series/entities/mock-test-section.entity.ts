import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MockTest } from './mock-test.entity';
import { MockTestQuestion } from './mock-test-question.entity';

@Entity('mock_test_sections')
export class MockTestSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mockTestId: string;

  @ManyToOne(() => MockTest, (test) => test.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mockTestId' })
  mockTest: MockTest;

  @Column()
  title: string;

  @Column({
    type: 'int',
    nullable: true,
    comment:
      'Strict timer for this section in minutes, if null it uses global timer',
  })
  durationMinutes: number;

  @Column({ type: 'int', default: 0 })
  order: number;

  @OneToMany(() => MockTestQuestion, (question) => question.section, {
    cascade: true,
  })
  questions: MockTestQuestion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
