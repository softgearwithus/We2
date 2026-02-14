import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Simulation, SimulationStatus } from './entities/simulation.entity';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { UpdateSimulationDto } from './dto/update-simulation.dto';

@Injectable()
export class SimulationsService {
    constructor(
        @InjectRepository(Simulation)
        private simulationsRepository: Repository<Simulation>,
    ) { }

    /**
     * Create a new simulation for a user
     */
    async create(
        userId: string,
        createSimulationDto: CreateSimulationDto,
    ): Promise<Simulation> {
        // Check if user already has an active simulation
        const activeSimulation = await this.simulationsRepository.findOne({
            where: {
                userId,
                status: SimulationStatus.IN_PROGRESS,
            },
        });

        if (activeSimulation) {
            throw new BadRequestException(
                'You already have an active simulation. Complete or abandon it before starting a new one.',
            );
        }

        const simulation = this.simulationsRepository.create({
            ...createSimulationDto,
            userId,
            currentDay: 0,
            status: SimulationStatus.NOT_STARTED,
        });

        return this.simulationsRepository.save(simulation);
    }

    /**
     * Get all simulations for a user
     */
    async findAllByUser(userId: string): Promise<Simulation[]> {
        return this.simulationsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Get a single simulation by ID
     */
    async findOne(id: string, userId: string): Promise<Simulation> {
        const simulation = await this.simulationsRepository.findOne({
            where: { id },
            relations: ['tasks', 'team'],
        });

        if (!simulation) {
            throw new NotFoundException(`Simulation with ID ${id} not found`);
        }

        // Check ownership
        if (simulation.userId !== userId) {
            throw new ForbiddenException(
                'You do not have permission to access this simulation',
            );
        }

        return simulation;
    }

    /**
     * Update a simulation
     */
    async update(
        id: string,
        userId: string,
        updateSimulationDto: UpdateSimulationDto,
    ): Promise<Simulation> {
        const simulation = await this.findOne(id, userId);

        // Business logic: Can't update a completed simulation
        if (simulation.status === SimulationStatus.COMPLETED) {
            throw new BadRequestException(
                'Cannot update a completed simulation',
            );
        }

        // Update fields
        Object.assign(simulation, updateSimulationDto);

        // Auto-set dates based on status changes
        if (
            updateSimulationDto.status === SimulationStatus.IN_PROGRESS &&
            !simulation.startDate
        ) {
            simulation.startDate = new Date();
        }

        if (
            updateSimulationDto.status === SimulationStatus.COMPLETED ||
            updateSimulationDto.status === SimulationStatus.ABANDONED
        ) {
            simulation.endDate = new Date();
        }

        return this.simulationsRepository.save(simulation);
    }

    /**
     * Delete/Abandon a simulation
     */
    async remove(id: string, userId: string): Promise<void> {
        const simulation = await this.findOne(id, userId);

        // Mark as abandoned instead of deleting
        simulation.status = SimulationStatus.ABANDONED;
        simulation.endDate = new Date();

        await this.simulationsRepository.save(simulation);
    }

    /**
     * Start a simulation (change status from NOT_STARTED to IN_PROGRESS)
     */
    async start(id: string, userId: string): Promise<Simulation> {
        const simulation = await this.findOne(id, userId);

        if (simulation.status !== SimulationStatus.NOT_STARTED) {
            throw new BadRequestException(
                'Only simulations with NOT_STARTED status can be started',
            );
        }

        simulation.status = SimulationStatus.IN_PROGRESS;
        simulation.startDate = new Date();
        simulation.currentDay = 1;

        return this.simulationsRepository.save(simulation);
    }

    /**
     * Get simulation statistics for a user
     */
    async getStats(userId: string) {
        const simulations = await this.findAllByUser(userId);

        return {
            total: simulations.length,
            completed: simulations.filter(
                (s) => s.status === SimulationStatus.COMPLETED,
            ).length,
            inProgress: simulations.filter(
                (s) => s.status === SimulationStatus.IN_PROGRESS,
            ).length,
            abandoned: simulations.filter(
                (s) => s.status === SimulationStatus.ABANDONED,
            ).length,
            averageScore:
                simulations
                    .filter((s) => s.score !== null)
                    .reduce((acc, s) => acc + (s.score || 0), 0) /
                simulations.filter((s) => s.score !== null).length || 0,
        };
    }

    /**
     * Admin: Get all simulations (for admin dashboard)
     */
    async findAll(): Promise<Simulation[]> {
        return this.simulationsRepository.find({
            order: { createdAt: 'DESC' },
            take: 100, // Limit to prevent overwhelming queries
        });
    }
}
