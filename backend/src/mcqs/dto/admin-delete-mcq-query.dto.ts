import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { McqCategory } from '../entities/mcq-question.entity';

export class AdminDeleteMcqQueryDto {
  @ApiPropertyOptional({ enum: ['subject', 'company'] })
  @IsOptional()
  @IsEnum(McqCategory)
  category?: McqCategory;

  @ApiPropertyOptional({ description: 'Group key or label' })
  @IsOptional()
  @IsString()
  groupKey?: string;

  @ApiPropertyOptional({ description: 'Search in question or group label' })
  @IsOptional()
  @IsString()
  search?: string;
}
