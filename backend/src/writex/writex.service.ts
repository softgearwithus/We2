import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AdminService } from '../admin/admin.service';
import { WriteXQuestion } from './entities/writex-question.entity';
import { UpdateWriteXQuestionDto } from './dto/update-writex-question.dto';

@Injectable()
export class WriteXService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    @InjectRepository(WriteXQuestion)
    private readonly questionRepo: Repository<WriteXQuestion>,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
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
    const modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async createQuestion(
    prompt: string,
    active = true,
    topicKey?: string,
    topicLabel?: string,
  ) {
    if (active && !topicKey) {
      await this.questionRepo.update({ active: true, topicKey: null } as any, {
        active: false,
      });
    } else if (active && topicKey) {
      await this.questionRepo.update(
        { active: true, topicKey },
        { active: false },
      );
    }
    const question = this.questionRepo.create({
      prompt: prompt.trim(),
      active,
      topicKey,
      topicLabel,
    });
    const saved = await this.questionRepo.save(question);
    await this.adminService.logAction({
      action: 'WriteX Question Created',
      target: saved.id,
      severity: 'info',
    });
    return saved;
  }

  async listQuestions(topicKey?: string) {
    const normalizedTopicKey = topicKey?.trim();
    const where = normalizedTopicKey
      ? normalizedTopicKey === 'general'
        ? { topicKey: IsNull() }
        : { topicKey: normalizedTopicKey }
      : {};

    return this.questionRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
  async updateQuestion(id: string, dto: UpdateWriteXQuestionDto) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (typeof dto.prompt === 'string' && dto.prompt.trim()) {
      question.prompt = dto.prompt.trim();
    }

    if (dto.topicKey !== undefined) question.topicKey = dto.topicKey;
    if (dto.topicLabel !== undefined) question.topicLabel = dto.topicLabel;
    if (dto.isNew !== undefined) question.isNew = dto.isNew;

    if (dto.active !== undefined) {
      if (dto.active) {
        const topicKey =
          dto.topicKey !== undefined ? dto.topicKey : question.topicKey;
        if (!topicKey) {
          await this.questionRepo.update(
            { active: true, topicKey: null } as any,
            { active: false },
          );
        } else {
          await this.questionRepo.update(
            { active: true, topicKey },
            { active: false },
          );
        }
      }
      question.active = dto.active;
    }

    const saved = await this.questionRepo.save(question);
    await this.adminService.logAction({
      action: 'WriteX Question Updated',
      target: saved.id,
      severity: 'info',
    });
    return saved;
  }

  async deleteQuestion(id: string) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    await this.questionRepo.remove(question);
    await this.adminService.logAction({
      action: 'WriteX Question Deleted',
      target: question.id,
      severity: 'warning',
    });
    return { success: true };
  }

  async getGroups() {
    const query = this.questionRepo.createQueryBuilder('q');
    query.select(`COALESCE(q.topicKey, 'general')`, 'key');
    query.addSelect(`COALESCE(q.topicLabel, 'General')`, 'label');
    query.addSelect('COUNT(q.id)', 'count');
    query.addSelect('MAX(q.createdAt)', 'createdAt');
    query.groupBy("COALESCE(q.topicKey, 'general')");
    query.addGroupBy("COALESCE(q.topicLabel, 'General')");
    query.orderBy('label', 'ASC');
    const results = await query.getRawMany();
    return results.map((r) => ({
      key: r.key,
      label: r.label,
      count: Number(r.count),
      category: 'writex',
      createdAt: r.createdAt,
    }));
  }

  async getActiveQuestion(topicKey?: string) {
    const normalizedTopicKey = topicKey?.trim();
    const where: any = { active: true };
    if (normalizedTopicKey) {
      where.topicKey =
        normalizedTopicKey === 'general' ? IsNull() : normalizedTopicKey;
    }

    const active = await this.questionRepo.findOne({ where });
    if (active) return active;

    const latestWhere: any = {};
    if (normalizedTopicKey) {
      latestWhere.topicKey =
        normalizedTopicKey === 'general' ? IsNull() : normalizedTopicKey;
    }

    const latest = await this.questionRepo.findOne({
      where: latestWhere,
      order: { createdAt: 'DESC' },
    });
    if (!latest) {
      throw new NotFoundException('No WriteX question found');
    }
    return latest;
  }

  async evaluateAnswer(questionId: string, answer: string) {
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
    });
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
    const jsonString = textResponse
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '');

    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to parse WriteX evaluation',
      );
    }
  }
}
