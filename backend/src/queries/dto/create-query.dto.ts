import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateQueryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
