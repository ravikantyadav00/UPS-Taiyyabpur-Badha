import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Security Middleware
  app.use(helmet());
  app.use(cookieParser());

  // Enable CORS
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';
  const rawCorsOrigin = configService.get<string>('corsOrigin') || 'http://localhost:3000';
  const configuredOrigins = rawCorsOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile native apps, cURL, or Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Allow origins explicitly specified in CORS_ORIGIN config
      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development mode, allow any localhost or 127.0.0.1 port (Expo Web, Next.js dev, etc.)
      if (nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      callback(new Error(`CORS origin '${origin}' not allowed by policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('School Management System API')
    .setDescription('REST API Documentation for Multi-Tenant School Management System - Phase 1')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port') || 3001;
  await app.listen(port);
  logger.log(`Server running on port ${port}`);
  logger.log(`Swagger API Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
