import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HiringAssessmentStatus } from '../entities/hiring-assessment.entity';
import { AssessmentFileDto } from './assessment-file.dto';
import { AssessmentContextSourceDto } from './create-hiring-assessment.dto';

export class UpdateHiringAssessmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  language?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  timeLimitMinutes?: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  stageName?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AssessmentContextSourceDto)
  contextSources?: AssessmentContextSourceDto[];

  @IsOptional()
  @IsObject()
  contextSnapshot?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => AssessmentFileDto)
  files?: AssessmentFileDto[];

  @IsOptional()
  @IsEnum(HiringAssessmentStatus)
  status?: HiringAssessmentStatus;
}
