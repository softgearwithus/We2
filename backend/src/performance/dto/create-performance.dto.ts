import { IsUUID, IsEnum, IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PerformanceCategory } from '../entities/performance.entity';

export class CreatePerformanceDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', required: false })
    @IsOptional()
    @IsUUID()
    taskId?: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002', required: false })
    @IsOptional()
    @IsUUID()
    simulationId?: string;

    @ApiProperty({
        enum: PerformanceCategory,
        example: PerformanceCategory.TECHNICAL,
    })
    @IsEnum(PerformanceCategory)
    category: PerformanceCategory;

    @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
    @IsInt()
    @Min(0)
    @Max(100)
    score: number;

    @ApiProperty({ example: 'Strong problem-solving skills demonstrated' })
    @IsString()
    feedback: string;

    @ApiProperty({ example: 'AI', description: '"AI" or a user UUID' })
    @IsString()
    evaluatedBy: string;
}
