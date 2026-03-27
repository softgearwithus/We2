import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LeadStatus {
  PENDING = 'pending',
  PROVISIONED = 'provisioned',
  REJECTED = 'rejected',
}

@Entity()
export class CompanyLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  companyName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.PENDING,
  })
  status: LeadStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
