import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { MockTest } from './entities/mock-test.entity';
import { MockTestSection } from './entities/mock-test-section.entity';
import { MockTestQuestion, MockQuestionType } from './entities/mock-test-question.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/test-series.dto';

@Injectable()
export class TestSeriesService {
    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(MockTest)
        private mockTestRepository: Repository<MockTest>,
        @InjectRepository(MockTestSection)
        private sectionRepository: Repository<MockTestSection>,
        @InjectRepository(MockTestQuestion)
        private questionRepository: Repository<MockTestQuestion>,
    ) { }

    // --- Companies ---
    async getCompanies(activeOnly = false) {
        const where = activeOnly ? { isActive: true } : {};
        return this.companyRepository.find({ where, order: { name: 'ASC' } });
    }

    async getCompany(id: string) {
        const company = await this.companyRepository.findOne({ where: { id } });
        if (!company) throw new NotFoundException('Company not found');
        return company;
    }

    async createCompany(dto: CreateCompanyDto) {
        const company = this.companyRepository.create(dto);
        return this.companyRepository.save(company);
    }

    async updateCompany(id: string, dto: UpdateCompanyDto) {
        await this.companyRepository.update(id, dto);
        return this.getCompany(id);
    }

    async deleteCompany(id: string) {
        await this.companyRepository.delete(id);
        return { success: true };
    }

    // --- Mock Tests ---
    async getMockTestsByCompany(companyId: string) {
        return this.mockTestRepository.find({ where: { companyId }, order: { order: 'ASC', createdAt: 'ASC' } });
    }

    async createMockTest(dto: { companyId: string; title: string; description?: string; totalDurationMinutes?: number; order?: number }) {
        const mockTest = this.mockTestRepository.create(dto);
        return this.mockTestRepository.save(mockTest);
    }

    async updateMockTest(id: string, dto: { title?: string; description?: string; totalDurationMinutes?: number; order?: number }) {
        await this.mockTestRepository.update(id, dto);
        return this.mockTestRepository.findOne({ where: { id } });
    }

    async deleteMockTest(id: string) {
        await this.mockTestRepository.delete(id);
        return { success: true };
    }

    // --- Mock Test Sections ---
    async getSectionsByMockTest(mockTestId: string) {
        return this.sectionRepository.find({ where: { mockTestId }, order: { order: 'ASC', createdAt: 'ASC' } });
    }

    async createSection(dto: { mockTestId: string; title: string; durationMinutes?: number; order?: number }) {
        const section = this.sectionRepository.create(dto);
        return this.sectionRepository.save(section);
    }

    async updateSection(id: string, dto: { title?: string; durationMinutes?: number; order?: number }) {
        await this.sectionRepository.update(id, dto);
        return this.sectionRepository.findOne({ where: { id } });
    }

    async deleteSection(id: string) {
        await this.sectionRepository.delete(id);
        return { success: true };
    }

    async importBulkQuestions(sectionId: string, questionsData: any[]) {
        const section = await this.sectionRepository.findOne({ where: { id: sectionId } });
        if (!section) throw new NotFoundException('Section not found');

        const newQuestions = questionsData.map((q, index) => {
            const question = new MockTestQuestion();
            question.sectionId = sectionId;
            question.questionType = q.type === 'TEXT' ? MockQuestionType.TEXT : MockQuestionType.MCQ;
            question.questionText = q.question;
            question.optionsJson = q.options || [];
            question.correctAnswer = q.correctAnswer !== undefined ? String(q.correctAnswer) : undefined;
            question.marks = q.marks || 1;
            question.order = q.order || index;
            return question;
        });

        await this.questionRepository.save(newQuestions);
        return { success: true, count: newQuestions.length };
    }

    // --- Student ---
    async getCompanyHierarchy(companyId: string) {
        // Returns the Company -> Mock Tests -> Sections -> Questions (count) structure
        const company = await this.getCompany(companyId);
        const mockTests = await this.mockTestRepository.find({
            where: { companyId },
            relations: ['sections', 'sections.questions'],
            order: {
                order: 'ASC',
                sections: { order: 'ASC' }
            }
        });

        return {
            company,
            mockTests: mockTests.map(mt => ({
                id: mt.id,
                title: mt.title,
                description: mt.description,
                totalDurationMinutes: mt.totalDurationMinutes,
                sections: mt.sections.map(s => ({
                    id: s.id,
                    title: s.title,
                    durationMinutes: s.durationMinutes,
                    questionCount: s.questions.length
                }))
            }))
        };
    }

    async getMockTestFull(mockTestId: string) {
        const test = await this.mockTestRepository.findOne({
            where: { id: mockTestId },
            relations: ['sections', 'sections.questions'],
            order: {
                sections: {
                    order: 'ASC',
                    questions: { order: 'ASC' }
                }
            }
        });

        if (!test) throw new NotFoundException('Mock test not found');
        return test;
    }
}
