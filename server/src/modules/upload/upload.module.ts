import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ChunkedUploadController } from './chunked-upload.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [UploadController, ChunkedUploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
