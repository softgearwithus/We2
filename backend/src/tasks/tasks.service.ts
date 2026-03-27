import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import {
  Simulation,
  SimulationStatus,
} from '../simulations/entities/simulation.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Simulation)
    private simulationsRepository: Repository<Simulation>,
  ) {}

  /**
   * Create a new task (typically by AI or admin)
   */
  async create(
    createTaskDto: CreateTaskDto,
    assignedBy?: string,
  ): Promise<Task> {
    // Verify simulation exists and is active
    const simulation = await this.simulationsRepository.findOne({
      where: { id: createTaskDto.simulationId },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    if (simulation.status !== SimulationStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot add tasks to inactive simulations');
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      assignedBy,
      deadline: new Date(createTaskDto.deadline),
    });

    return this.tasksRepository.save(task);
  }

  /**
   * Get all tasks for a simulation
   */
  async findBySimulation(
    simulationId: string,
    userId: string,
  ): Promise<Task[]> {
    // Verify user owns the simulation
    const simulation = await this.simulationsRepository.findOne({
      where: { id: simulationId },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    if (simulation.userId !== userId) {
      throw new ForbiddenException('Access denied to this simulation');
    }

    return this.tasksRepository.find({
      where: { simulationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single task by ID
   */
  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['simulation'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify ownership through simulation
    if (task.simulation.userId !== userId) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  /**
   * Update a task (submit, change status, etc.)
   */
  async update(
    id: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Business logic: Can't update completed/failed tasks
    if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.FAILED
    ) {
      throw new BadRequestException('Cannot update completed or failed tasks');
    }

    // Auto-set completedAt when status changes to COMPLETED
    if (updateTaskDto.status === TaskStatus.COMPLETED) {
      task.completedAt = new Date();

      // Generate AI feedback placeholder
      if (!task.feedback) {
        task.feedback = 'Great work! Task completed successfully.';
      }
    }

    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  /**
   * Submit a task solution
   */
  async submit(
    id: string,
    userId: string,
    submissionContent: string,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Task already completed');
    }

    task.submissionContent = submissionContent;
    task.status = TaskStatus.REVIEW;

    return this.tasksRepository.save(task);
  }

  /**
   * Get task statistics for a simulation
   */
  async getStats(simulationId: string, userId: string) {
    const tasks = await this.findBySimulation(simulationId, userId);

    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,
      review: tasks.filter((t) => t.status === TaskStatus.REVIEW).length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      failed: tasks.filter((t) => t.status === TaskStatus.FAILED).length,
      totalPoints: tasks
        .filter((t) => t.status === TaskStatus.COMPLETED)
        .reduce((acc, t) => acc + t.points, 0),
      averageCompletionTime:
        tasks
          .filter((t) => t.actualHours !== null)
          .reduce((acc, t) => acc + (t.actualHours || 0), 0) /
          tasks.filter((t) => t.actualHours !== null).length || 0,
    };
  }

  /**
   * Admin: Get all tasks
   */
  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
