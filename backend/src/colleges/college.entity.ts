import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class College {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    code?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    city?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    state?: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    contactEmail?: string | null;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
