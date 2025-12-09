import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto, QueryItemsDto } from './dto';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    /**
     * Create a new item
     * For FILE type: send files via multipart/form-data (supports multiple files)
     */
    @Post()
    @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
    async createItem(
        @Body() data: CreateItemDto,
        @GetUser() user: { id: string },
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        return this.itemsService.createItem(data, user.id, files);
    }

    /**
     * Get all items with filters and pagination
     */
    @Get()
    async findAll(
        @Query() query: QueryItemsDto,
        @GetUser() user: { id: string },
    ) {
        return this.itemsService.findAll(query, user.id);
    }

    /**
     * Get single item by ID
     */
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.itemsService.findById(id);
    }

    /**
     * Update item
     * For FILE type: optionally send new files via multipart/form-data to add
     * Use removeFileIds in body to remove specific files
     */
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('files', 10))
    async updateItem(
        @Param('id') id: string,
        @Body() data: UpdateItemDto,
        @GetUser() user: { id: string },
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        return this.itemsService.updateItem(id, data, user.id, files);
    }

    /**
     * Delete item (and all files from R2 if FILE type)
     */
    @Delete(':id')
    async deleteItem(
        @Param('id') id: string,
        @GetUser() user: { id: string },
    ) {
        return this.itemsService.deleteItem(id, user.id);
    }

    /**
     * Toggle pin status
     */
    @Patch(':id/pin')
    async togglePin(
        @Param('id') id: string,
        @GetUser() user: { id: string },
    ) {
        return this.itemsService.togglePin(id, user.id);
    }

    /**
     * Set primary file for an item
     */
    @Patch(':id/files/:fileId/primary')
    async setPrimaryFile(
        @Param('id') itemId: string,
        @Param('fileId') fileId: string,
        @GetUser() user: { id: string },
    ) {
        return this.itemsService.setPrimaryFile(itemId, fileId, user.id);
    }

    /**
     * Reorder files in an item
     */
    @Patch(':id/files/reorder')
    async reorderFiles(
        @Param('id') itemId: string,
        @Body('fileIds') fileIds: string[],
        @GetUser() user: { id: string },
    ) {
        return this.itemsService.reorderFiles(itemId, fileIds, user.id);
    }
}
