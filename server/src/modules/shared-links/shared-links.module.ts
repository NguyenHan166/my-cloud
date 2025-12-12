import { Module } from '@nestjs/common';
import { SharedLinksController } from './shared-links.controller';
import { SharedLinksService } from './shared-links.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SharedLinksController],
  providers: [SharedLinksService, PrismaService],
  exports: [SharedLinksService],
})
export class SharedLinksModule {}
