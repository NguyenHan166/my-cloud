import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/modules/upload/upload.service';
import { CreateItemDto, UpdateItemDto, QueryItemsDto, NewTagDto } from './dto';
import { PaginatedResult } from './interfaces';
import { Item, Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Response type for item operations with message
   */
  private itemResponse(
    item: any,
    message: string,
  ): { item: any; message: string } {
    return { item: this.transformItemWithUrls(item), message };
  }

  /**
   * Transform a single item to include file URLs
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
   * Transform multiple items to include file URLs
   */
  private transformItemsWithUrls(items: any[]): any[] {
    return items.map((item) => this.transformItemWithUrls(item));
  }

  /**
   * Create a new item (FILE, LINK, or NOTE)
   * Uses transaction for atomicity
   * Supports multiple file uploads for FILE type
   */
  async createItem(
    data: CreateItemDto,
    userId: string,
    files?: Express.Multer.File[],
  ): Promise<{ item: Item; message: string }> {
    const { type, tagIds, newTags, ...itemData } = data;

    // Validate based on type
    if (type === 'FILE') {
      if (!files?.length) {
        throw new BadRequestException(
          'At least one file is required for FILE type items',
        );
      }
      const item = await this.createFileItem(
        itemData,
        files,
        userId,
        tagIds,
        newTags,
      );
      const fileCount = files.length;
      return this.itemResponse(
        item,
        `Item "${item.title}" created with ${fileCount} file(s)`,
      );
    }

    if (type === 'LINK') {
      if (!data.url) {
        throw new BadRequestException('URL is required for LINK type items');
      }
      const item = await this.createLinkItem(itemData, userId, tagIds, newTags);
      return this.itemResponse(item, `Link "${item.title}" saved successfully`);
    }

    if (type === 'NOTE') {
      if (!data.content) {
        throw new BadRequestException(
          'Content is required for NOTE type items',
        );
      }
      const item = await this.createNoteItem(itemData, userId, tagIds, newTags);
      return this.itemResponse(
        item,
        `Note "${item.title}" created successfully`,
      );
    }

    throw new BadRequestException('Invalid item type');
  }

  /**
   * Create FILE type item with multiple files
   * Optimized with parallel uploads and batch DB operations
   */
  private async createFileItem(
    data: Omit<CreateItemDto, 'type' | 'tagIds' | 'newTags'>,
    files: Express.Multer.File[],
    userId: string,
    tagIds?: string[],
    newTags?: NewTagDto[],
  ): Promise<Item> {
    let uploadResults: { key: string; file: Express.Multer.File }[] = [];

    try {
      // OPTIMIZATION: Upload all files in parallel
      this.logger.log(`Starting parallel upload of ${files.length} files...`);
      const uploadPromises = files.map((file) =>
        this.uploadService
          .uploadFile(file, 'items')
          .then((result) => ({ key: result.key, file })),
      );

      uploadResults = await Promise.all(uploadPromises);
      this.logger.log(
        `Successfully uploaded ${uploadResults.length} files to R2`,
      );

      // Use transaction for database operations
      return await this.prisma.$transaction(async (tx) => {
        // 1. Create new tags if any
        const allTagIds = await this.processTagsInTransaction(
          tx,
          userId,
          tagIds,
          newTags,
        );

        // 2. Build tags text for search
        const tagsText = await this.buildTagsTextInTransaction(tx, allTagIds);

        // 3. Create Item first
        const item = await tx.item.create({
          data: {
            userId,
            type: 'FILE',
            title: data.title,
            description: data.description,
            category: data.category,
            project: data.project,
            importance: data.importance || 'MEDIUM',
            tagsText,
            itemTags: allTagIds.length
              ? {
                  create: allTagIds.map((tagId) => ({ tagId })),
                }
              : undefined,
          },
        });

        // OPTIMIZATION: Batch create File records
        const fileRecords = await Promise.all(
          uploadResults.map(({ key, file }) =>
            tx.file.create({
              data: {
                userId,
                storageKey: key,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
              },
            }),
          ),
        );

        // OPTIMIZATION: Batch create ItemFile junction records
        await tx.itemFile.createMany({
          data: fileRecords.map((fileRecord, i) => ({
            itemId: item.id,
            fileId: fileRecord.id,
            position: i,
            isPrimary: i === 0, // First file is primary
          })),
        });

        // Return item with includes
        return tx.item.findUnique({
          where: { id: item.id },
          include: this.getItemInclude(),
        }) as Promise<Item>;
      });
    } catch (error) {
      // Rollback: delete uploaded files from R2 if transaction fails
      this.logger.error(
        `Error creating file item, cleaning up ${uploadResults.length} uploaded files`,
      );
      await Promise.all(
        uploadResults.map(({ key }) =>
          this.uploadService.deleteFile(key).catch((err) => {
            this.logger.error(`Failed to delete ${key}: ${err.message}`);
          }),
        ),
      );
      throw error;
    }
  }

  /**
   * Create LINK type item with transaction
   */
  private async createLinkItem(
    data: Omit<CreateItemDto, 'type' | 'tagIds' | 'newTags'>,
    userId: string,
    tagIds?: string[],
    newTags?: NewTagDto[],
  ): Promise<Item> {
    const domain = this.extractDomain(data.url!);

    return this.prisma.$transaction(async (tx) => {
      const allTagIds = await this.processTagsInTransaction(
        tx,
        userId,
        tagIds,
        newTags,
      );
      const tagsText = await this.buildTagsTextInTransaction(tx, allTagIds);

      return tx.item.create({
        data: {
          userId,
          type: 'LINK',
          url: data.url,
          domain,
          title: data.title,
          description: data.description,
          category: data.category,
          project: data.project,
          importance: data.importance || 'MEDIUM',
          tagsText,
          itemTags: allTagIds.length
            ? { create: allTagIds.map((tagId) => ({ tagId })) }
            : undefined,
        },
        include: this.getItemInclude(),
      });
    });
  }

  /**
   * Create NOTE type item with transaction
   */
  private async createNoteItem(
    data: Omit<CreateItemDto, 'type' | 'tagIds' | 'newTags'>,
    userId: string,
    tagIds?: string[],
    newTags?: NewTagDto[],
  ): Promise<Item> {
    return this.prisma.$transaction(async (tx) => {
      const allTagIds = await this.processTagsInTransaction(
        tx,
        userId,
        tagIds,
        newTags,
      );
      const tagsText = await this.buildTagsTextInTransaction(tx, allTagIds);

      return tx.item.create({
        data: {
          userId,
          type: 'NOTE',
          content: data.content,
          title: data.title,
          description: data.description,
          category: data.category,
          project: data.project,
          importance: data.importance || 'MEDIUM',
          tagsText,
          itemTags: allTagIds.length
            ? { create: allTagIds.map((tagId) => ({ tagId })) }
            : undefined,
        },
        include: this.getItemInclude(),
      });
    });
  }

  /**
   * Process existing tagIds + create new tags in transaction
   */
  private async processTagsInTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    tagIds?: string[],
    newTags?: NewTagDto[],
  ): Promise<string[]> {
    const allTagIds: string[] = [...(tagIds || [])];

    if (newTags?.length) {
      for (const newTag of newTags) {
        const existingTag = await tx.tag.findUnique({
          where: { userId_name: { userId, name: newTag.name } },
        });

        if (existingTag) {
          if (!allTagIds.includes(existingTag.id)) {
            allTagIds.push(existingTag.id);
          }
        } else {
          const createdTag = await tx.tag.create({
            data: {
              userId,
              name: newTag.name,
              color: newTag.color || '#6366f1',
            },
          });
          allTagIds.push(createdTag.id);
        }
      }
    }

    return allTagIds;
  }

  /**
   * Build tags text within transaction
   */
  private async buildTagsTextInTransaction(
    tx: Prisma.TransactionClient,
    tagIds: string[],
  ): Promise<string | null> {
    if (!tagIds.length) return null;

    const tags = await tx.tag.findMany({
      where: { id: { in: tagIds } },
      select: { name: true },
    });

    return tags.map((t) => t.name).join(', ');
  }

  /**
   * Find all items with filters and pagination
   */
  async findAll(
    query: QueryItemsDto,
    userId: string,
  ): Promise<PaginatedResult<Item>> {
    const {
      type,
      category,
      project,
      domain,
      importance,
      isPinned,
      tagIds,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.ItemWhereInput = {
      userId,
      isTrashed: false, // Exclude trashed items from normal listing
      ...(type && { type }),
      ...(category && { category }),
      ...(project && { project }),
      ...(domain && { domain }),
      ...(importance && { importance }),
      ...(isPinned !== undefined && { isPinned }),
      ...(tagIds?.length && {
        itemTags: { some: { tagId: { in: tagIds } } },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tagsText: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Sort: pinned items first, then by user-selected field
    const orderBy: Prisma.ItemOrderByWithRelationInput[] = [
      { isPinned: 'desc' },
      { [sortBy]: sortOrder },
    ];

    const total = await this.prisma.item.count({ where });

    const data = await this.prisma.item.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: this.getItemInclude(),
    });

    return {
      data: this.transformItemsWithUrls(data),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find item by ID
   */
  async findById(id: string): Promise<Item> {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: this.getItemInclude(),
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.transformItemWithUrls(item);
  }

  /**
   * Update item with transaction
   * Supports adding new files and removing specific files
   */
  async updateItem(
    id: string,
    data: UpdateItemDto,
    userId: string,
    newFiles?: Express.Multer.File[],
  ): Promise<{ item: Item; message: string }> {
    const existingItem = await this.findById(id);

    if (existingItem.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this item');
    }

    const { tagIds, newTags, removeFileIds, files, ...updateData } = data;

    // Handle file removal for FILE type (outside transaction for R2 operations)
    if (removeFileIds?.length && existingItem.type === 'FILE') {
      await this.removeFilesFromItem(id, removeFileIds, userId);
    }

    // Handle adding new files for FILE type
    if (newFiles?.length && existingItem.type === 'FILE') {
      await this.addFilesToItem(id, newFiles, userId);
    }

    // Handle URL domain extraction for LINK type
    if (data.url && existingItem.type === 'LINK') {
      (updateData as any).domain = this.extractDomain(data.url);
    }

    // Use transaction for tag operations and item update
    const item = await this.prisma.$transaction(async (tx) => {
      if (tagIds !== undefined || newTags?.length) {
        const allTagIds = await this.processTagsInTransaction(
          tx,
          userId,
          tagIds,
          newTags,
        );

        await tx.itemTag.deleteMany({ where: { itemId: id } });

        if (allTagIds.length > 0) {
          await tx.itemTag.createMany({
            data: allTagIds.map((tagId) => ({ itemId: id, tagId })),
          });
        }

        (updateData as any).tagsText = await this.buildTagsTextInTransaction(
          tx,
          allTagIds,
        );
      }

      return tx.item.update({
        where: { id },
        data: updateData,
        include: this.getItemInclude(),
      });
    });

    return this.itemResponse(item, `"${item.title}" updated successfully`);
  }

  /**
   * Remove specific files from an item (with R2 cleanup)
   */
  private async removeFilesFromItem(
    itemId: string,
    fileIds: string[],
    userId: string,
  ): Promise<void> {
    for (const fileId of fileIds) {
      // Get ItemFile junction and File record
      const itemFile = await this.prisma.itemFile.findFirst({
        where: { itemId, fileId },
        include: { file: true },
      });

      if (!itemFile) continue;

      // Verify file ownership
      if (itemFile.file.userId !== userId) {
        throw new ForbiddenException('You are not allowed to remove this file');
      }

      // Delete from R2
      await this.uploadService.deleteFile(itemFile.file.storageKey);
      this.logger.log(`Deleted file from R2: ${itemFile.file.storageKey}`);

      // Delete ItemFile junction and File record
      await this.prisma.$transaction(async (tx) => {
        await tx.itemFile.delete({ where: { id: itemFile.id } });
        await tx.file.delete({ where: { id: fileId } });
      });
    }

    // Update primary file if needed
    await this.ensurePrimaryFile(itemId);
  }

  /**
   * Add new files to an existing item
   * Optimized with parallel uploads and batch DB operations
   */
  private async addFilesToItem(
    itemId: string,
    files: Express.Multer.File[],
    userId: string,
  ): Promise<void> {
    // Get current max position
    const maxPositionResult = await this.prisma.itemFile.aggregate({
      where: { itemId },
      _max: { position: true },
    });
    const startPosition = (maxPositionResult._max.position ?? -1) + 1;

    // Check if item has any files (for isPrimary)
    const existingFilesCount = await this.prisma.itemFile.count({
      where: { itemId },
    });

    let uploadResults: { key: string; file: Express.Multer.File }[] = [];

    try {
      // OPTIMIZATION: Upload all files in parallel
      this.logger.log(
        `Adding ${files.length} files to item ${itemId} (parallel upload)...`,
      );
      const uploadPromises = files.map((file) =>
        this.uploadService
          .uploadFile(file, 'items')
          .then((result) => ({ key: result.key, file })),
      );

      uploadResults = await Promise.all(uploadPromises);
      this.logger.log(
        `Successfully uploaded ${uploadResults.length} files to R2`,
      );

      // OPTIMIZATION: Batch create in transaction
      await this.prisma.$transaction(async (tx) => {
        // Batch create File records
        const fileRecords = await Promise.all(
          uploadResults.map(({ key, file }) =>
            tx.file.create({
              data: {
                userId,
                storageKey: key,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
              },
            }),
          ),
        );

        // Batch create ItemFile junction records
        await tx.itemFile.createMany({
          data: fileRecords.map((fileRecord, i) => ({
            itemId,
            fileId: fileRecord.id,
            position: startPosition + i,
            isPrimary: existingFilesCount === 0 && i === 0,
          })),
        });
      });
    } catch (error) {
      // Rollback: delete all uploaded files from R2 on failure
      this.logger.error(
        `Error adding files to item, cleaning up ${uploadResults.length} uploaded files`,
      );
      await Promise.all(
        uploadResults.map(({ key }) =>
          this.uploadService.deleteFile(key).catch((err) => {
            this.logger.error(`Failed to delete ${key}: ${err.message}`);
          }),
        ),
      );
      throw error;
    }
  }

  /**
   * Ensure item has a primary file (set first file as primary if none)
   */
  private async ensurePrimaryFile(itemId: string): Promise<void> {
    const hasPrimary = await this.prisma.itemFile.findFirst({
      where: { itemId, isPrimary: true },
    });

    if (!hasPrimary) {
      const firstFile = await this.prisma.itemFile.findFirst({
        where: { itemId },
        orderBy: { position: 'asc' },
      });

      if (firstFile) {
        await this.prisma.itemFile.update({
          where: { id: firstFile.id },
          data: { isPrimary: true },
        });
      }
    }
  }

  /**
   * Delete item (and all files from R2 if FILE type)
   */
  async deleteItem(id: string, userId: string): Promise<{ message: string }> {
    const item = await this.findById(id);

    if (item.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this item');
    }

    // If FILE type, delete all files from R2 first
    if (item.type === 'FILE') {
      const itemFiles = await this.prisma.itemFile.findMany({
        where: { itemId: id },
        include: { file: true },
      });

      for (const itemFile of itemFiles) {
        await this.uploadService.deleteFile(itemFile.file.storageKey);
        this.logger.log(`Deleted file from R2: ${itemFile.file.storageKey}`);
      }
    }

    // Delete Item in transaction (cascades to itemFiles, itemTags)
    await this.prisma.$transaction(async (tx) => {
      // Delete file records if FILE type
      if (item.type === 'FILE') {
        const itemFiles = await tx.itemFile.findMany({
          where: { itemId: id },
          select: { fileId: true },
        });

        for (const { fileId } of itemFiles) {
          await tx.file.delete({ where: { id: fileId } });
        }
      }

      await tx.item.delete({ where: { id } });
    });

    return { message: 'Item deleted successfully' };
  }

  /**
   * Toggle pin status
   */
  async togglePin(
    id: string,
    userId: string,
  ): Promise<{ item: Item; message: string }> {
    const item = await this.findById(id);

    if (item.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this item');
    }

    const updatedItem = await this.prisma.item.update({
      where: { id },
      data: { isPinned: !item.isPinned },
      include: this.getItemInclude(),
    });

    const message = updatedItem.isPinned
      ? `"${updatedItem.title}" pinned successfully`
      : `"${updatedItem.title}" unpinned successfully`;

    return { item: updatedItem, message };
  }

  /**
   * Set primary file for an item
   */
  async setPrimaryFile(
    itemId: string,
    fileId: string,
    userId: string,
  ): Promise<Item> {
    const item = await this.findById(itemId);

    if (item.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this item');
    }

    // Verify file belongs to this item
    const itemFile = await this.prisma.itemFile.findFirst({
      where: { itemId, fileId },
    });

    if (!itemFile) {
      throw new NotFoundException('File not found in this item');
    }

    await this.prisma.$transaction(async (tx) => {
      // Remove primary from all files
      await tx.itemFile.updateMany({
        where: { itemId },
        data: { isPrimary: false },
      });

      // Set new primary
      await tx.itemFile.update({
        where: { id: itemFile.id },
        data: { isPrimary: true },
      });
    });

    return this.findById(itemId);
  }

  /**
   * Reorder files in an item
   */
  async reorderFiles(
    itemId: string,
    fileIds: string[],
    userId: string,
  ): Promise<Item> {
    const item = await this.findById(itemId);

    if (item.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this item');
    }

    for (let i = 0; i < fileIds.length; i++) {
      await this.prisma.itemFile.updateMany({
        where: { itemId, fileId: fileIds[i] },
        data: { position: i },
      });
    }

    return this.findById(itemId);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string | null {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  /**
   * Default include for item queries
   */
  private getItemInclude() {
    return {
      files: {
        include: {
          file: true,
        },
        orderBy: { position: 'asc' as const },
      },
      itemTags: {
        include: {
          tag: true,
        },
      },
    };
  }

  // ==================== TRASH FUNCTIONALITY ====================

  /**
   * Move item to trash (soft delete)
   */
  async moveToTrash(
    id: string,
    userId: string,
  ): Promise<{ item: Item; message: string }> {
    const item = await this.findById(id);

    if (item.userId !== userId) {
      throw new ForbiddenException('You are not allowed to trash this item');
    }

    if (item.isTrashed) {
      throw new BadRequestException('Item is already in trash');
    }

    const trashedItem = await this.prisma.item.update({
      where: { id },
      data: {
        isTrashed: true,
        trashedAt: new Date(),
      },
      include: this.getItemInclude(),
    });

    return this.itemResponse(
      trashedItem,
      `"${trashedItem.title}" moved to trash`,
    );
  }

  /**
   * Restore item from trash
   */
  async restoreFromTrash(
    id: string,
    userId: string,
  ): Promise<{ item: Item; message: string }> {
    const item = await this.findById(id);

    if (item.userId !== userId) {
      throw new ForbiddenException('You are not allowed to restore this item');
    }

    if (!item.isTrashed) {
      throw new BadRequestException('Item is not in trash');
    }

    const restoredItem = await this.prisma.item.update({
      where: { id },
      data: {
        isTrashed: false,
        trashedAt: null,
      },
      include: this.getItemInclude(),
    });

    return this.itemResponse(
      restoredItem,
      `"${restoredItem.title}" restored from trash`,
    );
  }

  /**
   * Find all items in trash with pagination
   */
  async findTrashed(
    query: QueryItemsDto,
    userId: string,
  ): Promise<PaginatedResult<Item>> {
    const {
      type,
      search,
      sortBy = 'trashedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.ItemWhereInput = {
      userId,
      isTrashed: true,
      ...(type && { type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.ItemOrderByWithRelationInput = {
      [sortBy === 'trashedAt' ? 'trashedAt' : sortBy]: sortOrder,
    };

    const total = await this.prisma.item.count({ where });

    const data = await this.prisma.item.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: this.getItemInclude(),
    });

    return {
      data: this.transformItemsWithUrls(data),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Permanently delete a single item from trash
   */
  async permanentlyDeleteItem(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const item = await this.findById(id);

    if (item.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this item');
    }

    if (!item.isTrashed) {
      throw new BadRequestException(
        'Item must be in trash before permanent deletion. Use trash endpoint first.',
      );
    }

    // Reuse existing deleteItem logic
    return this.deleteItem(id, userId);
  }

  /**
   * Empty trash - permanently delete all trashed items for user
   */
  async emptyTrash(
    userId: string,
  ): Promise<{ message: string; count: number }> {
    // Get all trashed items for user
    const trashedItems = await this.prisma.item.findMany({
      where: { userId, isTrashed: true },
      include: {
        files: {
          include: { file: true },
        },
      },
    });

    if (trashedItems.length === 0) {
      return { message: 'Trash is already empty', count: 0 };
    }

    // Delete files from R2 for FILE type items
    for (const item of trashedItems) {
      if (item.type === 'FILE') {
        for (const itemFile of item.files) {
          try {
            await this.uploadService.deleteFile(itemFile.file.storageKey);
            this.logger.log(
              `Deleted file from R2: ${itemFile.file.storageKey}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to delete file from R2: ${itemFile.file.storageKey}`,
              error,
            );
          }
        }
      }
    }

    // Delete all trashed items and their files from database
    await this.prisma.$transaction(async (tx) => {
      // Get all file IDs for trashed items
      const fileIds = trashedItems.flatMap((item) =>
        item.files.map((f) => f.file.id),
      );

      // Delete File records
      if (fileIds.length > 0) {
        await tx.file.deleteMany({
          where: { id: { in: fileIds } },
        });
      }

      // Delete all trashed items (cascades to itemFiles, itemTags)
      await tx.item.deleteMany({
        where: { userId, isTrashed: true },
      });
    });

    return {
      message: `Permanently deleted ${trashedItems.length} item(s) from trash`,
      count: trashedItems.length,
    };
  }

  /**
   * Cleanup expired trash items (older than 30 days)
   * This method is called by the scheduled task
   */
  async cleanupExpiredTrash(): Promise<{ deletedCount: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all expired trashed items across all users
    const expiredItems = await this.prisma.item.findMany({
      where: {
        isTrashed: true,
        trashedAt: { lte: thirtyDaysAgo },
      },
      include: {
        files: {
          include: { file: true },
        },
      },
    });

    if (expiredItems.length === 0) {
      this.logger.log('No expired trash items to cleanup');
      return { deletedCount: 0 };
    }

    this.logger.log(
      `Cleaning up ${expiredItems.length} expired trash items...`,
    );

    // Delete files from R2
    for (const item of expiredItems) {
      if (item.type === 'FILE') {
        for (const itemFile of item.files) {
          try {
            await this.uploadService.deleteFile(itemFile.file.storageKey);
            this.logger.log(
              `Deleted expired file from R2: ${itemFile.file.storageKey}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to delete expired file from R2: ${itemFile.file.storageKey}`,
              error,
            );
          }
        }
      }
    }

    // Delete from database
    await this.prisma.$transaction(async (tx) => {
      const fileIds = expiredItems.flatMap((item) =>
        item.files.map((f) => f.file.id),
      );

      if (fileIds.length > 0) {
        await tx.file.deleteMany({
          where: { id: { in: fileIds } },
        });
      }

      await tx.item.deleteMany({
        where: {
          isTrashed: true,
          trashedAt: { lte: thirtyDaysAgo },
        },
      });
    });

    this.logger.log(
      `Successfully cleaned up ${expiredItems.length} expired trash items`,
    );
    return { deletedCount: expiredItems.length };
  }
}
