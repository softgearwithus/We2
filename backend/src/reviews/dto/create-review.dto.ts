import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ example: 'Portfolio Review' })
    @IsString()
    @MaxLength(255)
    title: string;

    @ApiProperty({ example: 'Please review my portfolio for frontend roles.' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'code_review', enum: ['code_review', 'resume', 'project', 'general'] })
    @IsIn(['code_review', 'resume', 'project', 'general'])
    type: 'code_review' | 'resume' | 'project' | 'general';

    @ApiProperty({ example: 'student', enum: ['student', 'mentor', 'admin'] })
    @IsOptional()
    @IsIn(['student', 'mentor', 'admin'])
    source?: 'student' | 'mentor' | 'admin';

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    score?: number;

    @ApiProperty({ example: false, required: false })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @ApiProperty({ example: false, required: false })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiProperty({ example: {}, required: false })
    @IsOptional()
    metadata?: Record<string, any>;
}
