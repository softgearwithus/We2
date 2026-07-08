import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class AttachHiringAssessmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  stageName?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsObject()
  contextSnapshot?: Record<string, any>;
}
