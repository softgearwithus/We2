import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCompanyAdminDto {
  @ApiProperty({ example: 'Acme Hiring Team' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'hr@acme.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Minimum 8 chars with uppercase, lowercase, number, symbol',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
    message: 'Password must include uppercase, lowercase, number, and symbol',
  })
  password: string;

  @ApiProperty({ example: 'Manager', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ example: 'Asia/Kolkata', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;
}
