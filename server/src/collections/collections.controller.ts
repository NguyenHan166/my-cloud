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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common';
import { CollectionsService } from './collections.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  QueryCollectionsDto,
  AddItemsDto,
} from './dto';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiPropertyOptional,
} from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Create new collection' })
  @ApiResponse({
    status: 201,
    description: 'Collection created successfully.',
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
  @ApiOperation({ summary: 'List collections with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Collections retrieved successfully.',
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
  @ApiResponse({
    status: 200,
    description: 'Collection retrieved successfully.',
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
   * Update collection
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update collection' })
  @ApiResponse({
    status: 200,
    description: 'Collection updated successfully.',
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
   * Delete collection
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete collection' })
  @ApiResponse({
    status: 200,
    description: 'Collection deleted successfully.',
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
  @ApiResponse({
    status: 200,
    description: 'Items added successfully.',
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
  @ApiResponse({
    status: 200,
    description: 'Items removed successfully.',
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
  @ApiResponse({
    status: 200,
    description: 'Collection items retrieved successfully.',
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
