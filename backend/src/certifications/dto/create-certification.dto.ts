import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCertificationDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    simulationId: string;

    @ApiProperty({ example: 'Full-Stack Development Certification' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Completed 21-day industry simulation' })
    @IsString()
    description: string;

    @ApiProperty({
        example: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    skills: string[];

    @ApiProperty({ example: 'https://simulation.example.com/pdf/cert-123.pdf', required: false })
    @IsOptional()
    @IsString()
    certificateUrl?: string;
}
