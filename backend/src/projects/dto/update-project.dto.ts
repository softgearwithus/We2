import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  @ApiProperty({ example: 'Updated title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProjectStatus, required: false })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ example: 'https://github.com/updated/repo', required: false })
  @IsOptional()
  @IsString()
  repositoryUrl?: string;

  @ApiProperty({ example: 'https://new-demo.com', required: false })
  @IsOptional()
  @IsString()
  liveDemoUrl?: string;
}
