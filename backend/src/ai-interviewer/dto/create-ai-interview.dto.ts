import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewDifficulty } from '../../interviews/entities/interview-session.entity';

export class CreateAiInterviewDto {
  @ApiProperty({ description: 'Interview session id' })
  @IsUUID()
  interviewSessionId: string;

  @ApiProperty({
    description: 'Resume document id (required to start interview)',
  })
  @IsUUID()
  resumeId: string;

  @ApiProperty({ description: 'Target role', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: 'Optional company context', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Interview difficulty', required: false, enum: InterviewDifficulty })
  @IsOptional()
  @IsEnum(InterviewDifficulty)
  difficulty?: InterviewDifficulty;
}
