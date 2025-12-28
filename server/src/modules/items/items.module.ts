import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { TrashCleanupService } from './trash-cleanup.service';
import { ReminderService } from './reminder.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadModule } from 'src/modules/upload/upload.module';
import { UsersModule } from 'src/modules/users/users.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [UploadModule, ScheduleModule.forRoot(), UsersModule, MailModule],
  controllers: [ItemsController],
  providers: [
    ItemsService,
    TrashCleanupService,
    ReminderService,
    PrismaService,
  ],
  exports: [ItemsService],
})
export class ItemsModule {}
