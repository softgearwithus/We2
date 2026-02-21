import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateCohortDto {
    @ApiProperty({ example: 'Y1' })
    @IsString()
    year: string;

    @ApiProperty({ example: 'CSE' })
    @IsString()
    department: string;

    @ApiProperty({ example: 120 })
    @IsInt()
    @Min(1)
    count: number;
}
