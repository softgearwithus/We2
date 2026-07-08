import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  placementId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  candidateName: string;

  @IsEmail()
  @IsNotEmpty()
  candidateEmail: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  candidatePhone: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  candidateDepartment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  candidateYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  candidateLocation?: string;

  @IsOptional()
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: 'LinkedIn URL must start with https://.' },
  )
  @MaxLength(255)
  candidateLinkedinUrl?: string;

  @IsOptional()
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: 'Resume link must start with https://.' },
  )
  resumeDriveUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  inviteToken?: string;
}
