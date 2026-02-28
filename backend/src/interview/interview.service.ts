import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { InterviewSession, InterviewStatus, InterviewType } from '../interviews/entities/interview-session.entity';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class InterviewService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private modelName: string;

  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(InterviewSession)
    private interviewSessionsRepo: Repository<InterviewSession>,
  ) {
    // Initialize Gemini
    // WARNING: Ensure GEMINI_API_KEY is allowed in your environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI features will not work.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'mock-key');
    const requestedModel = process.env.GEMINI_MODEL;
    this.modelName = requestedModel && requestedModel !== 'gemini-pro'
      ? requestedModel
      : 'gemini-2.5-flash';
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }

  async analyzeAudio(audioBuffer: Buffer, mimeType: string, type: 'reading' | 'repeat' | 'extempore' | 'answer' = 'answer', referenceText?: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });

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

  async scheduleAnalysisReport(callId: string) {
    console.log(`Scheduling analysis fetch for call: ${callId} in 5 minutes...`);

        // In a real prod environment, use a task queue.
    // For this simulation, we'll use a reliable delayed execution.
    setTimeout(async () => {
      try {
        await this.fetchVapiAnalysis(callId);
      } catch (err) {
        console.error(`Failed to fetch Vapi analysis for ${callId}:`, err);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  async fetchVapiAnalysis(callId: string) {
    const vapiSecret = process.env.VAPI_API_KEY;
    const vapiBase = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';

    try {
      const response = await fetch(`${vapiBase}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${vapiSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Vapi API error: ${response.statusText}`);

      const data = await response.json();
      console.log(`Analysis received for ${callId}:`, data.analysis);

      await this.saveVapiAnalysis(callId, data);

      return data;
    } catch (error) {
      console.error("Error fetching Vapi analysis:", error);
      throw error;
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

  async fetchVapiAnalysisNow(callId: string) {
    return this.fetchVapiAnalysis(callId);
  }

  async registerVapiCall(userId: string, callId: string, metadata?: { assistantId?: string }) {
    const session = this.interviewSessionsRepo.create({
      userId,
      type: InterviewType.TECHNICAL,
      status: InterviewStatus.IN_PROGRESS,
      startedAt: new Date(),
      aiInterviewerId: metadata?.assistantId || 'Vapi',
      externalCallId: callId,
      analysisProvider: 'vapi',
      questions: [{ context: 'Video Simulation' }],
    });

    return this.interviewSessionsRepo.save(session);
  }

  async getVapiAnalysis(callId: string, userId?: string) {
    let session = await this.interviewSessionsRepo.findOne({ where: { externalCallId: callId } });

    if (!session && userId) {
      await this.registerVapiCall(userId, callId);
      session = await this.interviewSessionsRepo.findOne({ where: { externalCallId: callId } });
    }

    if (!session) throw new NotFoundException('Vapi session not found');
    if (userId && session.userId !== userId) throw new NotFoundException('Vapi session not found');

    const needsRefresh = !session.analysis?.raw
      || (!session.analysis?.logs && !!session.analysis?.logUrl)
      || (!session.analysis?.summary && !!session.feedback);

    if (!session.analysis || needsRefresh) {
      await this.fetchVapiAnalysisNow(callId);
      const refreshed = await this.interviewSessionsRepo.findOne({ where: { externalCallId: callId } });
      if (refreshed) return refreshed;
    }
    return session;
  }

  private normalizeVapiScores(analysis: any) {
    if (!analysis) return null;
    const scores = analysis.scores || analysis.scoring || analysis.evaluation || analysis.metrics || {};

    const overall = typeof scores.overall === 'number'
      ? scores.overall
      : (typeof scores.overallScore === 'number'
        ? scores.overallScore
        : (typeof analysis.overallScore === 'number'
          ? analysis.overallScore
          : (typeof analysis.score === 'number' ? analysis.score : null)));

    const technical = scores.technical
      ?? scores.tech
      ?? analysis.technicalScore
      ?? (typeof analysis.technical === 'number' ? analysis.technical : null);
    const communication = scores.communication
      ?? scores.comm
      ?? analysis.communicationScore
      ?? (typeof analysis.communication === 'number' ? analysis.communication : null);
    const problemSolving = scores.problemSolving
      ?? scores.problem_solving
      ?? analysis.problemSolvingScore
      ?? (typeof analysis.problemSolving === 'number' ? analysis.problemSolving : null);

    const normalized = {
      overallScore: overall,
      metrics: {
        technical,
        communication,
        problemSolving,
      },
    };

    return normalized;
  }

  private normalizeVapiFeedback(analysis: any) {
    const feedback: Array<{ type: 'strength' | 'improvement'; text: string }> = [];
    const strengths = analysis?.strengths || analysis?.positive || [];
    const improvements = analysis?.improvements || analysis?.negative || [];

    if (Array.isArray(strengths)) {
      strengths.forEach((text) => feedback.push({ type: 'strength', text }));
    }
    if (Array.isArray(improvements)) {
      improvements.forEach((text) => feedback.push({ type: 'improvement', text }));
    }

    return feedback;
  }

  private async saveVapiAnalysis(callId: string, data: any) {
    const session = await this.interviewSessionsRepo.findOne({ where: { externalCallId: callId } });
    if (!session) return;

    const callData = data || {};
    const analysis = callData?.analysis || callData?.summary || null;
    const artifact = callData?.artifact || {};
    const transcript = artifact?.transcript || analysis?.transcript || callData?.transcript || null;
    const logUrl = artifact?.logUrl || callData?.logUrl || analysis?.logUrl || null;
    let logs = artifact?.messages
      || callData?.messages
      || callData?.conversation
      || analysis?.logs
      || analysis?.messages
      || null;
    const structuredData = analysis?.structuredData || null;
    const structuredMetrics = structuredData?.metrics || null;
    const metricsSource = structuredMetrics && typeof structuredMetrics === 'object'
      ? structuredMetrics
      : (structuredData || analysis);
    const feedbackSource = structuredData || analysis;
    const normalizedScores = this.normalizeVapiScores(metricsSource);
    const feedback = this.normalizeVapiFeedback(feedbackSource);
    const summary = analysis?.summary
      || feedbackSource?.feedback
      || analysis?.feedback
      || null;

    if (!logs && logUrl) {
      try {
        const logResponse = await fetch(logUrl);
        if (logResponse.ok) {
          const contentType = logResponse.headers.get('content-type') || '';
          logs = contentType.includes('application/json')
            ? await logResponse.json()
            : await logResponse.text();
        }
      } catch (error) {
        console.warn('Failed to fetch Vapi log URL', error);
      }
    }

    session.status = InterviewStatus.COMPLETED;
    session.completedAt = new Date();
    session.analysisProvider = 'vapi';

    if (normalizedScores?.overallScore !== null && normalizedScores?.overallScore !== undefined) {
      session.overallScore = Math.round(normalizedScores.overallScore);
    }

    session.analysis = {
      provider: 'vapi',
      raw: callData,
      summary,
      metrics: normalizedScores?.metrics,
      transcript,
      feedback,
      logs,
      logUrl,
    };

    session.feedback = summary || session.feedback;
    session.strengths = feedbackSource?.strengths || analysis?.strengths || session.strengths;
    session.improvements = feedbackSource?.improvements || analysis?.improvements || session.improvements;

    await this.interviewSessionsRepo.save(session);
  }
}
