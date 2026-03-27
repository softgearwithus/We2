import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { McqCategory } from '../entities/mcq-question.entity';

export class AdminUpdateDurationDto {
  @ApiProperty({ enum: ['subject', 'company'] })
  @IsOptional()
  @IsEnum(McqCategory)
  category?: McqCategory;

  @ApiProperty({ description: 'Group key or label' })
  @IsOptional()
  @IsString()
  groupKey?: string;

  @ApiProperty({ description: 'Topic key for company MCQs' })
  @IsOptional()
  @IsString()
  topicKey?: string;

  @ApiProperty({ description: 'New Duration' })
  @IsInt()
  @IsNotEmpty()
  durationMinutes: number;
}
