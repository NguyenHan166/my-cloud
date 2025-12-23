import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { RedisCacheModule } from './modules/redis';
import { QueueModule } from './modules/queue';
import { appConfig } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { mailConfig } from './config/mail.config';
import { adminConfig } from './config/admin.config';
import { redisConfig } from './config/redis.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MailModule } from './mail/mail.module';
import { SeedModule } from './modules/seed/seed.module';
import { UploadModule } from './modules/upload/upload.module';
import { TagsModule } from './modules/tags/tags.module';
import { ItemsModule } from './modules/items/items.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { SharedLinksModule } from './modules/shared-links/shared-links.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SharedCollectionsModule } from './modules/shared-collections/shared-collections.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, mailConfig, adminConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    // Redis Cache (using ioredis directly)
    RedisCacheModule,
    // Background Job Queue (using BullMQ)
    QueueModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60 * 1000,
        limit: 100,
      },
    ]),
    // Core modules
    LoggerModule,
    PrismaModule,
    MailModule,
    // Feature modules
    AuthModule,
    UsersModule,
    SeedModule,
    UploadModule,
    TagsModule,
    ItemsModule,
    CollectionsModule,
    SharedLinksModule,
    SharedCollectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
