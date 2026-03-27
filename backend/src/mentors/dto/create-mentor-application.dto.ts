import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMentorApplicationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(200)
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  feePerMinuteInr: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expertise?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  offerings?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalExperience?: string;
}
