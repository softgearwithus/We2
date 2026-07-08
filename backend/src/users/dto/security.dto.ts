import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
    message: 'Password must include uppercase, lowercase, number, and symbol',
  })
  newPassword: string;
}

export class EnableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  code: string;
}

export class DisableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  code?: string;
}
