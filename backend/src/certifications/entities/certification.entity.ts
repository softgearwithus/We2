import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Simulation } from '../../simulations/entities/simulation.entity';

@Entity('certifications')
export class Certification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'uuid' })
    simulationId: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', length: 255, default: 'SimuCorp Platform' })
    issuer: string;

    @Column({ type: 'datetime' })
    issuedAt: Date;

    @Column({ type: 'datetime', nullable: true })
    expiresAt: Date | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    certificateUrl: string | null;

    @Column({ type: 'varchar', length: 100, unique: true })
    verificationCode: string;

    @Column({ type: 'simple-json', nullable: true })
    skills: string[] | null; // Array of validated skills

    @Column({ type: 'int' })
    score: number; // 0-100

    @CreateDateColumn()
    createdAt: Date;

    // Relationships
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Simulation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'simulationId' })
    simulation: Simulation;
}
