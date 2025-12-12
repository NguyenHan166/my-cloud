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
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MailModule } from './mail/mail.module';
import { SeedModule } from './seed/seed.module';
import { UploadModule } from './modules/upload/upload.module';
import { TagsModule } from './modules/tags/tags.module';
import { ItemsModule } from './modules/items/items.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { SharedLinksModule } from './modules/shared-links/shared-links.module';

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
    SharedLinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
