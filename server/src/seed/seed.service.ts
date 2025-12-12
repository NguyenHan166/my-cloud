import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../modules/users/users.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = this.configService.get<string>('admin.email');
    const adminPassword = this.configService.get<string>('admin.password');

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed',
      );
      return;
    }

    try {
      // Check if admin already exists
      const existingAdmin = await this.usersService.findByEmail(adminEmail);

      if (existingAdmin) {
        this.logger.log(`Admin user already exists: ${adminEmail}`);
        return;
      }

      // Create admin user
      const admin = await this.usersService.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
        isEmailVerified: true, // Admin is pre-verified
      });

      this.logger.log(`✅ Admin user created: ${admin.email}`);
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }
}
