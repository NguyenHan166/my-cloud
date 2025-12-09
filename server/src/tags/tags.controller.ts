import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetUser } from 'src/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    async createTag(@Body() data: CreateTagDto, @GetUser() currentUser: { id: string }) {
        return this.tagsService.createTag(data, currentUser.id);
    }

    @Get()
    async getAllTags(@GetUser() currentUser: { id: string }) {
        return this.tagsService.getAllTags(currentUser.id);
    }

    @Get(':id')
    async getTagById(@Param('id') id: string) {
        return this.tagsService.getTagById(id);
    }

    @Patch(':id')
    async updateTag(@Param('id') id: string, @Body() data: CreateTagDto, @GetUser() currentUser: { id: string }) {
        return this.tagsService.updateTag(id, data, currentUser.id);
    }

    @Delete(':id')
    async deleteTag(@Param('id') id: string, @GetUser() currentUser: { id: string }) {
        return this.tagsService.deleteTag(id, currentUser.id);
    }

}
