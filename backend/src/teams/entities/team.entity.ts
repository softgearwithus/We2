import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Simulation } from '../../simulations/entities/simulation.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 5 })
  maxMembers: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  members: TeamMember[];

  @OneToMany(() => Simulation, (simulation) => simulation.team)
  simulations: Simulation[];

  @OneToMany(() => Project, (project) => project.team)
  projects: Project[];
}
