import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class UpdateFlagPayloadDto {
    @ApiProperty({ example: '/dashboard/dsa' })
    @IsString()
    href: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    enabled: boolean;
}

export class UpdateUpdateFlagsDto {
    @ApiProperty({ type: [UpdateFlagPayloadDto] })
    @IsArray()
    flags: UpdateFlagPayloadDto[];
}
