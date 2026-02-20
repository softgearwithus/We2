import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PlacementStatus } from '../student-profile.entity';

export class UpdateStudentProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cgpa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  attendance?: number;

  @ApiPropertyOptional({ enum: PlacementStatus })
  @IsOptional()
  @IsEnum(PlacementStatus)
  placementStatus?: PlacementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  resumeScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  skillScores?: {
    coding?: number;
    aptitude?: number;
    communication?: number;
    core?: number;
  };
}
