import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateTestimonialDto {
    @ApiProperty({ example: 'Updated title', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({ example: 'Updated role', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    role?: string;

    @ApiProperty({ example: 'https://images...', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(512)
    image?: string;

    @ApiProperty({ example: '₹40 LPA', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    package?: string;

    @ApiProperty({ example: 'Updated testimonial text', required: false })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    verified?: boolean;

    @ApiProperty({ example: false, required: false })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ example: 2, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
