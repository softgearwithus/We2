import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../users/user.entity';

export enum TeamMemberRole {
  LEAD = 'lead',
  DEVELOPER = 'developer',
  TESTER = 'tester',
  DESIGNER = 'designer',
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'varchar',
    default: TeamMemberRole.DEVELOPER,
  })
  role: TeamMemberRole;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  leftAt: Date | null;

  // Relationships
  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
