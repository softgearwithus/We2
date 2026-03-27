import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCollegeDto {
  @ApiProperty({ example: 'MIT Pune' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CLGMIT001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Pune, Maharashtra', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: ['Y1', 'Y2', 'Y3', 'Y4'] })
  @IsArray()
  years: string[];

  @ApiProperty({ example: ['CSE', 'ECE', 'ME'] })
  @IsArray()
  departments: string[];

  @ApiProperty({ example: 'admin@college.edu', required: false })
  @IsOptional()
  @IsString()
  adminEmail?: string;
}
