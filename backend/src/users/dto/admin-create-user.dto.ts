import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AdminCreateUserDto {
    @ApiProperty({ example: 'student@example.com' })
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
        message: 'Password must include uppercase, lowercase, number, and symbol',
    })
    password: string;

    @ApiProperty({ example: 'student', enum: ['student', 'college_admin', 'company_admin'] })
    @IsIn(['student', 'college_admin', 'company_admin'])
    role: string;

    @ApiProperty({ example: 'Jane', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @ApiProperty({ example: 'a1b2c3d4-5678-9012-3456-7890abcd1234', required: false })
    @IsOptional()
    @IsString()
    collegeId?: string;
}
