import {
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { RedisCacheService } from 'src/modules/redis';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto';
import { Tag } from '@prisma/client';

// Response wrapper type
export interface ServiceResponse<T> {
    data: T;
    message: string;
}

// Cache key helpers
const CACHE_KEYS = {
    userTags: (userId: string) => `tags:user:${userId}`,
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

@Injectable()
export class TagsService {
    private readonly logger = new Logger(TagsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: RedisCacheService,
    ) { }

    /**
     * Invalidate user's tags cache
     */
    private async invalidateUserTagsCache(userId: string): Promise<void> {
        const key = CACHE_KEYS.userTags(userId);
        await this.cache.del(key);
        this.logger.debug(`Cache invalidated: ${key}`);
    }

    async createTag(
        data: CreateTagDto,
        userId: string,
    ): Promise<ServiceResponse<Tag>> {
        try {
            const { name, color = '#043fffff' } = data;
            const tag = await this.prisma.tag.create({
                data: { name, color, userId },
            });

            // Invalidate cache
            await this.invalidateUserTagsCache(userId);

            return { data: tag, message: `Tag "${name}" created successfully` };
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Tag with this name already exists');
            }
            throw error;
        }
    }

    async getAllTags(userId: string) {
        const cacheKey = CACHE_KEYS.userTags(userId);

        // 1. Check cache first
        const cached = await this.cache.get(cacheKey);
        if (cached) {
            this.logger.debug(`Cache HIT: ${cacheKey}`);
            return cached;
        }

        this.logger.debug(`Cache MISS: ${cacheKey}`);

        // 2. Query database
        const tags = await this.prisma.tag.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { itemTags: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const result = tags.map(({ _count, ...tag }) => ({
            ...tag,
            itemCount: _count.itemTags,
        }));

        // 3. Save to cache
        await this.cache.set(cacheKey, result, CACHE_TTL);

        return result;
    }

    async getTagById(id: string) {
        const existingTag = await this.prisma.tag.findUnique({ where: { id } });
        if (!existingTag) {
            throw new NotFoundException('Tag not found');
        }
        return existingTag;
    }

    async updateTag(
        id: string,
        data: UpdateTagDto,
        userId: string,
    ): Promise<ServiceResponse<Tag>> {
        const existingTag = await this.getTagById(id);
        if (existingTag.userId !== userId) {
            throw new ForbiddenException('You are not allowed to update this tag');
        }
        const tag = await this.prisma.tag.update({ where: { id }, data });

        // Invalidate cache
        await this.invalidateUserTagsCache(userId);

        return { data: tag, message: `Tag "${tag.name}" updated successfully` };
    }

    async deleteTag(id: string, userId: string): Promise<{ message: string }> {
        const existingTag = await this.getTagById(id);
        if (existingTag.userId !== userId) {
            throw new ForbiddenException('You are not allowed to delete this tag');
        }
        await this.prisma.tag.delete({ where: { id } });

        // Invalidate cache
        await this.invalidateUserTagsCache(userId);

        return { message: `Tag "${existingTag.name}" deleted successfully` };
    }
}

