import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyLead } from './entities/company-lead.entity';
import { CreateCompanyLeadDto } from './dto/create-company-lead.dto';

@Injectable()
export class CompanyLeadsService {
    constructor(
        @InjectRepository(CompanyLead)
        private leadsRepository: Repository<CompanyLead>,
    ) { }

    async create(createDto: CreateCompanyLeadDto): Promise<CompanyLead> {
        const lead = this.leadsRepository.create(createDto);
        return this.leadsRepository.save(lead);
    }

    async findAll(): Promise<CompanyLead[]> {
        return this.leadsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<CompanyLead> {
        const lead = await this.leadsRepository.findOne({ where: { id } });
        if (!lead) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }
        return lead;
    }

    async updateStatus(id: string, status: any): Promise<CompanyLead> {
        const lead = await this.findOne(id);
        lead.status = status;
        return this.leadsRepository.save(lead);
    }
}
