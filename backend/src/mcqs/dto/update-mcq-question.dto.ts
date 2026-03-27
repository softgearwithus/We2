import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsBoolean,
} from 'class-validator';
import { McqCategory } from '../entities/mcq-question.entity';

export class UpdateMcqQuestionDto {
  @ApiProperty({ enum: McqCategory, required: false })
  @IsOptional()
  @IsEnum(McqCategory)
  category?: McqCategory;

  @ApiProperty({
    example: 'english',
    description: 'Subject key or company name',
    required: false,
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiProperty({
    example: 'arrays',
    description: 'Topic name for company MCQs',
    required: false,
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({
    example: 60,
    description: 'Duration in minutes constraint for the module',
    required: false,
  })
  @IsOptional()
  @IsInt()
  topicDurationMinutes?: number;

  @ApiProperty({
    example: 'Which sentence is grammatically correct?',
    required: false,
  })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({
    example: ['She is going to school.', 'She are going to school.'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  options?: string[];

  @ApiProperty({
    example: 0,
    description: 'Zero-based index of correct option',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  correctOptionIndex?: number;

  @ApiProperty({
    example: false,
    description: 'Override flag for NEW badge',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}
