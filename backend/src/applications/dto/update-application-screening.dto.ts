import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApplicationScreeningStatus } from '../entities/application.entity';

export class UpdateApplicationScreeningDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsEnum(ApplicationScreeningStatus)
  screeningStatus?: ApplicationScreeningStatus;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  screeningSummary?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  screeningMatchedSkills?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  screeningMissingSkills?: string[];
}
