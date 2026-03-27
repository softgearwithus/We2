import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum AchievementCategory {
  SKILL = 'skill',
  MILESTONE = 'milestone',
  STREAK = 'streak',
  SPECIAL = 'special',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string | null; // URL or icon name

  @Column({
    type: 'varchar',
  })
  category: AchievementCategory;

  @Column({ type: 'int', default: 0 })
  xp: number; // Experience points

  @Column({ type: 'timestamp' })
  earnedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
