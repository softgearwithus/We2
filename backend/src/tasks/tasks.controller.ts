import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { UserRole } from '../users/user.entity';

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Create a new task (Admin/AI only)' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Simulation not active' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks for a simulation' })
  @ApiQuery({
    name: 'simulationId',
    required: true,
    description: 'Simulation UUID',
  })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  async findBySimulation(
    @Query('simulationId') simulationId: string,
    @Request() req: any,
  ) {
    return this.tasksService.findBySimulation(simulationId, req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Get all tasks (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all tasks' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics for a simulation' })
  @ApiQuery({
    name: 'simulationId',
    required: true,
    description: 'Simulation UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Task statistics',
    schema: {
      example: {
        total: 10,
        todo: 3,
        inProgress: 2,
        review: 1,
        completed: 4,
        failed: 0,
        totalPoints: 400,
        averageCompletionTime: 3.5,
      },
    },
  })
  async getStats(
    @Query('simulationId') simulationId: string,
    @Request() req: any,
  ) {
    return this.tasksService.getStats(simulationId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a task solution' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task submitted successfully' })
  @ApiResponse({ status: 400, description: 'Task already completed' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async submit(
    @Param('id') id: string,
    @Request() req: any,
    @Body('submissionContent') submissionContent: string,
  ) {
    return this.tasksService.submit(id, req.user.id, submissionContent);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update completed task' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, req.user.id, updateTaskDto);
  }
}
