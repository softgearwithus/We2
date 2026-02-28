import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { SubmissionSource, SubmissionStatus } from '../entities/submission.entity';

export class CreateSubmissionDto {
    @ApiProperty({ example: 'problem-slug or uuid' })
    @IsString()
    problemId: string;

    @ApiProperty({ example: 'javascript', enum: ['javascript', 'python', 'java'] })
    @IsString()
    language: string;

    @ApiProperty({ example: 'var twoSum = function(nums, target) { ... }' })
    @IsString()
    code: string;

    @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.ACCEPTED, required: false })
    @IsOptional()
    @IsEnum(SubmissionStatus)
    status?: SubmissionStatus;

    @ApiProperty({ enum: SubmissionSource, example: SubmissionSource.PRACTICE, required: false })
    @IsOptional()
    @IsEnum(SubmissionSource)
    source?: SubmissionSource;

    @ApiProperty({ example: 3, required: false })
    @IsOptional()
    @IsInt()
    passedTests?: number;

    @ApiProperty({ example: 5, required: false })
    @IsOptional()
    @IsInt()
    totalTests?: number;

    @ApiProperty({ example: 85, required: false })
    @IsOptional()
    @IsInt()
    score?: number;

    @ApiProperty({ example: '45ms', required: false })
    @IsOptional()
    @IsString()
    runtime?: string;

    @ApiProperty({ example: '34.2MB', required: false })
    @IsOptional()
    @IsString()
    memory?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    error?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    failedCase?: {
        input: string;
        expected: string;
        actual: string;
    };
}
