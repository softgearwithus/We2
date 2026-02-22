import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewStatus } from '../entities/interview-session.entity';

export class UpdateInterviewDto {
    @ApiProperty({
        enum: InterviewStatus,
        example: InterviewStatus.IN_PROGRESS,
        required: false,
    })
    @IsOptional()
    @IsEnum(InterviewStatus)
    status?: InterviewStatus;

    @ApiProperty({
        example: 85,
        description: 'Overall interview score',
        minimum: 0,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    overallScore?: number;

    @ApiProperty({
        example: 'Great technical knowledge, needs to work on communication',
        required: false,
    })
    @IsOptional()
    aiInterviewer?: string;

    @ApiProperty({
        example: 540,
        description: 'Session duration in seconds',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    duration?: number;
}
