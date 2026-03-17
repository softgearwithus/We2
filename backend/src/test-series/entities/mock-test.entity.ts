import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { MockTestSection } from './mock-test-section.entity';

@Entity('mock_tests')
export class MockTest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    companyId: string;

    @ManyToOne(() => Company, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int', default: 0 })
    totalDurationMinutes: number;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'boolean', default: false })
    isPublished: boolean;

    @Column({ type: 'boolean', default: false })
    isNew: boolean;

    @OneToMany(() => MockTestSection, section => section.mockTest, { cascade: true })
    sections: MockTestSection[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
