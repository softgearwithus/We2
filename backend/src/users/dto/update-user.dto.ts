import { IsEmail, IsOptional, MinLength, MaxLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({
        example: 'newemail@example.com',
        description: 'User email address',
        required: false,
    })
    @IsOptional()
    @IsEmail()
    email?: string;

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
        example: 'NewSecurePass123!',
        description: 'New password (minimum 8 characters)',
        minLength: 8,
        required: false,
    })
    @IsOptional()
    @MinLength(8)
    password?: string;

    @ApiProperty({ required: false, example: 'Asia/Kolkata' })
    @IsOptional()
    @IsString()
    timezone?: string;

    @ApiProperty({ required: false, example: 'https://example.com/avatar.png' })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiProperty({ required: false, example: 'alex_codes' })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ required: false, example: 'Full Stack Engineer' })
    @IsOptional()
    @IsString()
    roleTitle?: string;

    @ApiProperty({ required: false, example: 'San Francisco, CA' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false, example: 'Building scalable web apps.' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiProperty({ required: false, example: 'https://alex.dev' })
    @IsOptional()
    @IsString()
    websiteUrl?: string;

    @ApiProperty({ required: false, example: 'https://github.com/alexcodes' })
    @IsOptional()
    @IsString()
    githubUrl?: string;

    @ApiProperty({ required: false, example: 'https://linkedin.com/in/alexj' })
    @IsOptional()
    @IsString()
    linkedinUrl?: string;

    @ApiProperty({ required: false, example: true })
    @IsOptional()
    isTwoFactorEnabled?: boolean;
}
