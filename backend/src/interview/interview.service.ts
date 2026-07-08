import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

import { Interview } from './entities/interview.entity';

@Injectable()
export class InterviewService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelName: string;

  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. AI features will not work.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey || 'mock-key');
    const requestedModel = process.env.GEMINI_MODEL;
    this.modelName =
      requestedModel && requestedModel !== 'gemini-pro'
        ? requestedModel
        : 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  async analyzeAudio(
    audioBuffer: Buffer,
    mimeType: string,
    type: 'reading' | 'repeat' | 'extempore' | 'answer' = 'answer',
    referenceText?: string,
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });

      let prompt =
        'Please analyze this audio response to an interview question. Provide constructive feedback on clarity, tone, and the content of the answer. Keep it concise (under 200 words).';

      if (type === 'reading') {
        prompt = `The user was asked to read the following text: "${referenceText}". Compare the spoken audio to this text. Rate their fluency, pronunciation, and accuracy. Point out any mispronounced words or hesitations.`;
      } else if (type === 'repeat') {
        prompt = `The user was asked to repeat the following sentence: "${referenceText}". Check if they repeated it accurately. Rate their listening skills and pronunciation. Mention any missing or incorrect words.`;
      } else if (type === 'extempore') {
        prompt = `The user was asked to speak on the topic: "${referenceText}". Analyze their speech for coherence, vocabulary, grammar, and fluency. Did they stay on topic? usage of filler words?`;
      } else if (type === 'answer') {
        prompt = `The user was asked the question: "${referenceText}". Analyze their answer for relevance, depth, clarity, and confidence. Provide a score out of 100 and brief feedback.`;
      }

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: audioBuffer.toString('base64'),
            mimeType,
          },
        },
      ]);

      return result.response.text();
    } catch (error: any) {
      import('fs').then((fs) => {
        fs.appendFileSync(
          'backend-error.log',
          `Error in analyzeAudio: ${error}\nStack: ${error.stack}\n`,
        );
      });
      throw error;
    }
  }

  async startSession(userId: string) {
    const interview = this.interviewRepository.create({
      userId,
      status: 'active',
      history: [],
    });
    return this.interviewRepository.save(interview);
  }

  async processMessage(
    interviewId: string,
    userMessage: string,
    userId?: string,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    if (userId && interview.userId !== userId) {
      throw new ForbiddenException('Access denied to this interview session');
    }

    const currentHistory = interview.history || [];
    const chat = this.model.startChat({
      history: currentHistory.map((entry) => ({
        role: entry.role,
        parts: entry.parts,
      })),
      generationConfig: {
        maxOutputTokens: 150,
      },
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: "You are a professional, encouraging, but rigorous technical interviewer. You are interviewing a candidate for a Software Engineering role. Keep your responses concise (1-3 sentences) suitable for a voice conversation. Start by asking them to introduce themselves if it's the beginning. Move on to technical questions about Data Structures, Algorithms, or System Design. Finally, ask behavioral questions.",
          },
        ],
      },
    });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    interview.history = [
      ...currentHistory,
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text }] },
    ] as any;
    await this.interviewRepository.save(interview);

    return {
      text,
      interviewId: interview.id,
    };
  }

  async endSession(interviewId: string, userId?: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    if (userId && interview.userId !== userId) {
      throw new ForbiddenException('Access denied to this interview session');
    }

    interview.status = 'completed';
    await this.interviewRepository.save(interview);
    return { message: 'Interview ended' };
  }
}
