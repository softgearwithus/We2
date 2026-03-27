import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectLabSubmissionStatus } from '../entities/project-lab-submission.entity';

export class UpdateProjectLabSubmissionDto {
  @ApiProperty({ enum: ProjectLabSubmissionStatus, required: false })
  @IsOptional()
  @IsEnum(ProjectLabSubmissionStatus)
  status?: ProjectLabSubmissionStatus;

  @ApiProperty({ required: false, example: 'Looks good, approved.' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
