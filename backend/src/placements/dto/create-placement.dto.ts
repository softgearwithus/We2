import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { PlacementType, PlacementStatus } from '../entities/placement.entity';

export class CreatePlacementDto {
  @IsString()
  title: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsUrl()
  companyLogo?: string;

  @IsEnum(PlacementType)
  type: PlacementType;

  @IsEnum(PlacementStatus)
  @IsOptional()
  status?: PlacementStatus;

  @IsString()
  description: string;

  @IsUrl()
  applyLink: string;

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
