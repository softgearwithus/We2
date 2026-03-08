import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { ProjectComplexity } from '../entities/project-lab.entity';
import type { ProjectLabDetails, ProjectLabReadme } from '../entities/project-lab.entity';
import { ProjectLabTaskDto } from './project-lab-task.dto';

export class CreateProjectLabDto {
    @ApiProperty({ example: 'frontend' })
    @IsString()
    domainId: string;

    @ApiProperty({ example: 'E-commerce Dashboard UI' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Build a responsive admin dashboard UI with charts.' })
    @IsString()
    description: string;

    @ApiProperty({ enum: ProjectComplexity, example: ProjectComplexity.BEGINNER })
    @IsEnum(ProjectComplexity)
    complexity: ProjectComplexity;

    @ApiProperty({ example: '6 Hours' })
    @IsString()
    estimatedTime: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    skills?: string[];

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    tags?: string[];

    @ApiProperty({ required: false, type: [Object] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectLabTaskDto)
    tasks?: ProjectLabTaskDto[];

    @ApiProperty({ required: false, type: Object })
    @IsOptional()
    readme?: ProjectLabReadme;

    @ApiProperty({ required: false, type: Object })
    @IsOptional()
    details?: ProjectLabDetails;
}
