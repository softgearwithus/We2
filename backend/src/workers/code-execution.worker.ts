import { Worker, Job } from 'bullmq';
import Docker from 'dockerode';
import * as tar from 'tar-stream';
import { DataSource } from 'typeorm';
import { Submission } from '../dsa/entities/submission.entity';
import { DsaProblem } from '../dsa/entities/dsa-problem.entity';
import { CodeExecutionJob } from '../queue/code-execution.queue';
import { Readable } from 'stream';
import { User } from '../users/user.entity';
import { UserGamification } from '../gamification/entities/user-gamification.entity';
import { Badge } from '../gamification/entities/badge.entity';

// Initialize TypeORM manually for worker process
const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [Submission, DsaProblem, User, UserGamification, Badge],
    synchronize: true,
});

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '//./pipe/docker_engine' });

// Language to image mapping
const DOCKER_IMAGES: Record<string, string> = {
    javascript: 'code-executor-js:latest',
    python: 'code-executor-py:latest',
    java: 'code-executor-java:latest',
};

// Resource limits
const RESOURCE_LIMITS = {
    memory: 256 * 1024 * 1024, // 256MB
    memorySwap: 256 * 1024 * 1024, // No swap
    cpuQuota: 50000, // 50% of one CPU
    cpuPeriod: 100000,
    pidsLimit: 50, // Max 50 processes
};

/**
 * Code Execution Worker
 * Processes code execution jobs from the queue
 */
