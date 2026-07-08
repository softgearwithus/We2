import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  IsBoolean,
  ArrayMinSize,
  IsInt,
  Min,
  IsDateString,
  IsUUID,
  ArrayMaxSize,
} from 'class-validator';
import {
  PlacementType,
  PlacementStatus,
  WorkMode,
} from '../entities/placement.entity';

export class CreatePlacementDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsUrl()
  companyLogo?: string;

  @IsEnum(PlacementType)
  type: PlacementType;

  @IsEnum(WorkMode)
  workMode: WorkMode;

  @IsEnum(PlacementStatus)
  @IsOptional()
  status?: PlacementStatus;

  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  applyLink?: string;

  @IsString()
  jobProfile: string;

  @IsString()
  packageOffered: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  roles: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @IsOptional()
  @IsString()
  experienceRequired?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  openings?: number;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsString()
  batchEligible?: string;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  githubRepositoryUrl?: string;

  @IsOptional()
  @IsUrl()
  issueTrackerUrl?: string;

  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @IsOptional()
  @IsString()
  workContext?: string;

  @IsOptional()
  @IsString()
  pipelineNotes?: string;

  @IsOptional()
  @IsString()
  pipelineTemplateKey?: string;

  @IsOptional()
  @IsArray()
  pipelineStages?: Record<string, any>[];

  @IsOptional()
  @IsBoolean()
  automationEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  shortlistScoreThreshold?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  interviewDurationMinutes?: number;

  @IsOptional()
  @IsDateString()
  interviewWindowStart?: string;

  @IsOptional()
  @IsDateString()
  interviewWindowEnd?: string;

  @IsOptional()
  @IsBoolean()
  autoInviteShortlisted?: boolean;

  @IsOptional()
  @IsString()
  automationMode?: string;

  @IsOptional()
  @IsBoolean()
  companyProfileIncluded?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUUID('4', { each: true })
  repositoryIds?: string[];
}
