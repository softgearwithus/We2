import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Difficulty, ProblemCategory, DsaPlatform } from '../entities/dsa-problem.entity';

export enum ProblemOrder {
    LATEST = 'latest',
    OLDEST = 'oldest',
}

export class AdminDsaProblemQueryDto {
    @ApiPropertyOptional({ enum: Difficulty })
    @IsOptional()
    @IsEnum(Difficulty)
    difficulty?: Difficulty;

    @ApiPropertyOptional({ enum: ProblemCategory })
    @IsOptional()
    @IsEnum(ProblemCategory)
    category?: ProblemCategory;

    @ApiPropertyOptional({ enum: DsaPlatform })
    @IsOptional()
    @IsEnum(DsaPlatform)
    platform?: DsaPlatform;

    @ApiPropertyOptional({ description: 'Search by title or slug' })
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

    @ApiPropertyOptional({ enum: ProblemOrder, default: ProblemOrder.LATEST })
    @IsOptional()
    @IsEnum(ProblemOrder)
    order?: ProblemOrder;
}
