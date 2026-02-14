import {
    IsEnum,
    IsUUID,
    IsOptional,
    IsString,
    IsInt,
    Min,
    Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    InterviewType,
    InterviewDifficulty,
} from '../entities/interview-session.entity';

export class CreateInterviewDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'User ID taking the interview',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        enum: InterviewType,
        example: InterviewType.TECHNICAL,
        description: 'Type of interview',
    })
    @IsEnum(InterviewType)
    type: InterviewType;

    @ApiProperty({
        enum: InterviewDifficulty,
        example: InterviewDifficulty.INTERMEDIATE,
        description: 'Interview difficulty level',
    })
    @IsEnum(InterviewDifficulty)
    difficulty: InterviewDifficulty;

    @ApiProperty({
        example: 'Senior Software Engineer',
        description: 'Target job role',
        required: false,
    })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({
        example: 'Google',
        description: 'Target company',
        required: false,
    })
    @IsOptional()
    @IsString()
    company?: string;

    @ApiProperty({
        example: 45,
        description: 'Expected duration in minutes',
        minimum: 15,
        maximum: 120,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(15)
    @Max(120)
    duration?: number;
}
