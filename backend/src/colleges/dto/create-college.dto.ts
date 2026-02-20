import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCollegeDto {
    @ApiProperty({ example: 'IIT Bombay' })
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 'IITB', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    code?: string;

    @ApiProperty({ example: 'Mumbai', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    city?: string;

    @ApiProperty({ example: 'Maharashtra', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    state?: string;

    @ApiProperty({ example: 'admin@iitb.ac.in', required: false })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    contactEmail?: string;
}
