import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
@Index(['active', 'createdAt'])
export class WriteXQuestion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    prompt: string;

    @Column({ type: 'boolean', default: true })
    active: boolean;

    @Column({ type: 'varchar', nullable: true })
    topicKey: string;

    @Column({ type: 'varchar', nullable: true })
    topicLabel: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
