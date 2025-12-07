import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';
import { adminConfig } from '../config/admin.config';

@Module({
  imports: [ConfigModule.forFeature(adminConfig), UsersModule],
  providers: [SeedService],
})
export class SeedModule {}
