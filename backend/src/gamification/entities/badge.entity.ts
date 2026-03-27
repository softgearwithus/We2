import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string; // e.g., 'first-solve', 'streak-7'

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  icon: string; // URL or icon name

  @Column({ type: 'int' })
  xpValue: number;
}
