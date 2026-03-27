import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('market_radar')
export class MarketRadar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-json' })
  payload: Record<string, any>;

  @Column({ type: 'varchar', length: 120, nullable: true })
  publishedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
