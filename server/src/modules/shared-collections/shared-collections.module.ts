import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SharedCollectionsController } from './shared-collections.controller';
import { SharedCollectionsService } from './shared-collections.service';

@Module({
  imports: [PrismaModule],
  controllers: [SharedCollectionsController],
  providers: [SharedCollectionsService],
  exports: [SharedCollectionsService],
})
export class SharedCollectionsModule {}
