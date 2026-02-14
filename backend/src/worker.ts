import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startCodeExecutionWorker } from './workers/code-execution.worker';

/**
 * Worker Process Entry Point
 * Starts the code execution worker without HTTP server
 */
async function bootstrap() {
    console.log('🚀 Starting Code Execution Worker...');

    // Create NestJS application context (without HTTP)
    const app = await NestFactory.createApplicationContext(AppModule);

    // Start worker
    const worker = await startCodeExecutionWorker();

    console.log('✅ Worker started successfully');
    console.log(`📊 Concurrency: ${process.env.WORKER_CONCURRENCY || 5}`);
    console.log(`🔗 Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('📴 Received SIGTERM, shutting down gracefully...');
        await worker.close();
        await app.close();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('📴 Received SIGINT, shutting down gracefully...');
        await worker.close();
        await app.close();
        process.exit(0);
    });
}

bootstrap().catch((error) => {
    console.error('❌ Worker failed to start:', error);
    process.exit(1);
});
