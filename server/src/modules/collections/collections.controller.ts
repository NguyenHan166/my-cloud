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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common';
import { MessageResponseDto } from '../../common/dto';
import { CollectionsService } from './collections.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  QueryCollectionsDto,
  AddItemsDto,
  MoveCollectionDto,
  CollectionResponseDto,
  CollectionsListResponseDto,
  AddItemsResponseDto,
  RemoveItemsResponseDto,
} from './dto';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiPropertyOptional,
  ApiParam,
} from '@nestjs/swagger';
import { ItemsListResponseDto } from 'src/modules/items/dto';

class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

@ApiTags('collections')
@ApiBearerAuth('JWT-auth')
@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  /**
   * Create a new collection
   */
  @Post()
  @ApiOperation({
    summary: 'Create new collection',
    description:
      'Create a new collection. Provide parentId to create a sub-collection inside another collection.',
  })
  @ApiResponse({
    status: 201,
    description: 'Collection created successfully.',
    type: CollectionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or parent not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async create(
    @Body() data: CreateCollectionDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.create(data, user.id);
  }

  /**
   * Get all collections with filters and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'List collections with pagination',
    description:
      'Get all collections. Use parentId=root for only root collections, or parentId=<id> to get children of a specific collection.',
  })
  @ApiResponse({
    status: 200,
    description: 'Collections retrieved successfully.',
    type: CollectionsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async findAll(
    @Query() query: QueryCollectionsDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.findAll(query, user.id);
  }

  /**
   * Get single collection by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get collection by ID' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection retrieved successfully.',
    type: CollectionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async findById(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.collectionsService.findById(id, user.id);
  }

  /**
   * Get child collections
   */
  @Get(':id/children')
  @ApiOperation({
    summary: 'Get child collections',
    description: 'Get all direct child collections of a specified collection.',
  })
  @ApiParam({ name: 'id', description: 'Parent collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Child collections retrieved successfully.',
    type: CollectionsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async getChildren(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.getChildren(
      id,
      user.id,
      query.page,
      query.limit,
    );
  }

  /**
   * Get breadcrumb path
   */
  @Get(':id/breadcrumb')
  @ApiOperation({
    summary: 'Get breadcrumb path',
    description:
      'Get the path from root to the specified collection for breadcrumb navigation.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Breadcrumb path retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clxxx123...' },
          name: { type: 'string', example: 'My Collection' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async getBreadcrumb(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.getBreadcrumb(id, user.id);
  }

  /**
   * Update collection
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update collection',
    description:
      'Update collection properties. Include parentId to move the collection to a new parent.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection updated successfully.',
    type: CollectionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or circular reference detected.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateCollectionDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.update(id, data, user.id);
  }

  /**
   * Move collection to new parent
   */
  @Patch(':id/move')
  @ApiOperation({
    summary: 'Move collection to new parent',
    description:
      'Move a collection to a new parent. Set parentId to null to move to root level.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID to move' })
  @ApiResponse({
    status: 200,
    description: 'Collection moved successfully.',
    type: CollectionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Validation error: circular reference or trying to move to self.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or target parent not found.',
  })
  async moveCollection(
    @Param('id') id: string,
    @Body() data: MoveCollectionDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.moveCollection(
      id,
      data.parentId ?? null,
      user.id,
    );
  }

  /**
   * Delete collection
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete collection',
    description:
      'Delete a collection. All sub-collections inside will also be deleted (cascade).',
  })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection and all sub-collections deleted successfully.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async delete(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.collectionsService.delete(id, user.id);
  }

  /**
   * Add items to collection
   */
  @Post(':id/items')
  @ApiOperation({ summary: 'Add items to collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Items added successfully.',
    type: AddItemsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Some items do not exist or do not belong to you.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async addItems(
    @Param('id') id: string,
    @Body() data: AddItemsDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.addItems(id, data.itemIds, user.id);
  }

  /**
   * Remove items from collection
   */
  @Delete(':id/items')
  @ApiOperation({ summary: 'Remove items from collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Items removed successfully.',
    type: RemoveItemsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async removeItems(
    @Param('id') id: string,
    @Body() data: AddItemsDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.removeItems(id, data.itemIds, user.id);
  }

  /**
   * Get items in collection with pagination
   */
  @Get(':id/items')
  @ApiOperation({ summary: 'Get items inside a collection' })
  @ApiParam({ name: 'id', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection items retrieved successfully.',
    type: ItemsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found.',
  })
  async getItems(
    @Param('id') id: string,
    @Query() query: PaginationQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.collectionsService.getCollectionItems(
      id,
      user.id,
      query.page,
      query.limit,
    );
  }
}
