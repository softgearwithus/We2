import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import {
  InterviewSession,
  InterviewStatus,
  InterviewType,
  InterviewDifficulty,
} from '../interviews/entities/interview-session.entity';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { VapiResumeAsset } from './entities/vapi-resume-asset.entity';

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
    @InjectRepository(VapiResumeAsset)
    private vapiResumeRepo: Repository<VapiResumeAsset>,
  ) {
    // Initialize Gemini
    // WARNING: Ensure GEMINI_API_KEY is allowed in your environment
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
            mimeType: mimeType,
          },
        },
      ]);

      return result.response.text();
    } catch (error) {
      const fs = require('fs');
      fs.appendFileSync(
        'backend-error.log',
        `Error in analyzeAudio: ${error}\nStack: ${error.stack}\n`,
      );
      throw error;
    }
  }

  async startSession(userId: string) {
    const interview = this.interviewRepository.create({
      userId,
      status: 'active',
      history: [], // Start empty
    });
    return this.interviewRepository.save(interview);
  }

  async processMessage(interviewId: string, userMessage: string, userId?: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) throw new NotFoundException('Interview not found');
    if (userId && interview.userId !== userId) {
      throw new ForbiddenException('Access denied to this interview session');
    }

    // Add user message to history
    const currentHistory = interview.history || [];

    // Prepare chat for Gemini
    // We need to convert our stored history to Gemini format
    const chat = this.model.startChat({
      history: currentHistory.map((h) => ({
        role: h.role,
        parts: h.parts,
      })),
      generationConfig: {
        maxOutputTokens: 150, // Keep responses concise for speech
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

    // Send message
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    // Update History in DB
    const newHistory = [
      ...currentHistory,
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: text }] },
    ];

    interview.history = newHistory as any;
    await this.interviewRepository.save(interview);

    return {
      text: text,
      interviewId: interview.id,
    };
  }

  async handleVapiChat(messages: any[]) {
    // Convert Vapi/OpenAI format to Gemini format
    // Vapi: { role: 'user' | 'assistant' | 'system', content: string }
    // Gemini: { role: 'user' | 'model', parts: [{ text: string }] }

    const history = messages
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
      .filter((m) => m.role !== 'system'); // Filter system if Gemini SDK handles it via systemInstruction

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content;

    try {
      const chat = this.model.startChat({
        history: history as any,
        generationConfig: {
          maxOutputTokens: 150, // Concise for voice
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
      const response = result.response;
      return response.text();
    } catch (e) {
      console.error('Gemini Error:', e);
      return "I'm having trouble processing that. Could you say it again?";
    }
  }

  async scheduleAnalysisReport(callId: string) {
    console.log(
      `Scheduling analysis fetch for call: ${callId} in 5 minutes...`,
    );

    // In a real prod environment, use a task queue.
    // For this simulation, we'll use a reliable delayed execution.
    setTimeout(
      async () => {
        try {
          await this.fetchVapiAnalysis(callId);
        } catch (err) {
          console.error(`Failed to fetch Vapi analysis for ${callId}:`, err);
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes
  }

  async fetchVapiAnalysis(callId: string) {
    const vapiSecret = process.env.VAPI_API_KEY;
    const vapiBase = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';

    try {
      const response = await fetch(`${vapiBase}/call/${callId}`, {
        headers: {
          Authorization: `Bearer ${vapiSecret}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Vapi API error: ${response.statusText}`);

      const data = await response.json();
      console.log(`Analysis received for ${callId}:`, data.analysis);

      await this.saveVapiAnalysis(callId, data);

      return data;
    } catch (error) {
      console.error('Error fetching Vapi analysis:', error);
      throw error;
    }
  }

  async endSession(interviewId: string, userId?: string) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) throw new NotFoundException('Interview not found');
    if (userId && interview.userId !== userId) {
      throw new ForbiddenException('Access denied to this interview session');
    }

    interview.status = 'completed';
    // generating feedback could happen here
    await this.interviewRepository.save(interview);
    return { message: 'Interview ended' };
  }

  async fetchVapiAnalysisNow(callId: string) {
    return this.fetchVapiAnalysis(callId);
  }

  async uploadVapiResume(userId: string, file: Express.Multer.File) {
    const vapiSecret = process.env.VAPI_API_KEY;
    const vapiBase = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';
    if (!vapiSecret) {
      throw new Error('VAPI_API_KEY is not configured');
    }

    const existing = await this.vapiResumeRepo.findOne({ where: { userId } });
    if (existing) {
      try {
        await this.vapiResumeRepo.remove(existing);
      } catch {
        // ignore cleanup errors
      }
    }

    const uploadForm = new FormData();
    uploadForm.append('file', new Blob([file.buffer as any], { type: file.mimetype }), file.originalname);

    const fileResponse = await fetch(`${vapiBase}/file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vapiSecret}`,
      },
      body: uploadForm as any,
    });

    if (!fileResponse.ok) {
      const errText = await fileResponse.text().catch(() => '');
      throw new Error(`Failed to upload resume to Vapi (${fileResponse.status}): ${errText}`);
    }

    const fileData = await fileResponse.json();
    const fileId = fileData?.id;
    if (!fileId) {
      throw new Error('Vapi file upload did not return an id');
    }

    const toolName = `resume-kb-${userId.slice(0, 8)}-${Date.now()}`;
    const toolResponse = await fetch(`${vapiBase}/tool`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vapiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'query',
        function: {
          name: toolName,
        },
        knowledgeBases: [
          {
            provider: 'google',
            name: 'candidate-resume',
            description:
              'Candidate resume and project history. Use it to personalize interview questions and verify resume claims.',
            fileIds: [fileId],
          },
        ],
      }),
    });

    if (!toolResponse.ok) {
      const errText = await toolResponse.text().catch(() => '');
      throw new Error(`Failed to create Vapi knowledge tool (${toolResponse.status}): ${errText}`);
    }

    const toolData = await toolResponse.json();
    const toolId = toolData?.id;
    if (!toolId) {
      throw new Error('Vapi tool creation did not return an id');
    }

    const record = this.vapiResumeRepo.create({
      userId,
      fileName: file.originalname,
      fileType: file.mimetype,
      vapiFileId: fileId,
      vapiToolId: toolId,
      vapiToolName: toolName,
    });
    const saved = await this.vapiResumeRepo.save(record);

    return {
      id: saved.id,
      fileName: saved.fileName,
      fileType: saved.fileType,
      toolId: saved.vapiToolId,
      toolName: saved.vapiToolName,
    };
  }

  async createVapiInterviewSession(
    userId: string,
    resumeAssetId: string | null,
    options?: { role?: string; difficulty?: InterviewDifficulty },
  ) {
    const vapiSecret = process.env.VAPI_API_KEY;
    const vapiBase = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';
    if (!vapiSecret) {
      throw new Error('VAPI_API_KEY is not configured');
    }

    let toolId: string | null = null;
    let toolName: string | null = null;
    if (resumeAssetId) {
      const asset = await this.vapiResumeRepo.findOne({ where: { id: resumeAssetId, userId } });
      if (asset) {
        toolId = asset.vapiToolId;
        toolName = asset.vapiToolName;
      }
    }

    const roleLabel = options?.role || 'Software Engineer';
    const systemPrompt = `You are a rigorous yet supportive technical interviewer for a ${roleLabel} role.\n\nGoals:\n- Ask one question at a time.\n- Keep responses concise (1-3 sentences).\n- Start with a brief intro question, then move through projects, DSA fundamentals, and system design, and end with a wrap-up reflection.\n- Ask for concrete details and tradeoffs.\n\nIf a resume knowledge base tool is available, use it to personalize questions and verify claims. Avoid generic questions when resume details exist.\n${toolName ? `Always call the knowledge tool '${toolName}' before asking resume-specific questions.` : ''}`;

    if (!process.env.BASE_URL) {
      console.warn('BASE_URL is not set; Vapi webhook will not be configured.');
    }

    const assistantPayload: Record<string, any> = {
      name: `Emble Interviewer ${userId.slice(0, 6)}-${Date.now()}`,
      firstMessage:
        'Hello! I am your AI interviewer. Let’s start with a quick intro about your background and most recent project.',
      firstMessageMode: 'assistant-speaks-first',
      maxDurationSeconds: 900,
      clientMessages: [
        'conversation-update',
        'transcript',
        'speech-update',
        'status-update',
      ],
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [{ role: 'system', content: systemPrompt }],
        ...(toolId ? { toolIds: [toolId] } : {}),
      },
      analysisPlan: {
        summaryPlan: { enabled: true },
        structuredDataPlan: {
          enabled: true,
          schema: {
            type: 'object',
            properties: {
              metrics: {
                type: 'object',
                properties: {
                  overallScore: { type: 'number', minimum: 0, maximum: 100 },
                  technical: { type: 'number', minimum: 0, maximum: 100 },
                  communication: { type: 'number', minimum: 0, maximum: 100 },
                  problemSolving: { type: 'number', minimum: 0, maximum: 100 },
                },
                required: ['overallScore', 'technical', 'communication', 'problemSolving'],
              },
              strengths: { type: 'array', items: { type: 'string' } },
              improvements: { type: 'array', items: { type: 'string' } },
              feedback: { type: 'string' },
            },
            required: ['metrics', 'strengths', 'improvements', 'feedback'],
          },
        },
      },
      voice: {
        provider: '11labs',
        model: 'eleven_flash_v2',
        voiceId: '2BsEFcU7jUhLaUwV4h7l',
        stability: 0.5,
        similarityBoost: 0.75,
      },
      transcriber: {
        provider: 'deepgram',
        model: 'flux-general-en',
        language: 'en',
        numerals: false,
        confidenceThreshold: 0.4,
      },
      ...(process.env.BASE_URL
        ? {
            server: {
              url: `${process.env.BASE_URL}/interview/vapi/webhook`,
            },
          }
        : {}),
    };

    const assistantResponse = await fetch(`${vapiBase}/assistant`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vapiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantPayload),
    });

    if (!assistantResponse.ok) {
      const errText = await assistantResponse.text().catch(() => '');
      throw new Error(`Failed to create Vapi assistant (${assistantResponse.status}): ${errText}`);
    }

    const assistant = await assistantResponse.json();
    const assistantId = assistant?.id;
    if (!assistantId) {
      throw new Error('Vapi assistant creation did not return an id');
    }

    const session = this.interviewSessionsRepo.create({
      userId,
      type: InterviewType.TECHNICAL,
      difficulty: options?.difficulty || InterviewDifficulty.INTERMEDIATE,
      status: InterviewStatus.IN_PROGRESS,
      startedAt: new Date(),
      aiInterviewerId: assistantId,
      analysisProvider: 'vapi',
      questions: [{ context: roleLabel }],
    });

    return this.interviewSessionsRepo.save(session);
  }

  async linkVapiCallToSession(
    userId: string,
    callId: string,
    metadata?: { assistantId?: string; interviewSessionId?: string },
  ) {
    const sessionId = metadata?.interviewSessionId;
    if (sessionId) {
      const session = await this.interviewSessionsRepo.findOne({
        where: { id: sessionId, userId },
      });
      if (session) {
        session.externalCallId = callId;
        if (!session.startedAt) {
          session.startedAt = new Date();
        }
        session.status = InterviewStatus.IN_PROGRESS;
        if (metadata?.assistantId) {
          session.aiInterviewerId = metadata.assistantId;
        }
        session.analysisProvider = 'vapi';
        return this.interviewSessionsRepo.save(session);
      }
    }
    return this.registerVapiCall(userId, callId, {
      assistantId: metadata?.assistantId,
    });
  }

  async getVapiReportForSession(sessionId: string, userId: string) {
    const session = await this.interviewSessionsRepo.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.analysis?.metrics || session.analysis?.summary) {
      return session;
    }

    if (session.externalCallId) {
      await this.fetchVapiAnalysisNow(session.externalCallId);
      const refreshed = await this.interviewSessionsRepo.findOne({
        where: { id: sessionId, userId },
      });
      if (refreshed) return refreshed;
    }

    throw new NotFoundException('Report not ready');
  }

  async registerVapiCall(
    userId: string,
    callId: string,
    metadata?: { assistantId?: string },
  ) {
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
    let session = await this.interviewSessionsRepo.findOne({
      where: { externalCallId: callId },
    });

    if (!session && userId) {
      await this.registerVapiCall(userId, callId);
      session = await this.interviewSessionsRepo.findOne({
        where: { externalCallId: callId },
      });
    }

    if (!session) throw new NotFoundException('Vapi session not found');
    if (userId && session.userId !== userId)
      throw new NotFoundException('Vapi session not found');

    const needsRefresh =
      !session.analysis?.raw ||
      (!session.analysis?.logs && !!session.analysis?.logUrl) ||
      (!session.analysis?.summary && !!session.feedback);

    if (!session.analysis || needsRefresh) {
      await this.fetchVapiAnalysisNow(callId);
      const refreshed = await this.interviewSessionsRepo.findOne({
        where: { externalCallId: callId },
      });
      if (refreshed) return refreshed;
    }
    return session;
  }

  private normalizeVapiScores(analysis: any) {
    if (!analysis) return null;
    const scores =
      analysis.scores ||
      analysis.scoring ||
      analysis.evaluation ||
      analysis.metrics ||
      {};

    const overall =
      typeof scores.overall === 'number'
        ? scores.overall
        : typeof scores.overallScore === 'number'
          ? scores.overallScore
          : typeof analysis.overallScore === 'number'
            ? analysis.overallScore
            : typeof analysis.score === 'number'
              ? analysis.score
              : null;

    const technical =
      scores.technical ??
      scores.tech ??
      analysis.technicalScore ??
      (typeof analysis.technical === 'number' ? analysis.technical : null);
    const communication =
      scores.communication ??
      scores.comm ??
      analysis.communicationScore ??
      (typeof analysis.communication === 'number'
        ? analysis.communication
        : null);
    const problemSolving =
      scores.problemSolving ??
      scores.problem_solving ??
      analysis.problemSolvingScore ??
      (typeof analysis.problemSolving === 'number'
        ? analysis.problemSolving
        : null);

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
    const feedback: Array<{ type: 'strength' | 'improvement'; text: string }> =
      [];
    const strengths = analysis?.strengths || analysis?.positive || [];
    const improvements = analysis?.improvements || analysis?.negative || [];

    if (Array.isArray(strengths)) {
      strengths.forEach((text) => feedback.push({ type: 'strength', text }));
    }
    if (Array.isArray(improvements)) {
      improvements.forEach((text) =>
        feedback.push({ type: 'improvement', text }),
      );
    }

    return feedback;
  }

  private async saveVapiAnalysis(callId: string, data: any) {
    const session = await this.interviewSessionsRepo.findOne({
      where: { externalCallId: callId },
    });
    if (!session) return;

    const callData = data || {};
    const analysis = callData?.analysis || callData?.summary || null;
    const artifact = callData?.artifact || {};
    const transcript =
      artifact?.transcript ||
      analysis?.transcript ||
      callData?.transcript ||
      null;
    const logUrl =
      artifact?.logUrl || callData?.logUrl || analysis?.logUrl || null;
    let logs =
      artifact?.messages ||
      callData?.messages ||
      callData?.conversation ||
      analysis?.logs ||
      analysis?.messages ||
      null;
    const structuredData = analysis?.structuredData || null;
    const structuredMetrics = structuredData?.metrics || null;
    const metricsSource =
      structuredMetrics && typeof structuredMetrics === 'object'
        ? structuredMetrics
        : structuredData || analysis;
    const feedbackSource = structuredData || analysis;
    const normalizedScores = this.normalizeVapiScores(metricsSource);
    const feedback = this.normalizeVapiFeedback(feedbackSource);
    const summary =
      analysis?.summary ||
      feedbackSource?.feedback ||
      analysis?.feedback ||
      null;

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

    if (
      normalizedScores?.overallScore !== null &&
      normalizedScores?.overallScore !== undefined
    ) {
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
    session.strengths =
      feedbackSource?.strengths || analysis?.strengths || session.strengths;
    session.improvements =
      feedbackSource?.improvements ||
      analysis?.improvements ||
      session.improvements;

    await this.interviewSessionsRepo.save(session);

    if (session.aiInterviewerId) {
      try {
        await this.deleteVapiAssistant(session.aiInterviewerId);
      } catch (error) {
        console.warn('Failed to delete Vapi assistant', error);
      }
    }
  }

  private async deleteVapiAssistant(assistantId: string) {
    const vapiSecret = process.env.VAPI_API_KEY;
    const vapiBase = process.env.VAPI_BASE_URL || 'https://api.vapi.ai';
    if (!vapiSecret) {
      throw new Error('VAPI_API_KEY is not configured');
    }

    const response = await fetch(`${vapiBase}/assistant/${assistantId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${vapiSecret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Failed to delete Vapi assistant (${response.status}): ${errText}`);
    }
  }
}
