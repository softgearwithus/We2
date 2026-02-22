import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsOptional } from 'class-validator';

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
}
