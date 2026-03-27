import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('queries')
export class Query {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  subject: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column('text')
  message: string;

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'resolved'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
