import { IsString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AchievementCategory } from '../entities/achievement.entity';

export class CreateAchievementDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsString()
    userId: string;

    @ApiProperty({ example: 'First Sprint Complete' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Completed your first sprint with all tasks done.' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'trophy', required: false })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ enum: AchievementCategory, example: AchievementCategory.MILESTONE })
    @IsEnum(AchievementCategory)
    category: AchievementCategory;

    @ApiProperty({ example: 250, minimum: 0 })
    @IsInt()
    @Min(0)
    xp: number;
}
