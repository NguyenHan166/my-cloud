import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  CreateSharedLinkDto,
  QuerySharedLinksDto,
  AccessSharedLinkDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SharedLinksService {
  private readonly logger = new Logger(SharedLinksService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:5173';
  }

  /**
   * Create a share link for an item
   */
  async createShareLink(
    data: CreateSharedLinkDto,
    userId: string,
  ): Promise<any> {
    // Verify item exists and belongs to user
    const item = await this.prisma.item.findUnique({
      where: { id: data.itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to share this item',
      );
    }

    // Generate unique token
    const token = await this.generateUniqueToken();

    // Hash password if provided
    const passwordHash = data.password
      ? await this.hashPassword(data.password)
      : null;

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + data.expiresIn);

    // Create share link
    const shareLink = await this.prisma.sharedLink.create({
      data: {
        userId,
        itemId: data.itemId,
        token,
        passwordHash,
        expiresAt,
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    this.logger.log(
      `Share link created: ${shareLink.id} for item ${data.itemId}`,
    );

    return {
      id: shareLink.id,
      token: shareLink.token,
      url: `${this.baseUrl}/s/${shareLink.token}`,
      expiresAt: shareLink.expiresAt,
      hasPassword: !!shareLink.passwordHash,
      item: shareLink.item,
      createdAt: shareLink.createdAt,
    };
  }

  /**
   * Find all share links for a user
   */
  async findUserLinks(
    userId: string,
    query: QuerySharedLinksDto,
  ): Promise<any> {
    const { itemId, revoked, page = 1, limit = 20 } = query;

    const where: Prisma.SharedLinkWhereInput = {
      userId,
    };

    if (itemId) {
      where.itemId = itemId;
    }

    if (revoked !== undefined) {
      where.revoked = revoked;
    }

    const total = await this.prisma.sharedLink.count({ where });

    const links = await this.prisma.sharedLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    // Transform response
    const data = links.map((link) => ({
      id: link.id,
      token: link.token,
      url: `${this.baseUrl}/s/${link.token}`,
      expiresAt: link.expiresAt,
      revoked: link.revoked,
      hasPassword: !!link.passwordHash,
      accessCount: link.accessCount,
      item: link.item,
      createdAt: link.createdAt,
      isExpired: new Date() > link.expiresAt,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Revoke a share link
   */
  async revokeLink(
    linkId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const link = await this.prisma.sharedLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Share link not found');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to revoke this link',
      );
    }

    await this.prisma.sharedLink.update({
      where: { id: linkId },
      data: { revoked: true },
    });

    this.logger.log(`Share link revoked: ${linkId}`);
    return { message: 'Share link revoked successfully' };
  }

  /**
   * Update a share link (expiration and/or password)
   */
  async updateLink(
    linkId: string,
    userId: string,
    updateData: { expiresIn?: number; password?: string | null },
  ): Promise<any> {
    const link = await this.prisma.sharedLink.findUnique({
      where: { id: linkId },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Share link not found');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this link',
      );
    }

    const updateFields: any = {};

    // Update expiration if provided
    if (updateData.expiresIn !== undefined) {
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + updateData.expiresIn);
      updateFields.expiresAt = newExpiresAt;
    }

    // Update password if provided
    if (updateData.password !== undefined) {
      if (updateData.password === null) {
        // Remove password
        updateFields.passwordHash = null;
      } else {
        // Set new password
        updateFields.passwordHash = await this.hashPassword(
          updateData.password,
        );
      }
    }

    // If the link was revoked, unrevoking it when updating
    if (link.revoked) {
      updateFields.revoked = false;
      this.logger.log(`Share link restored (unrevoked): ${linkId}`);
    }

    const updatedLink = await this.prisma.sharedLink.update({
      where: { id: linkId },
      data: updateFields,
      include: {
        item: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    this.logger.log(`Share link updated: ${linkId}`);

    return {
      id: updatedLink.id,
      token: updatedLink.token,
      url: `${this.baseUrl}/s/${updatedLink.token}`,
      expiresAt: updatedLink.expiresAt,
      hasPassword: !!updatedLink.passwordHash,
      item: updatedLink.item,
      createdAt: updatedLink.createdAt,
    };
  }

  /**
   * Permanently delete a share link
   */
  async permanentlyDeleteLink(
    linkId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const link = await this.prisma.sharedLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Share link not found');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this link',
      );
    }

    await this.prisma.sharedLink.delete({
      where: { id: linkId },
    });

    this.logger.log(`Share link permanently deleted: ${linkId}`);
    return { message: 'Share link permanently deleted' };
  }

  /**
   * Access a shared item via token
   */
  async accessSharedLink(
    token: string,
    accessData?: AccessSharedLinkDto,
  ): Promise<any> {
    const link = await this.prisma.sharedLink.findUnique({
      where: { token },
      include: {
        item: {
          include: {
            files: {
              include: {
                file: true,
              },
              orderBy: { position: 'asc' },
            },
            itemTags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!link) {
      throw new NotFoundException('Share link not found');
    }

    // Validate link is not expired
    if (new Date() > link.expiresAt) {
      throw new UnauthorizedException('This share link has expired');
    }

    // Validate link is not revoked
    if (link.revoked) {
      throw new UnauthorizedException('This share link has been revoked');
    }

    // Check password if required
    if (link.passwordHash) {
      if (!accessData?.password) {
        throw new UnauthorizedException(
          'Password required to access this link',
        );
      }

      const passwordValid = await this.comparePassword(
        accessData.password,
        link.passwordHash,
      );

      if (!passwordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    // Increment access count
    await this.prisma.sharedLink.update({
      where: { id: link.id },
      data: { accessCount: { increment: 1 } },
    });

    this.logger.log(
      `Share link accessed: ${token} (count: ${link.accessCount + 1})`,
    );

    // Transform item to public format - exclude sensitive fields
    const transformedItem = {
      // Only include safe fields - no id, userId, isPinned, isTrashed, trashedAt, createdAt, updatedAt
      title: link.item.title,
      description: link.item.description,
      type: link.item.type,
      url: link.item.url,
      content: link.item.content,
      category: link.item.category,
      project: link.item.project,
      importance: link.item.importance,
      domain: link.item.domain,
      // Transform files - exclude file IDs and other sensitive data
      files: link.item.files.map((itemFile: any) => ({
        originalName: itemFile.file.originalName,
        mimeType: itemFile.file.mimeType,
        size: Number(itemFile.file.size), // Convert BigInt to Number
        url: this.getFileUrl(itemFile.file.storageKey),
        isPrimary: itemFile.isPrimary,
      })),
      // Transform tags - only include name and color, no IDs
      tags: link.item.itemTags.map((it: any) => ({
        name: it.tag.name,
        color: it.tag.color,
      })),
    };

    return {
      item: transformedItem,
      link: {
        expiresAt: link.expiresAt,
        accessCount: link.accessCount + 1,
      },
    };
  }

  /**
   * Generate a unique random token
   */
  private async generateUniqueToken(): Promise<string> {
    let token: string;
    let exists = true;

    while (exists) {
      token = randomBytes(32).toString('hex');
      const existing = await this.prisma.sharedLink.findUnique({
        where: { token },
      });
      exists = !!existing;
    }

    return token!;
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Get public URL for file
   */
  private getFileUrl(storageKey: string): string {
    const publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL');
    return `${publicBaseUrl}/${storageKey}`;
  }
}
