import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('user_gamification')
export class UserGamification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'int', default: 0 })
  totalXp: number;

  @Column({ type: 'int', default: 1 })
  currentLevel: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  maxStreak: number;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityDate: Date | null;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
