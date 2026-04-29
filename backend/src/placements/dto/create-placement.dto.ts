import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  IsArray,
  ArrayMinSize,
  IsInt,
  Min,
  IsDateString,
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
}
