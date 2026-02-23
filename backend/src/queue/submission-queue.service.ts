import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DsaProblem } from '../dsa/entities/dsa-problem.entity';
import { Submission, SubmissionSource, SubmissionStatus } from '../dsa/entities/submission.entity';
import { CreateSubmissionDto } from '../dsa/dto/create-submission.dto';
import { addCodeExecutionJob, isCodeExecutionEnabled } from './code-execution.queue';

@Injectable()
export class SubmissionQueueService {
    constructor(
        @InjectRepository(DsaProblem)
        private problemsRepository: Repository<DsaProblem>,
        @InjectRepository(Submission)
        private submissionsRepository: Repository<Submission>,
    ) { }

    /**
     * Submit code for execution
     * Creates submission record and adds job to queue
     */
    async submitCode(userId: string, dto: CreateSubmissionDto) {
        if (!isCodeExecutionEnabled()) {
            throw new ServiceUnavailableException('Code execution is disabled in this environment.');
        }
        // Get problem with test cases
        const problem = await this.problemsRepository.findOne({
            where: { id: dto.problemId, isActive: true },
        });

        if (!problem) {
            throw new Error('Problem not found');
        }

        // Create submission record with status 'queued'
        // Type assertion to workaround overload confusion
        const submission = this.submissionsRepository.create({
            userId,
            problemId: dto.problemId,
            language: dto.language,
            code: dto.code,
            status: SubmissionStatus.QUEUED,
            totalTests: problem.testCases.length,
            source: dto.source || SubmissionSource.PRACTICE,
        } as unknown as Submission);

        const savedSubmission = await this.submissionsRepository.save(submission);

        // Add job to execution queue
        const jobInfo = await addCodeExecutionJob({
            submissionId: savedSubmission.id,
            userId,
            problemId: dto.problemId,
            language: dto.language as any,
            code: dto.code,
            testCases: problem.testCases.map((tc, idx) => ({
                id: `tc-${idx}`,
                input: tc.input,
                expectedOutput: tc.expected,
                isHidden: tc.isHidden || false,
            })),
        });

        return {
            submissionId: savedSubmission.id,
            status: SubmissionStatus.QUEUED,
            queuePosition: jobInfo.queuePosition,
            estimatedWaitTime: jobInfo.queuePosition * 2, // Estimate 2 seconds per submission
        };
    }

    /**
     * Get submission status and results
     */
    async getSubmission(submissionId: string) {
        const submission = await this.submissionsRepository.findOne({
            where: { id: submissionId },
            relations: ['problem'],
        });

        if (!submission) {
            throw new Error('Submission not found');
        }

        return {
            id: submission.id,
            problemId: submission.problemId,
            problemTitle: submission.problem.title,
            language: submission.language,
            status: submission.status,
            passedTests: submission.passedTests,
            totalTests: submission.totalTests,
            runtime: submission.runtimeMs,
            memory: submission.memoryKb,
            score: submission.score,
            errorMessage: submission.error,
            failedTestCase: submission.failedTestInput
                ? {
                    input: submission.failedTestInput,
                    expected: submission.failedTestExpected,
                    actual: submission.failedTestActual,
                }
                : null,
            submittedAt: submission.submittedAt,
            completedAt: submission.completedAt,
        };
    }
}
