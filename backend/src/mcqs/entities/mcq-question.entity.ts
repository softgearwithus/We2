import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum McqCategory {
    SUBJECT = 'subject',
    COMPANY = 'company',
}

@Entity()
@Index(['category', 'groupKey', 'topicKey', 'createdAt'])
export class McqQuestion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: McqCategory })
    category: McqCategory;

    @Column({ type: 'varchar', length: 120 })
    groupKey: string;

    @Column({ type: 'varchar', length: 160 })
    groupLabel: string;

    @Column({ type: 'varchar', length: 120, nullable: true })
    topicKey: string | null;

    @Column({ type: 'varchar', length: 160, nullable: true })
    topicLabel: string | null;

    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'simple-json' })
    options: string[];

    @Column({ type: 'int' })
    correctOptionIndex: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
