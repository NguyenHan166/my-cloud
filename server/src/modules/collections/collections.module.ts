import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, PrismaService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
