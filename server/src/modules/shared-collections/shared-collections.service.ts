import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShareDto, UpdateShareDto } from './dto';
import { CollectionPermission } from '@prisma/client';

@Injectable()
export class SharedCollectionsService {
  private readonly logger = new Logger(SharedCollectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Share a collection with another user
   * Only the collection owner can share
   */
  async shareCollection(
    collectionId: string,
    createShareDto: CreateShareDto,
    ownerId: string,
  ) {
    // Verify collection exists and user is the owner
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found`,
      );
    }

    if (collection.userId !== ownerId) {
      throw new ForbiddenException(
        'Only the collection owner can share this collection',
      );
    }

    // Find user by email
    const userToShare = await this.prisma.user.findUnique({
      where: { email: createShareDto.userEmail },
    });

    if (!userToShare) {
      throw new NotFoundException(
        `User with email ${createShareDto.userEmail} not found`,
      );
    }

    // Cannot share with yourself
    if (userToShare.id === ownerId) {
      throw new BadRequestException('Cannot share collection with yourself');
    }

    // Check if already shared
    const existingShare = await this.prisma.collectionShare.findUnique({
      where: {
        collectionId_userId: {
          collectionId,
          userId: userToShare.id,
        },
      },
    });

    if (existingShare && !existingShare.revokedAt) {
      throw new ConflictException(
        'Collection is already shared with this user',
      );
    }

    // If previously revoked, update it
    if (existingShare && existingShare.revokedAt) {
      const updatedShare = await this.prisma.collectionShare.update({
        where: { id: existingShare.id },
        data: {
          permission: createShareDto.permission,
          revokedAt: null,
          invitedAt: new Date(),
          acceptedAt: new Date(), // Auto-accept for now
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
          sharedBy: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      this.logger.log(
        `Collection ${collectionId} re-shared with user ${userToShare.id}`,
      );
      return updatedShare;
    }

    // Create new share
    const share = await this.prisma.collectionShare.create({
      data: {
        collectionId,
        userId: userToShare.id,
        permission: createShareDto.permission,
        sharedById: ownerId,
        acceptedAt: new Date(), // Auto-accept for now
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        sharedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(
      `Collection ${collectionId} shared with user ${userToShare.id}`,
    );
    return share;
  }

  /**
   * Update share permission
   * Only the collection owner can update
   */
  async updateSharePermission(
    collectionId: string,
    shareId: string,
    updateShareDto: UpdateShareDto,
    ownerId: string,
  ) {
    // Verify collection ownership
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found`,
      );
    }

    if (collection.userId !== ownerId) {
      throw new ForbiddenException(
        'Only the collection owner can update shares',
      );
    }

