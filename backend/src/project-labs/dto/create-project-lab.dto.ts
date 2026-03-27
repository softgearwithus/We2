import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ProjectComplexity } from '../entities/project-lab.entity';
import type {
  ProjectLabDetails,
  ProjectLabReadme,
} from '../entities/project-lab.entity';

export class CreateProjectLabDto {
  @ApiProperty({ example: 'frontend' })
  @IsString()
  domainId: string;

  @ApiProperty({ example: 'E-commerce Dashboard UI' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Build a responsive admin dashboard UI with charts.',
  })
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
  tasks?: Record<string, any>[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  readme?: ProjectLabReadme;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  details?: ProjectLabDetails;
}
