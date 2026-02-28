import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'boolean', default: false })
    maintenanceMode: boolean;

    @Column({ type: 'boolean', default: true })
    allowRegistrations: boolean;

    @Column({ type: 'varchar', length: 255, default: '' })
    supportEmail: string;

    @Column({ type: 'int', default: 10 })
    maxUploadSizeMB: number;

    @Column({ type: 'boolean', default: false })
    upgradesEnabled: boolean;

    @Column({ type: 'jsonb', nullable: true })
    subscriptionPrices: Record<string, any>;

    @Column({ type: 'int', default: 10 })
    freeTierLimitMinutes: number;

    @Column({ type: 'timestamp', nullable: true })
    freeTierResetAt: Date | null;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
