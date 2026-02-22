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

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
