import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { SqlSubmissionSource, SqlSubmissionStatus } from '../entities/sql-submission.entity';

export class CreateSqlSubmissionDto {
    @ApiProperty({ example: 'problem-slug or uuid' })
    @IsString()
    problemId: string;

    @ApiProperty({ example: 'sql', enum: ['sql'] })
    @IsString()
    language: string;

    @ApiProperty({ example: 'SELECT * FROM products;' })
    @IsString()
    code: string;

    @ApiProperty({ enum: SqlSubmissionStatus, example: SqlSubmissionStatus.ACCEPTED })
    @IsEnum(SqlSubmissionStatus)
    status: SqlSubmissionStatus;

    @ApiProperty({ enum: SqlSubmissionSource, example: SqlSubmissionSource.PRACTICE, required: false })
    @IsOptional()
    @IsEnum(SqlSubmissionSource)
    source?: SqlSubmissionSource;

    @ApiProperty({ example: 1 })
    @IsInt()
    passedTests: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    totalTests: number;

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
