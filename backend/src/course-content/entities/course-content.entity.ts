import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class CourseContent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    topicId: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column({ default: false })
    isPremium: boolean;

    @UpdateDateColumn()
    lastUpdated: Date;
}
