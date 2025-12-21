import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  CreateUserData,
  UpdateUserData,
  AdminCreateUserData,
  AdminUpdateUserData,
  FindAllParams,
  FindAllResult,
  UpdateProfileData,
} from './interfaces';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: data.name,
        isEmailVerified: data.isEmailVerified ?? false,
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpires: data.emailVerificationExpires,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.isEmailVerified !== undefined)
      updateData.isEmailVerified = data.isEmailVerified;
    if (data.emailVerificationToken !== undefined)
      updateData.emailVerificationToken = data.emailVerificationToken;
    if (data.emailVerificationExpires !== undefined)
      updateData.emailVerificationExpires = data.emailVerificationExpires;
    if (data.refreshTokenHash !== undefined)
      updateData.refreshTokenHash = data.refreshTokenHash;
    if (data.passwordResetToken !== undefined)
      updateData.passwordResetToken = data.passwordResetToken;
    if (data.passwordResetExpires !== undefined)
      updateData.passwordResetExpires = data.passwordResetExpires;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const refreshTokenHash = refreshToken
      ? await bcrypt.hash(refreshToken, 12)
      : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.refreshTokenHash) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }

  /**
   * Sanitize user object - remove sensitive fields
   */
  sanitize(
    user: User,
  ): Omit<
    User,
    | 'password'
    | 'refreshTokenHash'
    | 'emailVerificationToken'
    | 'passwordResetToken'
  > {
    const {
      password,
      refreshTokenHash,
      emailVerificationToken,
      passwordResetToken,
      ...sanitized
    } = user;
    return sanitized;
  }

  /**
   * Update user profile (for self)
   */
  async updateProfile(id: string, data: UpdateProfileData): Promise<User> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  // ========== ADMIN METHODS ==========

  /**
   * Find all users with pagination and filters (Admin only)
   */
  async findAll(params: FindAllParams): Promise<FindAllResult> {
    const {
      page,
      limit,
      search,
      isActive,
      isEmailVerified,
      sortBy,
      sortOrder,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search by email or name
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by isActive
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Filter by isEmailVerified
    if (isEmailVerified !== undefined) {
      where.isEmailVerified = isEmailVerified;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Admin create user (can set role, isActive, isEmailVerified)
   */
  async adminCreate(data: AdminCreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role || 'USER',
        isActive: data.isActive ?? true,
        isEmailVerified: data.isEmailVerified ?? false,
      },
    });
  }

  /**
   * Admin update user
   */
  async adminUpdate(id: string, data: AdminUpdateUserData): Promise<User> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isEmailVerified !== undefined)
      updateData.isEmailVerified = data.isEmailVerified;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Toggle user active status (soft delete/restore)
   */
  async toggleStatus(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  /**
   * Hard delete user (permanent)
   */
  async hardDelete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  // ========== STORAGE USAGE METHODS ==========

  private readonly DEFAULT_MAX_STORAGE_BYTES = BigInt(5 * 1024 * 1024 * 1024); // 5GB

  /**
   * Format bytes to GB string (always in GB for consistency)
   */
  private formatBytes(bytes: bigint | number): string {
    const bytesNum = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    const gb = bytesNum / (1024 * 1024 * 1024);

    // Format based on size for appropriate precision
    if (gb >= 10) {
      return `${gb.toFixed(1)} GB`;
    } else if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    } else if (gb >= 0.01) {
      return `${gb.toFixed(2)} GB`;
    } else {
      return `${gb.toFixed(3)} GB`;
    }
  }

  /**
   * Get storage usage for a user
   * Calculates actual storage from File table
   */
  async getStorageUsage(userId: string): Promise<{
    usedStorageBytes: number;
    maxStorageBytes: number;
    usedPercentage: number;
    itemCount: number;
    collectionCount: number;
    formattedUsed: string;
    formattedMax: string;
  }> {
    // Get or create UserUsage record
    let usage = await this.prisma.userUsage.findUnique({
      where: { userId },
    });

    if (!usage) {
      // Initialize usage record if not exists
      usage = await this.initializeUserUsage(userId);
    }

    // Calculate actual storage from files
    const storageResult = await this.prisma.file.aggregate({
      where: { userId },
      _sum: { size: true },
    });

    const usedBytes = storageResult._sum.size || BigInt(0);
    const maxBytes = usage.maxStorageBytes || this.DEFAULT_MAX_STORAGE_BYTES;

    // Get counts
    const [itemCount, collectionCount] = await Promise.all([
      this.prisma.item.count({ where: { userId, isTrashed: false } }),
      this.prisma.collection.count({ where: { userId } }),
    ]);

    // Calculate percentage
    const usedPercentage =
      maxBytes > 0
        ? Math.min(
            100,
            Math.round((Number(usedBytes) / Number(maxBytes)) * 100),
          )
        : 0;

    return {
      usedStorageBytes: Number(usedBytes),
      maxStorageBytes: Number(maxBytes),
      usedPercentage,
      itemCount,
      collectionCount,
      formattedUsed: this.formatBytes(usedBytes),
      formattedMax: this.formatBytes(maxBytes),
    };
  }

  /**
   * Initialize UserUsage record for a user
   */
  async initializeUserUsage(userId: string) {
    return this.prisma.userUsage.create({
      data: {
        userId,
        usedStorageBytes: BigInt(0),
        maxStorageBytes: this.DEFAULT_MAX_STORAGE_BYTES,
        itemCount: 0,
        maxItems: 0,
        collectionCount: 0,
        maxCollections: 0,
      },
    });
  }

  /**
   * Update storage usage after file operations (upload/delete)
   * Should be called by ItemsService after file changes
   */
  async updateStorageUsage(userId: string): Promise<void> {
    try {
      // Calculate actual storage from files
      const storageResult = await this.prisma.file.aggregate({
        where: { userId },
        _sum: { size: true },
      });

      const usedBytes = storageResult._sum.size || BigInt(0);

      // Get counts
      const [itemCount, collectionCount] = await Promise.all([
        this.prisma.item.count({ where: { userId, isTrashed: false } }),
        this.prisma.collection.count({ where: { userId } }),
      ]);

      // Upsert UserUsage record
      await this.prisma.userUsage.upsert({
        where: { userId },
        create: {
          userId,
          usedStorageBytes: usedBytes,
          maxStorageBytes: this.DEFAULT_MAX_STORAGE_BYTES,
          itemCount,
          collectionCount,
        },
        update: {
          usedStorageBytes: usedBytes,
          itemCount,
          collectionCount,
        },
      });

      this.logger.debug(
        `Storage usage updated for user ${userId}: ${this.formatBytes(usedBytes)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update storage usage for user ${userId}:`,
        error,
      );
    }
  }
}
