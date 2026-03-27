import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { MockTestResult } from './entities/mock-test-result.entity';
import { MockTestStudentResponse } from './entities/mock-test-student-response.entity';
import { MockQuestionType } from './entities/mock-test-question.entity';

@Injectable()
export class TestEvaluationService {
  private readonly logger = new Logger(TestEvaluationService.name);
  private ai: GoogleGenAI;

  constructor(
    @InjectRepository(MockTestResult)
    private resultRepository: Repository<MockTestResult>,
    @InjectRepository(MockTestStudentResponse)
    private responseRepository: Repository<MockTestStudentResponse>,
  ) {
    // Initialize Gemini SDK
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not set. AI evaluation will be bypassed.',
      );
    } else {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Non-blocking background method to evaluate pending subjective questions
   */
  async evaluatePendingResponses(resultId: string) {
    if (!this.ai) {
      this.logger.warn(
        'Cannot evaluate Result ID ' + resultId + ' - No API Key.',
      );
      await this.markResultEvaluated(resultId);
      return;
    }

    try {
      const result = await this.resultRepository.findOne({
        where: { id: resultId },
        relations: ['responses', 'responses.question'],
      });

      if (!result || result.isEvaluated) return;

      const pendingResponses = result.responses.filter(
        (r) =>
          r.isCorrect === null &&
          (r.question.questionType === MockQuestionType.TEXT ||
            r.question.questionType === MockQuestionType.CODE),
      );

      if (pendingResponses.length === 0) {
        await this.markResultEvaluated(result.id);
        return;
      }

      for (const r of pendingResponses) {
        await this.evaluateSingleResponse(r);
      }

      // Recalculate Totals
      await this.recalculateResultTotals(result.id);
    } catch (error) {
      this.logger.error(
        `Error during AI Evaluation for Result ${resultId}:`,
        error,
      );
    }
  }

  private async evaluateSingleResponse(response: MockTestStudentResponse) {
    const question = response.question;
    const studentAnswer = response.responseValue;

    if (!studentAnswer || studentAnswer.trim() === '') {
      response.isCorrect = false;
      response.marksAwarded = 0;
      response.aiFeedback = 'No answer provided.';
      await this.responseRepository.save(response);
      return;
    }

    const prompt = `
 You are an expert technical evaluator grading a student's test submission for an exam.
 Analyze the student's answer based on the following question:

 Question Type: ${question.questionType}
 Question Text: ${question.questionText}
 Total Possible Marks: ${question.marks}
 Admin's Correct Answer / Reference Solution (if provided): ${question.correctAnswer || 'None'}
 Admin's Ideal Solution Details (if provided): ${question.solutionText || 'None'}

 Student's Answer:
 ${studentAnswer}

 Evaluate the student's answer.
 1. Determine if the logic and answer are fundamentally correct. (true/false)
 2. If the answer is correct, award up to ${question.marks}. If incorrect, award 0 marks.
 3. Provide concise feedback explaining your reasoning (maximum 4 sentences). Do not prefix with "Feedback:".

 Respond strictly as a JSON object with this shape:
 {
     "isCorrect": boolean,
     "marksAwarded": number,
     "feedback": "string"
 }
 `;

    try {
      const aiResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = aiResponse.text;
      if (text) {
        // Safely parse JSON that might be wrapped in ```json
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        }

        const parsed = JSON.parse(cleanText);
        const isCorrect = !!parsed.isCorrect;
        let awarded = Number(parsed.marksAwarded);
        if (!Number.isFinite(awarded)) awarded = 0;
        if (!isCorrect) awarded = 0;

        response.isCorrect = isCorrect;
        response.marksAwarded = awarded;

        // Clamp Marks
        if (response.marksAwarded > question.marks)
          response.marksAwarded = question.marks;
        if (response.marksAwarded < 0) response.marksAwarded = 0;

        response.aiFeedback = parsed.feedback || 'Evaluated successfully.';
      } else {
        this.fallbackEval(response);
      }
    } catch (error) {
      this.logger.error(`Failed to evaluate response via Gemini:`, error);
      this.fallbackEval(response);
    }

    await this.responseRepository.save(response);
  }

  private fallbackEval(response: MockTestStudentResponse) {
    response.isCorrect = false;
    response.marksAwarded = 0;
    response.aiFeedback = 'AI Evaluation Failed due to an internal error.';
  }

  private async recalculateResultTotals(resultId: string) {
    const result = await this.resultRepository.findOne({
      where: { id: resultId },
      relations: ['responses', 'responses.question'],
    });
    if (!result) return;

    let obtained = 0;
    for (const r of result.responses) {
      obtained += Number(r.marksAwarded || 0);
    }

    result.marksObtained = obtained;
    result.isEvaluated = true;
    await this.resultRepository.save(result);
  }

  private async markResultEvaluated(resultId: string) {
    await this.resultRepository.update(resultId, { isEvaluated: true });
  }
}
