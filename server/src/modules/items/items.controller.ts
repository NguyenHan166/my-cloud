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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common';
import { ItemsService } from './items.service';
import {
  CreateItemDto,
  UpdateItemDto,
  QueryItemsDto,
  ItemResponseDto,
  ItemWithMessageResponseDto,
  ItemsListResponseDto,
} from './dto';

import { MessageResponseDto } from 'src/common/dto/message.response.dto';

@ApiTags('items')
@ApiBearerAuth('JWT-auth')
@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * Create a new item
   * For FILE type: send files via multipart/form-data (supports multiple files)
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({ summary: 'Create new item (File, Note, or Link)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Item creation data and optional files',
    type: CreateItemDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully.',
    type: ItemWithMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
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
  @ApiOperation({ summary: 'Get all items with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Items retrieved successfully.',
    type: ItemsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async findAll(
    @Query() query: QueryItemsDto,
    @GetUser() user: { id: string },
  ) {
    return this.itemsService.findAll(query, user.id);
  }

  // ==================== TRASH ENDPOINTS ====================
  // Note: These routes must be BEFORE :id routes to avoid conflicts

  /**
   * Get all items in trash
   */
  @Get('trash')
  @ApiOperation({ summary: 'Get all items in trash with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Trash items retrieved successfully.',
    type: ItemsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async findTrashed(
    @Query() query: QueryItemsDto,
    @GetUser() user: { id: string },
  ) {
    return this.itemsService.findTrashed(query, user.id);
  }

  /**
   * Empty trash - permanently delete all trashed items
   */
  @Delete('trash')
  @ApiOperation({
    summary: 'Empty trash - permanently delete all trashed items',
  })
  @ApiResponse({
    status: 200,
    description: 'Trash emptied successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Permanently deleted 5 item(s) from trash',
        },
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async emptyTrash(@GetUser() user: { id: string }) {
    return this.itemsService.emptyTrash(user.id);
  }

  /**
   * Permanently delete a single item from trash
   */
  @Delete('trash/:id')
  @ApiOperation({ summary: 'Permanently delete a single item from trash' })
  @ApiResponse({
    status: 200,
    description: 'Item permanently deleted.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Item is not in trash.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
  async permanentlyDeleteItem(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.itemsService.permanentlyDeleteItem(id, user.id);
  }

  /**
   * Get single item by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Item retrieved successfully.',
    type: ItemResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
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
  @ApiOperation({ summary: 'Update item and optionally upload more files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Item update data and optional new files',
    type: UpdateItemDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully.',
    type: ItemWithMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
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
  @ApiOperation({ summary: 'Delete item' })
  @ApiResponse({
    status: 200,
    description: 'Item deleted successfully.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
  async deleteItem(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.itemsService.deleteItem(id, user.id);
  }

  /**
   * Toggle pin status
   */
  @Patch(':id/pin')
  @ApiOperation({ summary: 'Toggle item pin status' })
  @ApiResponse({
    status: 200,
    description: 'Pin status toggled successfully.',
    type: ItemWithMessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
  async togglePin(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.itemsService.togglePin(id, user.id);
  }

  /**
   * Set primary file for an item
   */
  @Patch(':id/files/:fileId/primary')
  @ApiOperation({ summary: 'Set primary file for item (for FILE type)' })
  @ApiResponse({
    status: 200,
    description: 'Primary file set successfully.',
    type: ItemResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item or file not found.',
  })
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
  @ApiOperation({ summary: 'Reorder files in item' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileIds: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: ['file-id-1', 'file-id-2'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Files reordered successfully.',
    type: ItemResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async reorderFiles(
    @Param('id') itemId: string,
    @Body('fileIds') fileIds: string[],
    @GetUser() user: { id: string },
  ) {
    return this.itemsService.reorderFiles(itemId, fileIds, user.id);
  }

  /**
   * Move item to trash (soft delete)
   */
  @Patch(':id/trash')
  @ApiOperation({ summary: 'Move item to trash' })
  @ApiResponse({
    status: 200,
    description: 'Item moved to trash successfully.',
    type: ItemWithMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Item is already in trash.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
  async moveToTrash(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.itemsService.moveToTrash(id, user.id);
  }

  /**
   * Restore item from trash
   */
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore item from trash' })
  @ApiResponse({
    status: 200,
    description: 'Item restored from trash successfully.',
    type: ItemWithMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Item is not in trash.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
  async restoreFromTrash(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.itemsService.restoreFromTrash(id, user.id);
  }
}
