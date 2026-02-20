import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTestimonialDto {
    @ApiProperty({ example: 'Aditya Verma' })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 'SDE-1 at Amazon' })
    @IsString()
    @MaxLength(255)
    role: string;

    @ApiProperty({ example: 'https://images...' })
    @IsString()
    @MaxLength(512)
    image: string;

    @ApiProperty({ example: '₹45 LPA', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    package?: string;

    @ApiProperty({ example: 'Reviewing my resume...' })
    @IsString()
    text: string;

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

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
