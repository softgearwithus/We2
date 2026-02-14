import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumeService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not defined in environment variables');
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        }
    }

    async analyzeResume(buffer: Buffer, jobDescription?: string) {
        try {
            // 1. Parse PDF
            const pdfData = await pdfParse(buffer);
            const text = pdfData.text;

            if (!text || text.trim().length === 0) {
                throw new InternalServerErrorException('Could not extract text from the resume PDF.');
            }

            // 2. Analyze with Gemini
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
                return JSON.parse(jsonString);
            } catch (e) {
                console.error('Failed to parse Gemini response:', textResponse);
                throw new InternalServerErrorException('Failed to parse analysis result.');
            }

        } catch (error) {
            console.error('Error analyzing resume:', error);
            throw new InternalServerErrorException('Failed to analyze resume: ' + error.message);
        }
    }
}
