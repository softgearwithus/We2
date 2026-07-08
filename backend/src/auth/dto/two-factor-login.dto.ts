import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class TwoFactorLoginDto {
  @IsString()
  @IsNotEmpty()
  twoFactorToken: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  code: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
