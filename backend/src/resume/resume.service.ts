import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { User } from '../users/user.entity';
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumeService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Resume)
        private resumeRepo: Repository<Resume>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {
        this.initializeModel();
    }

    private initializeModel() {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not defined in environment variables');
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
        this.model = this.genAI.getGenerativeModel({ model: modelName });
    }

    async analyzeResume(userId: string, buffer: Buffer, jobDescription?: string) {
        try {
            // Check limits
            const user = await this.userRepo.findOne({ where: { id: userId } });
            if (!user) throw new NotFoundException('User not found');

            const plan = user.subscriptionPlan || 'free';
            let limit = 0; // Default Free
            if (plan === 'standard' || plan === 'placement_plus' || plan.includes('standard')) limit = 5;
            else if (plan === 'pro' || plan === 'we2_max' || plan.includes('pro')) limit = 12;

            if (user.resumeScanUsage >= limit) {
                throw new BadRequestException(`Monthly resume ATS scan limit exhausted (${user.resumeScanUsage}/${limit}). Please upgrade your plan for more.`);
            }

            // 1. Parse PDF
            const pdfData = await pdfParse(buffer);
            const text = pdfData.text;

            if (!text || text.trim().length === 0) {
                throw new InternalServerErrorException('Could not extract text from the resume PDF.');
            }

            // 2. Analyze with Gemini
            if (!this.model) {
                this.initializeModel();
            }
            if (!this.model) {
                throw new InternalServerErrorException('Gemini API not configured.');
            }

            const jdSection = jobDescription
                ? `\nTarget Job Description:\n"""\n${jobDescription}\n"""\n`
                : '';

            const prompt = `
        You are an expert ATS (Applicant Tracking System) scanner and Resume Critic.
        Analyze the following resume text${jobDescription ? ' against the provided Job Description' : ''} and provide a structured JSON response.
        ${jdSection}
        Resume Text:
        """
        ${text}
        """

        Output Format (JSON only):
        {
          "score": <number 0-100 based on ${jobDescription ? 'JD matching' : 'general ATS standards'}>,
          "summary": "<short summary of how well the resume matches the ${jobDescription ? 'job requirements' : 'standard ATS expectations'}>",
          "strengths": ["<strength 1>", "<strength 2>", ...],
          "weaknesses": ["${jobDescription ? 'missing requirement or generic weakness' : 'weakness 1'}", ...],
          "suggestions": ["<actionable suggestion to improve ${jobDescription ? 'match rate' : 'clarity'}>", ...]
        }
      `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();

            // Clean up markdown code blocks if present
            const jsonString = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');

            try {
                const parsed = JSON.parse(jsonString);

                // Increment usage on success
                user.resumeScanUsage++;
                await this.userRepo.save(user);

                return parsed;
            } catch (e) {
                console.error('Failed to parse Gemini response:', textResponse);
                throw new InternalServerErrorException('Failed to parse analysis result.');
            }

        } catch (error) {
            console.error('Error analyzing resume:', error);
            throw new InternalServerErrorException('Failed to analyze resume: ' + (error.message || error));
        }
    }

    async getAllResumes(userId: string) {
        return this.resumeRepo.find({
            where: { userId },
            order: { updatedAt: 'DESC' },
        });
    }

    async getResumeById(id: string, userId: string) {
        const resume = await this.resumeRepo.findOne({ where: { id, userId } });
        if (!resume) {
            throw new NotFoundException('Resume not found');
        }
        return resume;
    }

    async createResume(userId: string, title: string, data?: Record<string, any>) {
        const resume = this.resumeRepo.create({
            userId,
            title,
            data: data || {}, // initialize with empty object if no data provided initially
        });

        try {
            return await this.resumeRepo.save(resume);
        } catch (error: any) {
            const isUniqueViolation =
                error instanceof QueryFailedError &&
                error?.driverError?.code === '23505' &&
                String(error?.driverError?.detail || '').includes('(\"userId\")');

            if (!isUniqueViolation) {
                throw error;
            }

            const existingResume = await this.resumeRepo.findOne({
                where: { userId },
                order: { updatedAt: 'DESC' },
            });

            if (!existingResume) {
                throw error;
            }

            existingResume.title = title;
            existingResume.data = data || {};
            return this.resumeRepo.save(existingResume);
        }
    }

    async updateResume(id: string, userId: string, updateData: { title?: string, data?: Record<string, any> }) {
        const resume = await this.getResumeById(id, userId);

        if (updateData.title !== undefined) {
            resume.title = updateData.title;
        }
        if (updateData.data !== undefined) {
            resume.data = updateData.data;
        }

        return this.resumeRepo.save(resume);
    }

    async deleteResume(id: string, userId: string) {
        const resume = await this.getResumeById(id, userId);
        await this.resumeRepo.remove(resume);
        return { message: 'Resume deleted successfully' };
    }
}
