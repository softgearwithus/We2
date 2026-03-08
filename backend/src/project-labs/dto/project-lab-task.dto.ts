import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class ProjectLabTaskDto {
    @ApiProperty({ example: 'task-setup' })
    @IsString()
    @MinLength(1)
    @MaxLength(80)
    id: string;

    @ApiProperty({ example: 'Set up development environment' })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @ApiProperty({ example: 'pending', enum: ['pending', 'completed'] })
    @IsString()
    @IsIn(['pending', 'completed'])
    status: string;
}
