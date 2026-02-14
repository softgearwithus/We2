import { ApiProperty } from '@nestjs/swagger';
import {
    SimulationType,
    SimulationStatus,
    SimulationPhase,
} from '../entities/simulation.entity';

export class SimulationResponseDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Unique simulation ID',
    })
    id: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'User ID who owns this simulation',
    })
    userId: string;

    @ApiProperty({
        example: 'Full-Stack Development Journey',
        description: 'Simulation title',
    })
    title: string;

    @ApiProperty({
        example: '21-day intensive industry simulation',
        description: 'Simulation description',
    })
    description: string;

    @ApiProperty({
        enum: SimulationType,
        example: SimulationType.MODE_2_INDUSTRY,
        description: 'Type of simulation',
    })
    type: SimulationType;

    @ApiProperty({
        enum: SimulationStatus,
        example: SimulationStatus.IN_PROGRESS,
        description: 'Current status',
    })
    status: SimulationStatus;

    @ApiProperty({
        example: 5,
        description: 'Current day (1-21)',
    })
    currentDay: number;

    @ApiProperty({
        enum: SimulationPhase,
        example: SimulationPhase.TRAINING,
        description: 'Current phase',
        nullable: true,
    })
    currentPhase: SimulationPhase | null;

    @ApiProperty({
        example: '2026-02-10T00:00:00.000Z',
        description: 'Start date',
        nullable: true,
    })
    startDate: Date | null;

    @ApiProperty({
        example: null,
        description: 'End date (null if not completed)',
        nullable: true,
    })
    endDate: Date | null;

    @ApiProperty({
        example: 85,
        description: 'Overall score (0-100)',
        nullable: true,
    })
    score: number | null;

    @ApiProperty({
        example: { notes: 'Great progress' },
        description: 'Additional metadata',
        nullable: true,
    })
    metadata: Record<string, any> | null;

    @ApiProperty({
        example: null,
        description: 'Team ID if part of a team',
        nullable: true,
    })
    teamId: string | null;

    @ApiProperty({
        example: '2026-02-10T00:00:00.000Z',
        description: 'Creation timestamp',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2026-02-10T00:00:00.000Z',
        description: 'Last update timestamp',
    })
    updatedAt: Date;
}
