import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class InterviewService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {
    // Initialize Gemini
    // WARNING: Ensure GEMINI_API_KEY is allowed in your environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will not work.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'mock-key');
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeAudio(audioBuffer: Buffer, mimeType: string, type: 'reading' | 'repeat' | 'extempore' | 'answer' = 'answer', referenceText?: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let prompt = "Please analyze this audio response to an interview question. Provide constructive feedback on clarity, tone, and the content of the answer. Keep it concise (under 200 words).";

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
            data: audioBuffer.toString("base64"),
            mimeType: mimeType
          }
        }
      ]);

      return result.response.text();
    } catch (error) {
      const fs = require('fs');
      fs.appendFileSync('backend-error.log', `Error in analyzeAudio: ${error}\nStack: ${error.stack}\n`);
      throw error;
    }
  }

  async startSession(userId: string) {
    const interview = this.interviewRepository.create({
      userId,
      status: 'active',
      history: [] // Start empty
    });
    return this.interviewRepository.save(interview);
  }

  async processMessage(interviewId: string, userMessage: string) {
    const interview = await this.interviewRepository.findOne({ where: { id: interviewId } });
    if (!interview) throw new NotFoundException('Interview not found');

    // Add user message to history
    const currentHistory = interview.history || [];

    // Prepare chat for Gemini
    // We need to convert our stored history to Gemini format
    const chat = this.model.startChat({
      history: currentHistory.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      generationConfig: {
        maxOutputTokens: 150, // Keep responses concise for speech
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: "You are a professional, encouraging, but rigorous technical interviewer. You are interviewing a candidate for a Software Engineering role. Keep your responses concise (1-3 sentences) suitable for a voice conversation. Start by asking them to introduce themselves if it's the beginning. Move on to technical questions about Data Structures, Algorithms, or System Design. Finally, ask behavioral questions." }]
      }
    });

    // Send message
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    // Update History in DB
    const newHistory = [
      ...currentHistory,
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: text }] }
    ];

    interview.history = newHistory as any;
    await this.interviewRepository.save(interview);

    return {
      text: text,
      interviewId: interview.id
    };
  }

  async handleVapiChat(messages: any[]) {
    // Convert Vapi/OpenAI format to Gemini format
    // Vapi: { role: 'user' | 'assistant' | 'system', content: string }
    // Gemini: { role: 'user' | 'model', parts: [{ text: string }] }

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })).filter(m => m.role !== 'system'); // Filter system if Gemini SDK handles it via systemInstruction

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content;

    try {
      const chat = this.model.startChat({
        history: history as any,
        generationConfig: {
          maxOutputTokens: 150, // Concise for voice
        },
        systemInstruction: {
          role: "system",
          parts: [{ text: "You are a professional, encouraging, but rigorous technical interviewer. You are interviewing a candidate for a Software Engineering role. Keep your responses concise (1-3 sentences) suitable for a voice conversation. Start by asking them to introduce themselves if it's the beginning. Move on to technical questions about Data Structures, Algorithms, or System Design. Finally, ask behavioral questions." }]
        }
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      return response.text();
    } catch (e) {
      console.error("Gemini Error:", e);
      return "I'm having trouble processing that. Could you say it again?";
    }
  }

  async endSession(interviewId: string) {
    const interview = await this.interviewRepository.findOne({ where: { id: interviewId } });
    if (!interview) throw new NotFoundException('Interview not found');

    interview.status = 'completed';
    // generating feedback could happen here
    await this.interviewRepository.save(interview);
    return { message: "Interview ended" };
  }
}