export async function startCodeExecutionWorker() {
    // Initialize Database
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('📦 Worker database connection initialized');
    }

    const submissionRepo = AppDataSource.getRepository(Submission);

    const worker = new Worker<CodeExecutionJob>(
        'code-execution',
        async (job: Job<CodeExecutionJob>) => {
            console.log(`Processing job ${job.id} for submission ${job.data.submissionId}`);

            try {
                // Update submission status to 'running'
                await submissionRepo.update(job.data.submissionId, { status: 'running' as any });

                // Execute code
                const result = await executeCodeInDocker(job.data);

                // Save results to database
                const failedCase = result.results.find((r: any) => r.failedCase);

                await submissionRepo.update(job.data.submissionId, {
                    status: result.status as any,
                    passedTests: result.passedTests,
                    totalTests: result.totalTests,
                    runtimeMs: result.runtime ? `${result.runtime}ms` : null,
                    memoryKb: result.memory ? `${result.memory}KB` : null,
                    failedTestInput: failedCase?.failedCase?.input,
                    failedTestExpected: failedCase?.failedCase?.expected,
                    failedTestActual: failedCase?.failedCase?.actual,
                    completedAt: new Date(),
                });

                // --- GAMIFICATION TRIGGER ---
                if (result.status === 'accepted') {
                    try {
                        const gamificationRepo = AppDataSource.getRepository(UserGamification);
                        const problemRepo = AppDataSource.getRepository(DsaProblem);

                        const problem = await problemRepo.findOne({ where: { id: job.data.problemId } });
                        let profile = await gamificationRepo.findOne({ where: { userId: job.data.userId } });

                        if (!profile) {
                            profile = gamificationRepo.create({ userId: job.data.userId });
                        }

                        // Calculate XP
                        const xpMap: any = { Easy: 10, Medium: 30, Hard: 50 };
                        const xpEarned = problem ? (xpMap[problem.difficulty] || 10) : 10;

                        profile.totalXp += xpEarned;
                        profile.currentLevel = Math.floor(1 + Math.sqrt(profile.totalXp / 100));

                        // Streak Logic
                        const now = new Date();
                        const last = profile.lastActivityDate ? new Date(profile.lastActivityDate) : null;

                        if (last) {
                            const diffHours = (now.getTime() - last.getTime()) / (1000 * 3600);
                            if (diffHours < 24 && now.getDate() !== last.getDate()) {
                                profile.currentStreak += 1; // Continued streak
                            } else if (diffHours > 48) {
                                profile.currentStreak = 1; // Reset
                            }
                        } else {
                            profile.currentStreak = 1;
                        }

                        if (profile.currentStreak > profile.maxStreak) {
                            profile.maxStreak = profile.currentStreak;
                        }

                        profile.lastActivityDate = now;
                        await gamificationRepo.save(profile);
                        console.log(`🎮 XP Awarded: +${xpEarned} for User ${job.data.userId}`);
                    } catch (gError) {
                        console.error('Gamification update failed', gError);
                    }
                }
                // --- END GAMIFICATION ---

                return result;
            } catch (error: any) {
                console.error(`Job ${job.id} failed:`, error);

                // Update submission with error
                await submissionRepo.update(job.data.submissionId, {
                    status: 'runtime_error' as any,
                    error: error.message,
                });

                throw error;
            }
        },
        {
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
        },
    );

    // Event listeners
    worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed:`, err);
    });

    worker.on('error', (err) => {
        console.error('Worker error:', err);
    });

    return worker;
}

/**
 * Execute code in Docker container
 */
async function executeCodeInDocker(data: CodeExecutionJob) {
    const { language, code, testCases } = data;

    const containerImage = DOCKER_IMAGES[language];
    if (!containerImage) {
        throw new Error(`Unsupported language: ${language}`);
    }

    // Sanitize code
    const sanitizedCode = sanitizeCode(code);

    let passedTests = 0;
    const results: any[] = [];
    let totalRuntime = 0;
    let peakMemory = 0;

    // Execute each test case
    for (const testCase of testCases) {
        try {
            const testResult = await runTestCase(
                containerImage,
                language,
                sanitizedCode,
                testCase.input,
                testCase.expectedOutput,
            );

            const passed = testResult.output.trim() === testCase.expectedOutput.trim();
            if (passed) passedTests++;

            totalRuntime += testResult.runtime;
            peakMemory = Math.max(peakMemory, testResult.memory);

            const resultEntry: any = {
                testCaseId: testCase.id,
                passed,
                output: testResult.output,
                error: testResult.error,
                runtime: testResult.runtime,
            };

            // If failed and not hidden, store failed case
            if (!passed && !testCase.isHidden) {
                resultEntry.failedCase = {
                    input: testCase.input,
                    expected: testCase.expectedOutput,
                    actual: testResult.output,
                };
            }

            results.push(resultEntry);

        } catch (error: any) {
            // Test case execution error
            results.push({
                testCaseId: testCase.id,
                passed: false,
                error: error.message,
            });
        }
    }

    // Determine final status
    const status =
        passedTests === testCases.length
            ? 'accepted'
            : passedTests > 0
                ? 'wrong_answer'
                : 'runtime_error';

    return {
        status,
        passedTests,
        totalTests: testCases.length,
        runtime: Math.round(totalRuntime / testCases.length),
        memory: Math.round(peakMemory / 1024), // Convert to KB
        results,
    };
}

/**
 * Run a single test case in a Docker container
 */
async function runTestCase(
    image: string,
    language: string,
    code: string,
    input: string,
    expectedOutput: string,
): Promise<{ output: string; error: string; runtime: number; memory: number }> {
    const startTime = Date.now();

    // Create container
    const container = await docker.createContainer({
        Image: image,
        // ... existing config ...
        Cmd: language === 'javascript' ? ['node', '/app/executor.js'] :
            language === 'python' ? ['python3', '/app/executor.py'] :
                ['/app/executor'], // Generic default
        Tty: false,
        OpenStdin: true,
        StdinOnce: true,
        NetworkDisabled: true,
        // ReadonlyRootfs: true, // Type definition missing in some dockerode versions
        HostConfig: {
            Memory: RESOURCE_LIMITS.memory,
            MemorySwap: RESOURCE_LIMITS.memorySwap,
            CpuQuota: RESOURCE_LIMITS.cpuQuota,
            CpuPeriod: RESOURCE_LIMITS.cpuPeriod,
            PidsLimit: RESOURCE_LIMITS.pidsLimit,
            AutoRemove: true,
            SecurityOpt: ['no-new-privileges'],
            CapDrop: ['ALL'],
        } as any,
    });

    try {
        // Start container
        await container.start();

        // Create tar archive with user code
        const tarStream = createCodeTarball(code, language);
        await container.putArchive(tarStream, { path: '/app/temp' });

        // Attach to container stdio
        const stream = await container.attach({
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true,
        });

        let stdout = '';
        let stderr = '';

        // Write input to stdin
        stream.write(input + '\n');
        stream.end();

        // Collect output
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                container.stop().catch(() => { });
                reject(new Error('Time Limit Exceeded'));
            }, 5000); // 5 second timeout

            stream.on('data', (chunk: any) => {
                const str = chunk.toString();
                // Docker multiplexes stdout/stderr - simplified handling
                // Real implementation should parse header
                stdout += str;
            });

            stream.on('end', () => {
                clearTimeout(timeout);
                resolve();
            });

            stream.on('error', (err: any) => {
                clearTimeout(timeout);
                reject(err);
            });
        });

        // Wait for container to finish
        await container.wait();

        // Get container stats
        const stats = await container.stats({ stream: false });
        const runtime = Date.now() - startTime;
        const memory = stats.memory_stats?.usage || 0;

        // Cleanup - force remove just in case
        // AutoRemove usually handles it but explicit is safer
        try { await container.remove({ force: true }); } catch (e) { }

        // Clean output (remove Docker stream headers if present - simplified)
        // In production, use docker-modem's demuxStream
        // For now, simple cleaning
        const cleanOutput = stdout.replace(/[\u0000-\u0008]/g, '').trim();

        return {
            output: cleanOutput,
            error: stderr.trim(),
            runtime,
            memory,
        };

    } catch (error) {
        // Ensure cleanup
        try { await container.remove({ force: true }); } catch (e) { }
        throw error;
    }
}

/**
 * Create tar archive containing user code
 */
function createCodeTarball(code: string, language: string): Readable {
    const pack = tar.pack();

    const extensions: Record<string, string> = {
        javascript: 'solution.js',
        python: 'solution.py',
        java: 'Solution.java',
        cpp: 'solution.cpp'
    };

    const filename = extensions[language] || 'solution.txt';

    pack.entry({ name: filename }, code, (err) => {
        if (err) throw err;
        pack.finalize();
    });

    return pack;
}

/**
 * Sanitize user code to prevent malicious patterns
 */
function sanitizeCode(code: string): string {
    // Check for dangerous patterns
    const dangerousPatterns = [
        /require\s*\(/gi,
        /import\s+/gi,
        /process\./gi,
        /child_process/gi,
        /fs\./gi,
        /exec\(/gi,
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
            throw new Error('Code contains forbidden patterns');
        }
    }

    return code;
}
