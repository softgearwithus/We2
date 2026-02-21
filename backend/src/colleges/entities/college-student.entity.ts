import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { College } from './college.entity';

@Entity('college_students')
export class CollegeStudent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    collegeId: string;

    @Column({ type: 'varchar', length: 120 })
    uid: string;

    @Column({ type: 'varchar', length: 180 })
    name: string;

    @Column({ type: 'varchar', length: 120 })
    department: string;

    @Column({ type: 'int' })
    year: number;

    @Column({ type: 'float', default: 0 })
    cgpa: number;

    @Column({ type: 'int', default: 0 })
    attendance: number;

    @Column({ type: 'int', default: 0 })
    placementReadiness: number;

    @Column({ type: 'simple-json' })
    skills: {
        coding: number;
        aptitude: number;
        communication: number;
        core: number;
    };

    @Column({ type: 'varchar', length: 40 })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => College, (college) => college.students, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'collegeId' })
    college: College;
}
