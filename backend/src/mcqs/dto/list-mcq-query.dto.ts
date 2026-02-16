import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { McqCategory } from '../entities/mcq-question.entity';

export enum McqOrder {
    LATEST = 'latest',
    OLDEST = 'oldest',
    RANDOM = 'random',
}

export class ListMcqQueryDto {
    @ApiPropertyOptional({ enum: McqCategory })
    @IsEnum(McqCategory)
    category: McqCategory;

    @ApiPropertyOptional({ description: 'Subject key or company key' })
    @IsString()
    groupKey: string;

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
