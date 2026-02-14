import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    SimulationStatus,
    SimulationPhase,
} from '../entities/simulation.entity';

export class UpdateSimulationDto {
    @ApiProperty({
        example: 'Updated Simulation Title',
        description: 'New title for the simulation',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        example: 'Updated description',
        description: 'New description for the simulation',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        enum: SimulationStatus,
        example: SimulationStatus.IN_PROGRESS,
        description: 'Current status of the simulation',
        required: false,
    })
    @IsOptional()
    @IsEnum(SimulationStatus)
    status?: SimulationStatus;

    @ApiProperty({
        example: 5,
        description: 'Current day in the simulation (1-21)',
        minimum: 0,
        maximum: 21,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(21)
    currentDay?: number;

    @ApiProperty({
        enum: SimulationPhase,
        example: SimulationPhase.TRAINING,
        description: 'Current phase of the simulation',
        required: false,
    })
    @IsOptional()
    @IsEnum(SimulationPhase)
    currentPhase?: SimulationPhase;

    @ApiProperty({
        example: 85,
        description: 'Overall simulation score (0-100)',
        minimum: 0,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    score?: number;

    @ApiProperty({
        example: { notes: 'Great progress', milestones: ['Day 1 complete'] },
        description: 'Flexible metadata for storing additional information',
        required: false,
    })
    @IsOptional()
    metadata?: Record<string, any>;
}
