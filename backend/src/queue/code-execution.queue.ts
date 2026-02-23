import { Queue, QueueOptions } from 'bullmq';
import IORedis from 'ioredis';

let connection: IORedis | null = null;
let codeExecutionQueue: Queue | null = null;

export const isCodeExecutionEnabled = () => {
    const flag = process.env.CODE_EXECUTION_ENABLED;
    if (flag === 'true') return true;
    if (flag === 'false') return false;
    return process.env.NODE_ENV !== 'production';
};

const getConnection = () => {
    if (!connection) {
        connection = new IORedis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: null,
        });
    }
    return connection;
};

const getQueueOptions = (): QueueOptions => ({
    connection: getConnection(),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            age: 3600,
            count: 1000,
        },
        removeOnFail: {
            age: 86400,
        },
    },
});

const getQueue = () => {
    if (!isCodeExecutionEnabled()) {
        throw new Error('Code execution queue is disabled. Set CODE_EXECUTION_ENABLED=true to enable.');
    }
    if (!codeExecutionQueue) {
        codeExecutionQueue = new Queue('code-execution', getQueueOptions());
    }
    return codeExecutionQueue;
};

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
    const queue = getQueue();
    const job = await queue.add('execute', data, {
        priority: 1, // Higher priority for faster processing
    });

    return {
        jobId: job.id,
        submissionId: data.submissionId,
        queuePosition: await getQueuePosition(job.id as string),
    };
}

export async function getQueuePosition(jobId: string): Promise<number> {
    const queue = getQueue();
    const waiting = await queue.getWaiting();
    const position = waiting.findIndex((job) => job.id === jobId);
    return position === -1 ? 0 : position + 1;
}

export async function getJobStatus(jobId: string) {
    const queue = getQueue();
    const job = await queue.getJob(jobId);
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
    if (codeExecutionQueue) {
        await codeExecutionQueue.close();
        codeExecutionQueue = null;
    }
    if (connection) {
        await connection.quit();
        connection = null;
    }
}
