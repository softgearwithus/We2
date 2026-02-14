import {
    IsString,
    IsUUID,
    IsOptional,
    IsArray,
    IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    teamId: string;

    @ApiProperty({ example: 'E-commerce Platform' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Full-stack e-commerce web application' })
    @IsString()
    description: string;

    @ApiProperty({
        example: ['React', 'Node.js', 'PostgreSQL'],
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    techStack?: string[];

    @ApiProperty({ example: 'https://github.com/team/project', required: false })
    @IsOptional()
    @IsString()
    repositoryUrl?: string;

    @ApiProperty({ example: 'https://demo.example.com', required: false })
    @IsOptional()
    @IsString()
    liveDemoUrl?: string;
}
