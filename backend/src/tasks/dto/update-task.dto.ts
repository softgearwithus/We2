import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Updated task title',
    description: 'New task title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'New task description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Task status',
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.CRITICAL,
    description: 'Task priority',
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    example: 'Submitted code with unit tests',
    description: 'Task submission content',
    required: false,
  })
  @IsOptional()
  @IsString()
  submissionContent?: string;

  @ApiProperty({
    example: 6,
    description: 'Actual hours spent on task',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualHours?: number;
}
