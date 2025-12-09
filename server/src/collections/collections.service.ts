import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  QueryCollectionsDto,
  AddItemsDto,
} from './dto';
import { PaginatedResult } from './interfaces';
import { Collection, Prisma } from '@prisma/client';

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new collection
   */
  async create(data: CreateCollectionDto, userId: string): Promise<Collection> {
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.CollectionWhereInput = {
      userId,
    };

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
          select: { items: true },
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
          select: { items: true },
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
   * Update collection
   */
  async update(
    id: string,
    data: UpdateCollectionDto,
    userId: string,
  ): Promise<Collection> {
    // Verify ownership
    await this.findById(id, userId);

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
    });

    this.logger.log(`Collection updated: ${id} by user ${userId}`);
    return collection;
  }

  /**
   * Delete collection
   */
  async delete(id: string, userId: string): Promise<{ message: string }> {
    // Verify ownership
    await this.findById(id, userId);

    await this.prisma.collection.delete({
      where: { id },
    });

    this.logger.log(`Collection deleted: ${id} by user ${userId}`);
    return { message: 'Collection deleted successfully' };
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

    // Extract items from collection items
    const items = collectionItems.map((ci) => ci.item);

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
