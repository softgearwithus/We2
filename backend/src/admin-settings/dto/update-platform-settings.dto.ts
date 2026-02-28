import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsInt, IsOptional } from 'class-validator';

export class UpdatePlatformSettingsDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    maintenanceMode?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    allowRegistrations?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    supportEmail?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    maxUploadSizeMB?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    upgradesEnabled?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    subscriptionPrices?: Record<string, any>;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    freeTierLimitMinutes?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    freeTierResetAt?: string;
}