    // Verify share exists and belongs to this collection
    const share = await this.prisma.collectionShare.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException(`Share with ID ${shareId} not found`);
    }

    if (share.collectionId !== collectionId) {
      throw new BadRequestException('Share does not belong to this collection');
    }

    if (share.revokedAt) {
      throw new BadRequestException('Cannot update a revoked share');
    }

    // Update permission
    const updatedShare = await this.prisma.collectionShare.update({
      where: { id: shareId },
      data: {
        permission: updateShareDto.permission,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        sharedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`Share ${shareId} permission updated`);
    return updatedShare;
  }

  /**
   * Revoke a share (soft delete)
   * Only the collection owner can revoke
   */
  async revokeShare(collectionId: string, shareId: string, ownerId: string) {
    // Verify collection ownership
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found`,
      );
    }

    if (collection.userId !== ownerId) {
      throw new ForbiddenException(
        'Only the collection owner can revoke shares',
      );
    }

    // Verify share exists
    const share = await this.prisma.collectionShare.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException(`Share with ID ${shareId} not found`);
    }

    if (share.collectionId !== collectionId) {
      throw new BadRequestException('Share does not belong to this collection');
    }

    // Soft delete by setting revokedAt
    await this.prisma.collectionShare.update({
      where: { id: shareId },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(`Share ${shareId} revoked`);
    return { message: 'Share revoked successfully' };
  }

  /**
   * Delete a share permanently
   * Only the collection owner can delete
   */
  async deleteShare(collectionId: string, shareId: string, ownerId: string) {
    // Verify collection ownership
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found`,
      );
    }

    if (collection.userId !== ownerId) {
      throw new ForbiddenException(
        'Only the collection owner can delete shares',
      );
    }

    // Verify share exists
    const share = await this.prisma.collectionShare.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException(`Share with ID ${shareId} not found`);
    }

    if (share.collectionId !== collectionId) {
      throw new BadRequestException('Share does not belong to this collection');
    }

    // Hard delete
    await this.prisma.collectionShare.delete({
      where: { id: shareId },
    });

    this.logger.log(`Share ${shareId} permanently deleted`);
    return { message: 'Share deleted successfully' };
  }

  /**
   * Get all shares for a collection (owner only)
   * List users who have access to this collection
   */
  async getCollectionShares(collectionId: string, ownerId: string) {
    // Verify collection ownership
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found`,
      );
    }

    if (collection.userId !== ownerId) {
      throw new ForbiddenException('Only the collection owner can view shares');
    }

    // Get all active shares (not revoked)
    const shares = await this.prisma.collectionShare.findMany({
      where: {
        collectionId,
        revokedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        sharedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });

    return shares;
  }

  /**
   * Get all collections shared TO the current user
   * List of collections this user can access (but doesn't own)
   */
  async getSharedCollections(userId: string) {
    const shares = await this.prisma.collectionShare.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      include: {
        collection: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        sharedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });

    return shares;
  }

  /**
   * Get collections owned by user that have active shares
   * Used in Share Management tab to show only collections being shared
   */
  async getMySharedCollections(userId: string) {
    // Get all collections owned by user that have at least one active share
    const collections = await this.prisma.collection.findMany({
      where: {
        userId,
        shares: {
          some: {
            revokedAt: null,
          },
        },
      },
      include: {
        _count: {
          select: {
            shares: {
              where: {
                revokedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return collections;
  }

  /**
   * Check if user can access a collection
   * Returns true if user is owner OR has active share
   */
  async canUserAccessCollection(
    userId: string,
    collectionId: string,
  ): Promise<boolean> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return false;
    }

    // Owner has access
    if (collection.userId === userId) {
      return true;
    }

    // Check if user has an active share
    const share = await this.prisma.collectionShare.findFirst({
      where: {
        collectionId,
        userId,
        revokedAt: null,
      },
    });

    return !!share;
  }

  /**
   * Check if user can edit a collection
   * Returns true if user is owner OR has EDIT permission
   */
  async canUserEditCollection(
    userId: string,
    collectionId: string,
  ): Promise<boolean> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return false;
    }

    // Owner can edit
    if (collection.userId === userId) {
      return true;
    }

    // Check if user has EDIT permission
    const share = await this.prisma.collectionShare.findFirst({
      where: {
        collectionId,
        userId,
        permission: CollectionPermission.EDIT,
        revokedAt: null,
      },
    });

    return !!share;
  }

  /**
   * Check if user is the collection owner
   */
  async isCollectionOwner(
    userId: string,
    collectionId: string,
  ): Promise<boolean> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    return collection?.userId === userId;
  }

  /**
   * Get user's permission for a collection
   * Returns 'owner', 'edit', 'view', or null
   */
  async getUserPermission(
    userId: string,
    collectionId: string,
  ): Promise<'owner' | 'edit' | 'view' | null> {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      return null;
    }

    // Check ownership
    if (collection.userId === userId) {
      return 'owner';
    }

    // Check share permission
    const share = await this.prisma.collectionShare.findFirst({
      where: {
        collectionId,
        userId,
        revokedAt: null,
      },
    });

    if (!share) {
      return null;
    }

    return share.permission === CollectionPermission.EDIT ? 'edit' : 'view';
  }
}
