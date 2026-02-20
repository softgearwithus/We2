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

    @ApiProperty({
        example: 'pro_tier',
        description: 'Subscription plan identifier',
        required: false,
    })
    @IsOptional()
    @IsString()
    subscriptionPlan?: string;

    @ApiProperty({
        example: 'active',
        description: 'Subscription status',
        required: false,
    })
    @IsOptional()
    @IsString()
    subscriptionStatus?: string;

    @ApiProperty({
        example: '2027-02-20T00:00:00.000Z',
        description: 'Subscription end date (ISO string)',
        required: false,
    })
    @IsOptional()
    @IsString()
    subscriptionEndDate?: string;

    @ApiProperty({
        example: 'a1b2c3d4-5678-9012-3456-7890abcd1234',
        description: 'College/Institute identifier',
        required: false,
    })
    @IsOptional()
    @IsString()
    collegeId?: string;
}
