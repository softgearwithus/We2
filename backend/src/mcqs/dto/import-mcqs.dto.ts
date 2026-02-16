import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImportMcqsDto {
    @ApiProperty({ description: 'CSV payload text' })
    @IsNotEmpty()
    @IsString()
    csv: string;
}
