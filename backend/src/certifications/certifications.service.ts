import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import * as crypto from 'crypto';

@Injectable()
export class CertificationsService {
    constructor(
        @InjectRepository(Certification)
        private certsRepo: Repository<Certification>,
    ) { }

    async create(dto: CreateCertificationDto): Promise<Certification> {
        const cert = this.certsRepo.create({
            ...dto,
            verificationCode: this.generateVerificationCode(),
            issuedAt: new Date(),
        });
        return this.certsRepo.save(cert);
    }

    async findByUser(userId: string): Promise<Certification[]> {
        return this.certsRepo.find({
            where: { userId },
            order: { issuedAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Certification> {
        const cert = await this.certsRepo.findOne({ where: { id } });
        if (!cert) {
            throw new NotFoundException(`Certification ${id} not found`);
        }
        return cert;
    }

    async verify(code: string): Promise<Certification> {
        const cert = await this.certsRepo.findOne({
            where: { verificationCode: code },
            relations: ['user', 'simulation'],
        });
        if (!cert) {
            throw new NotFoundException('Invalid verification code');
        }
        return cert;
    }

    async findAll(): Promise<Certification[]> {
        return this.certsRepo.find({
            order: { issuedAt: 'DESC' },
            take: 100,
        });
    }

    private generateVerificationCode(): string {
        return crypto.randomBytes(8).toString('hex').toUpperCase();
    }
}
