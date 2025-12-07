import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  refreshTokenHash?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

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
  async updateProfile(
    id: string,
    data: {
      name?: string;
      phone?: string;
      password?: string;
    },
  ): Promise<User> {
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
  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
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
  async adminCreate(data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role?: 'ADMIN' | 'USER';
    isActive?: boolean;
    isEmailVerified?: boolean;
  }): Promise<User> {
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
  async adminUpdate(
    id: string,
    data: {
      name?: string;
      phone?: string;
      avatar?: string;
      password?: string;
      role?: 'ADMIN' | 'USER';
      isActive?: boolean;
      isEmailVerified?: boolean;
    },
  ): Promise<User> {
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
}
