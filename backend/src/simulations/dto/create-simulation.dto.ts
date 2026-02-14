import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SimulationType } from '../entities/simulation.entity';

export class CreateSimulationDto {
    @ApiProperty({
        example: 'Full-Stack Development Journey',
        description: 'Title of the simulation',
    })
    @IsString()
    title: string;

    @ApiProperty({
        example: '21-day intensive industry simulation for software development',
        description: 'Detailed description of the simulation',
    })
    @IsString()
    description: string;

    @ApiProperty({
        enum: SimulationType,
        example: SimulationType.MODE_2_INDUSTRY,
        description: 'Type of simulation (placement prep or industry experience)',
    })
    @IsEnum(SimulationType)
    type: SimulationType;

    @ApiProperty({
        example: null,
        description: 'Optional team ID if this is a team simulation',
        required: false,
    })
    @IsOptional()
    @IsString()
    teamId?: string;
}
