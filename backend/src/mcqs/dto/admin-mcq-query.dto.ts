import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { McqCategory } from '../entities/mcq-question.entity';
import { McqOrder } from './list-mcq-query.dto';

export class AdminMcqQueryDto {
    @ApiPropertyOptional({ enum: McqCategory })
    @IsOptional()
    @IsEnum(McqCategory)
    category?: McqCategory;

    @ApiPropertyOptional({ description: 'Subject key or company key' })
    @IsOptional()
    @IsString()
    groupKey?: string;

    @ApiPropertyOptional({ description: 'Search question or group label' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ default: 50, maximum: 100 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @ApiPropertyOptional({ enum: McqOrder, default: McqOrder.LATEST })
    @IsOptional()
    @IsEnum(McqOrder)
    order?: McqOrder;
}
