import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger/logger.module';
import { appConfig } from './config/app.config';
import { jwtConfig } from './config/jwt.config';
import { mailConfig } from './config/mail.config';
import { adminConfig } from './config/admin.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { SeedModule } from './seed/seed.module';
import { UploadModule } from './upload/upload.module';
import { TagsModule } from './tags/tags.module';
import { ItemsModule } from './items/items.module';
import { CollectionsModule } from './collections/collections.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, mailConfig, adminConfig],
      envFilePath: ['.env.local', '.env'],
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
