import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { ProjectComplexity } from '../entities/project-lab.entity';
import type { ProjectLabDetails, ProjectLabReadme } from '../entities/project-lab.entity';
import { ProjectLabTaskDto } from './project-lab-task.dto';

export class UpdateProjectLabDto {
    @ApiProperty({ required: false, example: 'frontend' })
    @IsOptional()
    @IsString()
    domainId?: string;

    @ApiProperty({ required: false, example: 'Updated title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false, example: 'Updated description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: ProjectComplexity, required: false })
    @IsOptional()
    @IsEnum(ProjectComplexity)
    complexity?: ProjectComplexity;

    @ApiProperty({ required: false, example: '8 Hours' })
    @IsOptional()
    @IsString()
    estimatedTime?: string;

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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
