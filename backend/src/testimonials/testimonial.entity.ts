import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('testimonials')
export class Testimonial {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    role: string;

    @Column({ type: 'varchar', length: 512 })
    image: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    package: string | null;

    @Column({ type: 'text' })
    text: string;

    @Column({ default: true })
    verified: boolean;

    @Column({ default: false })
    isFeatured: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
