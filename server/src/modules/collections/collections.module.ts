import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadModule } from '../upload/upload.module';
import { SharedCollectionsModule } from '../shared-collections/shared-collections.module';

@Module({
  imports: [UploadModule, SharedCollectionsModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, PrismaService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
