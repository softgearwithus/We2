import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
    @ApiProperty({ example: 'Dr. Ramesh Kumar' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'name@college.edu.in' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'college_admin' })
    @IsString()
    role: string;

    @ApiProperty({ example: 'College Admin', required: false })
    @IsOptional()
    @IsString()
    roleLabel?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    year?: string;
}
