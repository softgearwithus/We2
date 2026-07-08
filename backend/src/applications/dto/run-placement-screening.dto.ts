import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class RunPlacementScreeningDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  threshold?: number;

  @IsOptional()
  @IsBoolean()
  autoInvite?: boolean;

  @IsOptional()
  @IsBoolean()
  onlyPending?: boolean;
}

export class SchedulePlacementInterviewsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  threshold?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  applicationIds?: string[];

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
