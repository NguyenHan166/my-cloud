import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { TrashCleanupService } from './trash-cleanup.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadModule } from 'src/modules/upload/upload.module';

@Module({
  imports: [UploadModule, ScheduleModule.forRoot()],
  controllers: [ItemsController],
  providers: [ItemsService, TrashCleanupService, PrismaService],
  exports: [ItemsService],
})
export class ItemsModule {}
