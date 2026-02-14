import { Queue, QueueOptions } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection configuration
const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});

// Queue options
const queueOptions: QueueOptions = {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 3600, // Remove completed jobs after 1 hour
            count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
            age: 86400, // Remove failed jobs after 24 hours
        },
    },
};

// Code execution queue
export const codeExecutionQueue = new Queue('code-execution', queueOptions);

// Job data interfaces
export interface CodeExecutionJob {
    submissionId: string;
    userId: string;
    problemId: string;
    language: 'javascript' | 'python' | 'java';
    code: string;
    testCases: Array<{
        id: string;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }>;
}

// Queue operations
export async function addCodeExecutionJob(data: CodeExecutionJob) {
    const job = await codeExecutionQueue.add('execute', data, {
        priority: 1, // Higher priority for faster processing
    });

    return {
        jobId: job.id,
        submissionId: data.submissionId,
        queuePosition: await getQueuePosition(job.id as string),
    };
}

export async function getQueuePosition(jobId: string): Promise<number> {
    const waiting = await codeExecutionQueue.getWaiting();
    const position = waiting.findIndex((job) => job.id === jobId);
    return position === -1 ? 0 : position + 1;
}

export async function getJobStatus(jobId: string) {
    const job = await codeExecutionQueue.getJob(jobId);
    if (!job) {
        return null;
    }

    const state = await job.getState();
    return {
        id: job.id,
        state,
        progress: job.progress,
        data: job.data,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason,
    };
}

// Graceful shutdown
export async function closeQueue() {
    await codeExecutionQueue.close();
    await connection.quit();
}
