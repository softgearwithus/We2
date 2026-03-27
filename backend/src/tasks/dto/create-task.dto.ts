import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TaskType,
  TaskPriority,
  TaskDifficulty,
} from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Simulation ID this task belongs to',
  })
  @IsUUID()
  simulationId: string;

  @ApiProperty({
    example: 'Fix login bug in authentication module',
    description: 'Task title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'Users are unable to login with correct credentials. Debug and fix the issue.',
    description: 'Detailed task description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    enum: TaskType,
    example: TaskType.BUG_FIX,
    description: 'Type of task',
  })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Task priority',
    default: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    enum: TaskDifficulty,
    example: TaskDifficulty.MEDIUM,
    description: 'Task difficulty level',
    default: TaskDifficulty.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskDifficulty)
  difficulty?: TaskDifficulty;

  @ApiProperty({
    example: '2026-02-15T23:59:59.000Z',
    description: 'Task deadline',
  })
  @IsString()
  deadline: string;

  @ApiProperty({
    example: 100,
    description: 'Points awarded for completing this task',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiProperty({
    example: 4,
    description: 'Estimated hours to complete',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedHours?: number;
}
