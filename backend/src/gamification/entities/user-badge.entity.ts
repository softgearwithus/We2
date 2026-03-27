import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Badge } from './badge.entity'; // Fixed import

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  badgeId: string;

  @CreateDateColumn()
  earnedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Badge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;
}
