import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/modules/upload/upload.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  QueryCollectionsDto,
} from './dto';
import { PaginatedResult } from './interfaces';
import { Collection, Prisma } from '@prisma/client';

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Transform item to include file URLs
   */
  private transformItemWithUrls(item: any): any {
    if (!item || !item.files) return item;

    return {
      ...item,
      files: item.files.map((itemFile: any) => ({
        ...itemFile,
        file: itemFile.file
          ? {
              ...itemFile.file,
              url: this.uploadService.getPublicUrl(itemFile.file.storageKey),
            }
          : itemFile.file,
      })),
    };
  }

  /**
   * Create a new collection
   */
  async create(data: CreateCollectionDto, userId: string): Promise<Collection> {
    // Validate parent collection if provided
    if (data.parentId) {
      const parent = await this.prisma.collection.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent collection not found`);
      }
      if (parent.userId !== userId) {
        throw new ForbiddenException(
          'Parent collection does not belong to you',
        );
      }
    }

    // If isPublic is true and slugPublic is not provided, generate one
    let slugPublic = data.slugPublic;
    if (data.isPublic && !slugPublic) {
      slugPublic = await this.generatePublicSlug(data.name, userId);
    }

    // Validate slug uniqueness if provided
    if (slugPublic) {
      const existing = await this.prisma.collection.findFirst({
        where: {
          userId,
          slugPublic,
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Collection with slug '${slugPublic}' already exists`,
        );
      }
    }

    const collection = await this.prisma.collection.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        coverImage: data.coverImage,
        isPublic: data.isPublic ?? false,
        slugPublic,
        parentId: data.parentId || null,
      },
    });

    this.logger.log(`Collection created: ${collection.id} by user ${userId}`);
    return collection;
  }

  /**
   * Find all collections with filters and pagination
   */
  async findAll(
    query: QueryCollectionsDto,
    userId: string,
  ): Promise<PaginatedResult<Collection>> {
    const {
      search,
      isPublic,
      parentId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.CollectionWhereInput = {
      userId,
    };

    // Parent filter
    if (parentId !== undefined) {
      if (parentId === 'root') {
        where.parentId = null; // Only root collections
      } else {
        where.parentId = parentId; // Children of specific collection
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Public filter
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    // Count total
    const total = await this.prisma.collection.count({ where });

    // Fetch collections with pagination
    const collections = await this.prisma.collection.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { items: true, children: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      data: collections,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find collection by ID
   */
  async findById(id: string, userId: string): Promise<Collection> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true, children: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this collection',
      );
    }

    return collection;
  }

  /**
   * Get child collections
   */
  async getChildren(
    collectionId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<Collection>> {
    // Verify parent collection ownership
    await this.findById(collectionId, userId);

    const where: Prisma.CollectionWhereInput = {
      userId,
      parentId: collectionId,
    };

    const total = await this.prisma.collection.count({ where });

    const children = await this.prisma.collection.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { items: true, children: true },
        },
      },
    });

    return {
      data: children,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get breadcrumb path from root to collection
   */
  async getBreadcrumb(
    collectionId: string,
    userId: string,
  ): Promise<Array<{ id: string; name: string }>> {
    const collection = await this.findById(collectionId, userId);

    const breadcrumb: Array<{ id: string; name: string }> = [];
    let current: any = collection;

    // Walk up the tree
    while (current) {
      breadcrumb.unshift({ id: current.id, name: current.name });

      if (current.parentId) {
        current = await this.prisma.collection.findUnique({
          where: { id: current.parentId },
          select: { id: true, name: true, parentId: true },
        });
      } else {
        current = null;
      }
    }

    return breadcrumb;
  }

  /**
   * Move collection to new parent
   */
  async moveCollection(
    id: string,
    newParentId: string | null,
    userId: string,
  ): Promise<Collection> {
    // Verify ownership
    const collection = await this.findById(id, userId);

    // If moving to a parent, validate it
    if (newParentId) {
      const newParent = await this.prisma.collection.findUnique({
        where: { id: newParentId },
      });

      if (!newParent) {
        throw new NotFoundException('Target parent collection not found');
      }

      if (newParent.userId !== userId) {
        throw new ForbiddenException('Target parent does not belong to you');
      }

      // Prevent circular reference
      if (await this.isDescendant(newParentId, id)) {
        throw new BadRequestException(
          'Cannot move collection into its own descendant',
        );
      }

      // Prevent moving to itself
      if (newParentId === id) {
        throw new BadRequestException('Cannot move collection into itself');
      }
    }

    const updated = await this.prisma.collection.update({
      where: { id },
      data: { parentId: newParentId },
      include: {
        _count: {
          select: { items: true, children: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
    });

    this.logger.log(
      `Collection ${id} moved to parent ${newParentId || 'root'} by user ${userId}`,
    );
    return updated;
  }

  /**
   * Check if targetId is a descendant of ancestorId
   */
  private async isDescendant(
    targetId: string,
    ancestorId: string,
  ): Promise<boolean> {
    let current = await this.prisma.collection.findUnique({
      where: { id: targetId },
      select: { parentId: true },
    });

    while (current?.parentId) {
      if (current.parentId === ancestorId) {
        return true;
      }
      current = await this.prisma.collection.findUnique({
        where: { id: current.parentId },
        select: { parentId: true },
      });
    }

    return false;
  }

  /**
   * Update collection
   */
  async update(
    id: string,
    data: UpdateCollectionDto,
    userId: string,
  ): Promise<Collection> {
    // Verify ownership
    await this.findById(id, userId);

    // Handle parentId change (move operation)
    if (data.parentId !== undefined) {
      return this.moveCollection(id, data.parentId, userId);
    }

    // Validate slug uniqueness if being changed
    if (data.slugPublic) {
      const existing = await this.prisma.collection.findFirst({
        where: {
          userId,
          slugPublic: data.slugPublic,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Collection with slug '${data.slugPublic}' already exists`,
        );
      }
    }

    const collection = await this.prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        coverImage: data.coverImage,
        isPublic: data.isPublic,
        slugPublic: data.slugPublic,
      },
      include: {
        _count: {
          select: { items: true, children: true },
        },
        parent: {
          select: { id: true, name: true },
        },
      },
    });

    this.logger.log(`Collection updated: ${id} by user ${userId}`);
    return collection;
  }

  /**
   * Delete collection (cascade deletes children)
   */
  async delete(id: string, userId: string): Promise<{ message: string }> {
    // Verify ownership
    await this.findById(id, userId);

    await this.prisma.collection.delete({
      where: { id },
    });

    this.logger.log(`Collection deleted: ${id} by user ${userId}`);
    return {
      message: 'Collection and all sub-collections deleted successfully',
    };
  }

  /**
   * Add items to collection
   */
  async addItems(
    collectionId: string,
    itemIds: string[],
    userId: string,
  ): Promise<{ message: string; addedCount: number }> {
    // Verify collection ownership
    await this.findById(collectionId, userId);

    // Verify all items belong to user
    const items = await this.prisma.item.findMany({
      where: {
        id: { in: itemIds },
        userId,
      },
    });

    if (items.length !== itemIds.length) {
      throw new BadRequestException(
        'Some items do not exist or do not belong to you',
      );
    }

    // Add items to collection (skip if already exists)
    let addedCount = 0;
    for (const itemId of itemIds) {
      try {
        await this.prisma.collectionItem.create({
          data: {
            userId,
            collectionId,
            itemId,
          },
        });
        addedCount++;
      } catch (error) {
        // Skip if already exists (unique constraint)
        if (error.code === 'P2002') {
          this.logger.debug(
            `Item ${itemId} already in collection ${collectionId}`,
          );
        } else {
          throw error;
        }
      }
    }

    this.logger.log(`Added ${addedCount} items to collection ${collectionId}`);
    return {
      message: `Successfully added ${addedCount} item(s) to collection`,
      addedCount,
    };
  }

  /**
   * Remove items from collection
   */
  async removeItems(
    collectionId: string,
    itemIds: string[],
    userId: string,
  ): Promise<{ message: string; removedCount: number }> {
    // Verify collection ownership
    await this.findById(collectionId, userId);

    const result = await this.prisma.collectionItem.deleteMany({
      where: {
        collectionId,
        itemId: { in: itemIds },
        userId,
      },
    });

    this.logger.log(
      `Removed ${result.count} items from collection ${collectionId}`,
    );
    return {
      message: `Successfully removed ${result.count} item(s) from collection`,
      removedCount: result.count,
    };
  }

  /**
   * Get items in collection with pagination
   */
  async getCollectionItems(
    collectionId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResult<any>> {
    // Verify collection ownership
    await this.findById(collectionId, userId);

    // Count total items
    const total = await this.prisma.collectionItem.count({
      where: { collectionId },
    });

    // Fetch items with pagination
    const collectionItems = await this.prisma.collectionItem.findMany({
      where: { collectionId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    // Extract items from collection items and transform with URLs
    const items = collectionItems.map((ci) =>
      this.transformItemWithUrls(ci.item),
    );

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generate unique public slug from collection name
   */
  private async generatePublicSlug(
    name: string,
    userId: string,
  ): Promise<string> {
    // Basic slugify: lowercase, replace spaces with hyphens, remove special chars
    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Ensure uniqueness
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.collection.findFirst({
        where: {
          userId,
          slugPublic: uniqueSlug,
        },
      });

      if (!existing) {
        break;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }
}
