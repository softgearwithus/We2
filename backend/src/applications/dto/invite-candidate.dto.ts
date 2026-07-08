import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InviteCandidateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  candidateName: string;

  @IsEmail()
  candidateEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  candidatePhone?: string;

  @IsOptional()
  @IsUUID()
  assessmentId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
