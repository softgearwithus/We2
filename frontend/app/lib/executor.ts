import { Problem } from "./problems";
import API_BASE_URL from "./api-config";

export type ExecutionStatus = 'Running' | 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Compile Error';

export interface ExecutionResult {
    status: ExecutionStatus;
    totalTests: number;
    passedTests: number;
    runtime: string;
    memory: string;
    error?: string;
    failedCase?: {
        input: string;
        expected: string;
        actual: string;
    };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mapStatus = (status: string): ExecutionStatus => {
    switch (status) {
        case 'accepted': return 'Accepted';
        case 'wrong_answer': return 'Wrong Answer';
        case 'runtime_error': return 'Runtime Error';
        case 'time_limit_exceeded': return 'Time Limit Exceeded';
        case 'compile_error': return 'Compile Error';
        case 'running': return 'Running';
        case 'queued': return 'Running';
        case 'pending': return 'Running';
        default: return 'Runtime Error';
    }
};

export const executeCode = async (
    problemId: string, // This is the UUID now
    code: string,
    language: string,
    token: string // Add token argument
): Promise<ExecutionResult> => {

    if (!code || code.trim().length === 0) {
        return {
            status: 'Runtime Error',
            totalTests: 0,
            passedTests: 0,
            runtime: '0ms',
            memory: '0MB',
            error: 'No code provided.'
        };
    }

    try {
        // 1. Submit Code
        const submitRes = await fetch(`${API_BASE_URL}/dsa/submissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                problemId,
                language,
                code,
                status: 'queued',
                passedTests: 0,
                totalTests: 0
            })
        });

        if (!submitRes.ok) {
            const err = await submitRes.json();
            throw new Error(err.message || 'Submission failed');
        }

        const { submissionId, queuePosition } = await submitRes.json();

        // 2. Poll for results
        const maxRetries = 20; // 20 * 1s = 20s max wait
        let retries = 0;

        while (retries < maxRetries) {
            await delay(1000); // Poll every 1s

            const statusRes = await fetch(`${API_BASE_URL}/dsa/submissions/${submissionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!statusRes.ok) continue;

            const submission = await statusRes.json();

            if (submission.status !== 'queued' && submission.status !== 'running' && submission.status !== 'pending') {
                return {
                    status: mapStatus(submission.status),
                    totalTests: submission.totalTests || 0,
                    passedTests: submission.passedTests || 0,
                    runtime: submission.runtimeMs || '0ms',
                    memory: submission.memoryKb || '0KB',
                    error: submission.error,
                    failedCase: submission.failedTestCase // Backend returns failedTestCase object
                };
            }

            retries++;
        }

        return {
            status: 'Time Limit Exceeded',
            totalTests: 0,
            passedTests: 0,
            runtime: '0ms',
            memory: '0MB',
            error: 'Execution timed out (polling limit)'
        };

    } catch (err: any) {
        return {
            status: 'Runtime Error',
            totalTests: 0,
            passedTests: 0,
            runtime: '0ms',
            memory: '0MB',
            error: err.message || 'Network Error'
        };
    }
};
