import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { MockTest } from './entities/mock-test.entity';
import { MockTestSection } from './entities/mock-test-section.entity';
import { MockTestQuestion, MockQuestionType } from './entities/mock-test-question.entity';
import { MockTestResult } from './entities/mock-test-result.entity';
import { MockTestStudentResponse } from './entities/mock-test-student-response.entity';
import { User } from '../users/user.entity';
import { McqQuestion } from '../mcqs/entities/mcq-question.entity';
import { TestEvaluationService } from './test-evaluation.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/test-series.dto';
import { In } from 'typeorm';

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
        @InjectRepository(MockTestResult)
        private mockTestResultRepository: Repository<MockTestResult>,
        @InjectRepository(MockTestStudentResponse)
        private mockTestResponseRepository: Repository<MockTestStudentResponse>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(McqQuestion)
        private mcqQuestionRepository: Repository<McqQuestion>,
        private testEvaluationService: TestEvaluationService
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

    // --- Section Question Management ---
    async getSectionQuestions(sectionId: string) {
        return this.questionRepository.find({
            where: { sectionId },
            order: { order: 'ASC', createdAt: 'ASC' }
        });
    }

    async deleteQuestion(questionId: string) {
        const question = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!question) throw new NotFoundException('Question not found');
        return this.questionRepository.remove(question);
    }

    async importBulkQuestions(sectionId: string, questionsData: any[]) {
        const section = await this.sectionRepository.findOne({ where: { id: sectionId } });
        if (!section) throw new NotFoundException('Section not found');

        const newQuestions = questionsData.map((q, index) => {
            const question = new MockTestQuestion();
            question.sectionId = sectionId;
            if (Object.values(MockQuestionType).includes(q.type)) {
                question.questionType = q.type as MockQuestionType;
            } else {
                question.questionType = MockQuestionType.SINGLE_CORRECT;
            }
            question.questionText = q.question;
            question.optionsJson = q.options || [];
            question.correctAnswer = q.correctAnswer !== undefined ? String(q.correctAnswer) : '';
            question.solutionText = q.solutionText || '';
            question.passageContent = q.passageContent || undefined;
            if (q.imageUrl) question.imageUrl = q.imageUrl;
            question.marks = q.marks || 1;
            question.order = q.order || index;
            return question;
        });

        try {
            await this.questionRepository.save(newQuestions);
            return { success: true, count: newQuestions.length };
        } catch (error) {
            console.error('+++ DB SAVE EXCEPTION +++', error);
            throw new Error('Database insert failed');
        }
    }

    // --- Student ---
    async getCompanyHierarchy(companyId: string, isStudent: boolean = false) {
        // Returns the Company -> Mock Tests -> Sections -> Questions (count) structure
        const company = await this.getCompany(companyId);
        const whereCondition: any = { companyId };
        if (isStudent) {
            whereCondition.isPublished = true;
        }

        const mockTests = await this.mockTestRepository.find({
            where: whereCondition,
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

    async getMockTestFull(mockTestId: string, isStudent: boolean = false) {
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
        if (isStudent && !test.isPublished) {
            throw new NotFoundException('Mock test not available');
        }
        return test;
    }

    async publishMockTest(testId: string, isPublished: boolean) {
        const test = await this.mockTestRepository.findOne({ where: { id: testId } });
        if (!test) throw new NotFoundException('Mock test not found');
        test.isPublished = isPublished;
        return this.mockTestRepository.save(test);
    }

    async submitTest(userId: string, mockTestId: string, payload: {
        startTime: Date | string,
        endTime: Date | string,
        responses: { questionId: string, responseValue: string, timeSpentSeconds: number }[]
    }) {
        const test = await this.mockTestRepository.findOne({ where: { id: mockTestId } });
        if (!test) throw new NotFoundException('Test not found');

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Create the base result
        const result = this.mockTestResultRepository.create({
            user,
            mockTest: { id: mockTestId } as any,
            startTime: payload.startTime,
            endTime: payload.endTime,
            isEvaluated: false, // will turn true after Gemini finishes (if any CODE/TEXT)
            totalMarks: 0,
            marksObtained: 0
        });

        await this.mockTestResultRepository.save(result);

        // Fetch all questions to evaluate MCQs instantly
        const qIds = payload.responses.map(r => r.questionId);
        let questions: MockTestQuestion[] = [];
        if (qIds.length > 0) {
            questions = await this.questionRepository.find({ where: { id: In(qIds) } });
        }

        let totalMarks = 0;
        let marksObtained = 0;
        let requiresAiEvaluation = false;

        const studentResponses: MockTestStudentResponse[] = [];

        for (const r of payload.responses) {
            const question = questions.find(q => q.id === r.questionId);
            if (!question) continue;

            const studentResp = this.mockTestResponseRepository.create({
                mockTestResult: result,
                question: { id: question.id } as any,
                responseValue: r.responseValue,
                timeSpentSeconds: r.timeSpentSeconds,
                marksAwarded: 0
            });

            totalMarks += question.marks;

            if (question.questionType === MockQuestionType.SINGLE_CORRECT) {
                if (question.correctAnswer && r.responseValue === question.correctAnswer) {
                    studentResp.isCorrect = true;
                    studentResp.marksAwarded = question.marks;
                    marksObtained += question.marks;
                } else {
                    studentResp.isCorrect = false;
                }
            } else if (question.questionType === MockQuestionType.MULTI_CORRECT) {
                const correctValue = question.correctAnswer || '';
                if (!correctValue.trim()) {
                    studentResp.isCorrect = false;
                } else {
                    // Check comma-separated arrays ignoring order
                    const correctArr = correctValue.split(',').sort().join(',');
                    const studentArr = r.responseValue ? r.responseValue.split(',').sort().join(',') : '';
                    if (studentArr === correctArr) {
                        studentResp.isCorrect = true;
                        studentResp.marksAwarded = question.marks;
                        marksObtained += question.marks;
                    } else {
                        studentResp.isCorrect = false;
                    }
                }
            } else if (question.questionType === MockQuestionType.TEXT || question.questionType === MockQuestionType.CODE) {
                // Must be evaluated by AI asynchronously
                requiresAiEvaluation = true;
                // Leave studentResp.isCorrect undefined or false (TypeORM boolean doesn't strictly allow null without schema mapping tweak; we just leave it default/null in DB).
                studentResp.isCorrect = null; // pending
            }

            studentResponses.push(studentResp);
        }

        if (studentResponses.length > 0) {
            await this.mockTestResponseRepository.save(studentResponses);
        }

        // Update the top level result instantly with objective scores
        result.totalMarks = totalMarks;
        result.marksObtained = marksObtained;
        if (!requiresAiEvaluation) {
            result.isEvaluated = true;
        }
        await this.mockTestResultRepository.save(result);

        if (requiresAiEvaluation) {
            // Trigger background execution without awaiting
            this.testEvaluationService.evaluatePendingResponses(result.id).catch(err => {
                console.error('Failed to trigger background AI eval:', err);
            });
        }

        return {
            success: true,
            resultId: result.id,
            requiresAiEvaluation
        };
    }

    async submitSubjectPractice(userId: string, payload: {
        subject: string,
        topic: string,
        title: string,
        totalScore: number,
        correctAnswers: number,
        incorrectAnswers: number,
        unattemptedQuestions: number,
        timeTakenSeconds: number,
        responses: { question: { id: string }, responseValue: string, isCorrect: boolean | null }[]
    }) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const now = new Date();
        const startTime = new Date(now.getTime() - (payload.timeTakenSeconds * 1000));

        const result = this.mockTestResultRepository.create({
            user,
            resultType: 'subject_practice',
            subject: payload.subject,
            topic: payload.topic,
            titleSnapshot: payload.title,
            startTime: startTime,
            endTime: now,
            isEvaluated: true,
            totalMarks: payload.responses.length, 
            marksObtained: payload.totalScore
        });

        await this.mockTestResultRepository.save(result);

        const studentResponses: MockTestStudentResponse[] = payload.responses.map(r => {
            return this.mockTestResponseRepository.create({
                mockTestResult: result,
                subjectMcqId: r.question.id, // Store original McqQuestion id loosely
                responseValue: r.responseValue,
                timeSpentSeconds: 0, // Roughly speaking, or we divide time...
                isCorrect: r.isCorrect,
                marksAwarded: r.isCorrect ? 1 : 0
            });
        });

        if (studentResponses.length > 0) {
            await this.mockTestResponseRepository.save(studentResponses);
        }

        return {
            success: true,
            id: result.id
        };
    }

    async getStudentResults(userId: string) {
        return this.mockTestResultRepository.find({
            where: { user: { id: userId } },
            relations: ['mockTest', 'mockTest.company'],
            order: { createdAt: 'DESC' }
        });
    }

    async getResultFull(resultId: string, userId: string) {
        const result = await this.mockTestResultRepository.findOne({
            where: { id: resultId, user: { id: userId } },
            relations: ['mockTest', 'responses', 'responses.question']
        });
        if (!result) throw new NotFoundException('Result not found or access denied');

        if (result.resultType === 'subject_practice') {
            const mcqIds = result.responses.map(r => r.subjectMcqId).filter(id => id);
            if (mcqIds.length > 0) {
                const mcqs = await this.mcqQuestionRepository.find({ where: { id: In(mcqIds) } });
                result.responses.forEach(r => {
                    const matched = mcqs.find(m => m.id === r.subjectMcqId);
                    if (matched) {
                        // Map McqQuestion into MockTestQuestion format for the frontend
                        (r as any).question = {
                            id: matched.id,
                            questionText: matched.question,
                            optionsJson: matched.options,
                            correctAnswer: matched.correctOptionIndex !== null ? String(matched.correctOptionIndex) : null,
                            questionType: 'SINGLE_CORRECT',
                            marks: 1,
                            solutionText: ''
                        };
                    }
                });
            }
        }

        return result;
    }
}
