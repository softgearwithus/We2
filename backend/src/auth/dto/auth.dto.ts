import { IsEmail, IsNotEmpty, MinLength, IsOptional, Matches, MaxLength, IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'John',
        description: 'First name',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    firstName?: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Last name',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    lastName?: string;

    @ApiProperty({
        example: 'student@example.com',
        description: 'User email address or UID',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'One-time password for student signup',
        required: false,
    })
    @IsOptional()
    @IsString()
    otp?: string;

    @ApiProperty({
        example: 'SecurePass123!',
        description: 'User password (minimum 8 characters)',
        minLength: 8,
    })
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
        message: 'Password must include uppercase, lowercase, number, and symbol',
    })
    password: string;

    @ApiProperty({
        example: 'student',
        description: 'User role (student, college_admin, company_admin)',
        required: false,
    })
    @IsOptional()
    @IsIn(['student', 'college_admin', 'company_admin'])
    role?: string;

    @ApiProperty({
        example: 'standard',
        description: 'Selected subscription plan',
        required: false,
    })
    @IsOptional()
    @IsString()
    subscriptionPlan?: string;

    @ApiProperty({
        example: 'Asia/Kolkata',
        description: 'User timezone',
        required: false,
    })
    @IsOptional()
    @IsString()
    timezone?: string;
}

export class RequestOtpDto {
    @ApiProperty({
        example: 'student@example.com',
        description: 'Email address for OTP delivery',
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;
}

export class VerifyOtpDto {
    @ApiProperty({
        example: 'student@example.com',
        description: 'Email address for OTP verification',
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'One-time password sent to email',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(12)
    otp: string;
}

export class RequestPasswordResetDto {
    @ApiProperty({
        example: 'student@example.com',
        description: 'Student email address or credential ID',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    identifier: string;
}

export class ResetPasswordDto {
    @ApiProperty({
        example: 'student@example.com',
        description: 'Student email address or credential ID',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    identifier: string;

    @ApiProperty({
        example: '123456',
        description: 'One-time password sent to email',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(12)
    otp: string;

    @ApiProperty({
        example: 'SecurePass123!',
        description: 'New password (minimum 8 characters)',
        minLength: 8,
    })
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
        message: 'Password must include uppercase, lowercase, number, and symbol',
    })
    newPassword: string;
}


export class LoginDto {
    @ApiProperty({
        example: 'student@example.com',
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        example: 'SecurePass123!',
        description: 'User password',
    })
    @IsNotEmpty()
    @MaxLength(72)
    password: string;

    @ApiProperty({
        example: 'student',
        description: 'Optional portal role for login validation',
        required: false,
    })
    @IsOptional()
    @IsIn(['student', 'college_admin', 'company_admin', 'super_admin'])
    role?: string;

    @ApiProperty({
        example: true,
        description: 'Remember me flag to extend session duration',
        required: false,
    })
    @IsOptional()
    rememberMe?: boolean;
}
