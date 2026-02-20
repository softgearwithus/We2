import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateReviewDto {
    @ApiProperty({ example: 'approved', enum: ['pending', 'in_review', 'approved', 'needs_changes', 'published'] })
    @IsOptional()
    @IsIn(['pending', 'in_review', 'approved', 'needs_changes', 'published'])
    status?: 'pending' | 'in_review' | 'approved' | 'needs_changes' | 'published';

    @ApiProperty({ example: 85, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    score?: number;

    @ApiProperty({ example: 'Solid structure, improve edge cases.', required: false })
    @IsOptional()
    @IsString()
    feedback?: string;

    @ApiProperty({ example: 'Add tests for negative cases.', required: false })
    @IsOptional()
    @IsString()
    reviewerNotes?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @ApiProperty({ example: false, required: false })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiProperty({ example: 'Updated review title', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;
}
