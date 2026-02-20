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
        description: 'User email address',
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

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
        example: 'a1b2c3d4-5678-9012-3456-7890abcd1234',
        description: 'College/Institute identifier (optional)',
        required: false,
    })
    @IsOptional()
    @IsString()
    collegeId?: string;

    @ApiProperty({
        example: 'placement_plus',
        description: 'Selected subscription plan',
        required: false,
    })
    @IsOptional()
    @IsIn(['free', 'placement_plus', 'industry_plus', 'we2_max'])
    subscriptionPlan?: string;
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
}
