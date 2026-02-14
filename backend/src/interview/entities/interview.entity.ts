import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('interviews_v2')
export class Interview {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', default: 'active' }) // active, completed
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'text', nullable: true })
    feedback: string;

    @Column({ type: 'simple-json', default: '[]' })
    history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;

    // meaningful relation to User if needed, for now optional or mocked
    @Column({ nullable: true })
    userId: string;
}
