import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PlatformGuard } from './admin-settings/guards/platform.guard';
import { LastActiveInterceptor } from './admin-settings/interceptors/last-active.interceptor';

import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const environment = process.env.NODE_ENV || 'development';
  const dbHost = process.env.PGHOST || process.env.DB_HOST || 'unknown';
  console.log(`[config] env=${environment} dbHost=${dbHost}`);
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  if (instance?.disable) {
    instance.disable('x-powered-by');
  }
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
    }),
  );

  app.useGlobalGuards(app.get(PlatformGuard));
  app.useGlobalInterceptors(app.get(LastActiveInterceptor));

  // Enable CORS
  const isDevelopment = environment === 'development';
  const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const envOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow all origins in development, or if the origin is in the allowed list
      if (!origin || isDevelopment || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('College Prep Platform API')
    .setDescription('Industry Simulation Career Platform - REST API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('simulations', 'Industry simulation workflows')
    .addTag('tasks', 'Task management')
    .addTag('teams', 'Team collaboration')
    .addTag('analytics', 'Performance analytics')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
