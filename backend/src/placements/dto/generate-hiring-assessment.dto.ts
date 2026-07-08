import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  IsUUID,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentContextSourceDto } from './create-hiring-assessment.dto';

export class GenerateHiringAssessmentDto {
  @IsString()
  @MinLength(8)
  prompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  templateKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  stageName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  assessmentName?: string;

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
  roleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  draftId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  mode?: string;

  @IsOptional()
  @IsIn(['fast', 'balanced', 'deep'])
  generationMode?: 'fast' | 'balanced' | 'deep';

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
  @ArrayMaxSize(8)
  @IsUUID('4', { each: true })
  repositoryIds?: string[];
}
