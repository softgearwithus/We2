import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAdminSecurityDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    currentPassword?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    newPassword?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    twoFactorEnabled?: boolean;
}
