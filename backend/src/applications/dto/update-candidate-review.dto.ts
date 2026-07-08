import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  CandidatePipelineStage,
  CandidateReviewDecision,
} from '../entities/application.entity';

export class UpdateCandidateReviewDto {
  @IsOptional()
  @IsEnum(CandidatePipelineStage)
  pipelineStage?: CandidatePipelineStage;

  @IsOptional()
  @IsEnum(CandidateReviewDecision)
  reviewDecision?: CandidateReviewDecision;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @IsOptional()
  @IsString()
  submissionSummary?: string;
}
