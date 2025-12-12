import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto';
import { Tag } from '@prisma/client';

// Response wrapper type
export interface ServiceResponse<T> {
    data: T;
    message: string;
}

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) { }

    async createTag(data: CreateTagDto, userId: string): Promise<ServiceResponse<Tag>> {
        try {
            const { name, color = '#043fffff' } = data;
            const tag = await this.prisma.tag.create({
                data: { name, color, userId }
            });
            return { data: tag, message: `Tag "${name}" created successfully` };
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Tag with this name already exists');
            }
            throw error;
        }
    }

    async getAllTags(userId: string) {
        const tags = await this.prisma.tag.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { itemTags: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return tags.map(({ _count, ...tag }) => ({
            ...tag,
            itemCount: _count.itemTags
        }));
    }

    async getTagById(id: string) {
        const existingTag = await this.prisma.tag.findUnique({ where: { id } });
        if (!existingTag) {
            throw new NotFoundException('Tag not found');
        }
        return existingTag;
    }

    async updateTag(id: string, data: UpdateTagDto, userId: string): Promise<ServiceResponse<Tag>> {
        const existingTag = await this.getTagById(id);
        if (existingTag.userId !== userId) {
            throw new ForbiddenException('You are not allowed to update this tag');
        }
        const tag = await this.prisma.tag.update({ where: { id }, data });
        return { data: tag, message: `Tag "${tag.name}" updated successfully` };
    }

    async deleteTag(id: string, userId: string): Promise<{ message: string }> {
        const existingTag = await this.getTagById(id);
        if (existingTag.userId !== userId) {
            throw new ForbiddenException('You are not allowed to delete this tag');
        }
        await this.prisma.tag.delete({ where: { id } });
        return { message: `Tag "${existingTag.name}" deleted successfully` };
    }
}
