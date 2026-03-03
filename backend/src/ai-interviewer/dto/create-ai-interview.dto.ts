import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiInterviewDto {
    @ApiProperty({ description: 'Interview session id' })
    @IsUUID()
    interviewSessionId: string;

    @ApiProperty({ description: 'Resume document id (required to start interview)' })
    @IsUUID()
    resumeId: string;

    @ApiProperty({ description: 'Target role', required: false })
    @IsOptional()
    @IsString()
    role?: string;
}
