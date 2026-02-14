import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'student@example.com',
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'SecurePass123!',
        description: 'User password (minimum 8 characters)',
        minLength: 8,
    })
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @ApiProperty({
        example: 'student',
        description: 'User role (student, college_admin, company_admin)',
        required: false,
    })
    @IsOptional()
    role?: string;

    @ApiProperty({
        example: 'placement_plus',
        description: 'Selected subscription plan',
        required: false,
    })
    @IsOptional()
    subscriptionPlan?: string;
}

export class LoginDto {
    @ApiProperty({
        example: 'student@example.com',
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'SecurePass123!',
        description: 'User password',
    })
    @IsNotEmpty()
    password: string;
}
