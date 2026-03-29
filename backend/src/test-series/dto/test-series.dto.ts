import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsInt,
  IsArray,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}

export class BulkQuestionsDto {
  @IsArray()
  @IsNotEmpty()
  questions: any[];
}

class SubmitMockTestResponseDto {
  @IsUUID()
  questionId: string;

  @IsString()
  responseValue: string;

  @IsInt()
  @Min(0)
  timeSpentSeconds: number;
}

class SubjectPracticeQuestionRefDto {
  @IsUUID()
  id: string;
}

class SubjectPracticeResponseDto {
  @ValidateNested()
  @Type(() => SubjectPracticeQuestionRefDto)
  question: SubjectPracticeQuestionRefDto;

  @IsString()
  responseValue: string;
}

export class SubmitMockTestDto {
  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitMockTestResponseDto)
  responses: SubmitMockTestResponseDto[];
}

export class SubmitSubjectPracticeDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  timeTakenSeconds: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectPracticeResponseDto)
  responses: SubjectPracticeResponseDto[];
}
