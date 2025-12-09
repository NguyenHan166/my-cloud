import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLogger } from './common/logger/logger.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfig } from './config/app.config';

async function bootstrap() {
  const logger = CustomLogger.create('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get config service
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  // Set custom logger
  app.useLogger(CustomLogger.create('NestApplication'));

  // Enable CORS
  app.enableCors({
    origin: appConfig?.corsOrigin || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global prefix
  const apiPrefix = appConfig?.apiPrefix || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Personal Cloud API')
    .setDescription(
      'Personal cloud storage and management system - API Documentation',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in controllers.
    )
    .addTag('auth', 'Authentication & Authorization')
    .addTag('users', 'User management')
    .addTag('items', 'Items (Files, Notes, Links)')
    .addTag('collections', 'Collections management')
    .addTag('tags', 'Tags management')
    .addTag('shared-links', 'Shared links')
    .addTag('upload', 'File upload')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Persist authorization data between page refreshes
    },
  });

  // Global pipes
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

  // Global filters (order matters: AllExceptionsFilter should be last to catch unhandled)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Start server
  const port = appConfig?.port || 3000;
  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(`📝 Environment: ${appConfig?.nodeEnv || 'development'}`);
}

bootstrap();
