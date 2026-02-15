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
}
