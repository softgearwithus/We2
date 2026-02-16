import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WriteXQuestion } from './entities/writex-question.entity';

@Injectable()
export class WriteXService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(
        @InjectRepository(WriteXQuestion)
        private readonly questionRepo: Repository<WriteXQuestion>,
        private readonly configService: ConfigService,
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

    async createQuestion(prompt: string, active = true) {
        if (active) {
            await this.questionRepo.update({ active: true }, { active: false });
        }
        const question = this.questionRepo.create({
            prompt: prompt.trim(),
            active,
        });
        return this.questionRepo.save(question);
    }

    async getActiveQuestion() {
        const active = await this.questionRepo.findOne({ where: { active: true } });
        if (active) return active;

        const latest = await this.questionRepo.findOne({ order: { createdAt: 'DESC' } });
        if (!latest) {
            throw new NotFoundException('No WriteX question found');
        }
        return latest;
    }

    async evaluateAnswer(questionId: string, answer: string) {
        const question = await this.questionRepo.findOne({ where: { id: questionId } });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        if (!this.model) {
            this.initializeModel();
        }
        if (!this.model) {
            throw new InternalServerErrorException('Gemini API not configured.');
        }

        const prompt = `You are a lenient evaluator for student WriteX responses.
Score on a 0-100 scale with a generous baseline for effort and clarity.
Evaluate specifically on: relevance, fluency, grammar, and vocabulary.
Return JSON only with this format:
{
  "score": number,
  "summary": "short feedback",
  "criteria": {
    "relevance": number,
    "fluency": number,
    "grammar": number,
    "vocabulary": number
  },
  "strengths": ["..."],
  "improvements": ["..."]
}
Ensure criteria scores are 0-100 and roughly align with the overall score.

Question:
"""
${question.prompt}
"""

Student Answer:
"""
${answer}
"""
`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonString = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');

        try {
            return JSON.parse(jsonString);
        } catch (error) {
            throw new InternalServerErrorException('Failed to parse WriteX evaluation');
        }
    }
}
