import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SqlDifficulty, SqlPlatform } from '../entities/sql-problem.entity';

export enum SqlProblemOrder {
    LATEST = 'latest',
    OLDEST = 'oldest',
}

export class AdminSqlProblemQueryDto {
    @ApiPropertyOptional({ enum: SqlDifficulty })
    @IsOptional()
    @IsEnum(SqlDifficulty)
    difficulty?: SqlDifficulty;

    @ApiPropertyOptional({ enum: SqlPlatform })
    @IsOptional()
    @IsEnum(SqlPlatform)
    platform?: SqlPlatform;

    @ApiPropertyOptional({ description: 'Category tag from SQL dataset' })
    @IsOptional()
    @IsString()
    category?: string;

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

    @ApiPropertyOptional({ enum: SqlProblemOrder, default: SqlProblemOrder.LATEST })
    @IsOptional()
    @IsEnum(SqlProblemOrder)
    order?: SqlProblemOrder;
}
