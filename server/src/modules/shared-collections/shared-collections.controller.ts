import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SharedCollectionsService } from './shared-collections.service';
import {
  CreateShareDto,
  UpdateShareDto,
  CollectionShareDto,
  SharedCollectionDto,
} from './dto';

@ApiTags('shared-collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shared-collections')
export class SharedCollectionsController {
  constructor(
    private readonly sharedCollectionsService: SharedCollectionsService,
  ) {}

  // ==========================================
  // OWNER ENDPOINTS - Manage shares you created
  // ==========================================

  @Post('collections/:collectionId/shares')
  @ApiOperation({
    summary: 'Share a collection with another user',
    description: 'Only collection owner can share. Cannot share with yourself.',
  })
  @ApiParam({ name: 'collectionId', description: 'Collection ID to share' })
  @ApiResponse({
    status: 201,
    description: 'Collection shared successfully',
    type: CollectionShareDto,
  })
  @ApiResponse({ status: 403, description: 'Not the collection owner' })
  @ApiResponse({ status: 404, description: 'Collection or user not found' })
  @ApiResponse({ status: 409, description: 'Already shared with this user' })
  async shareCollection(
    @Param('collectionId') collectionId: string,
    @Body() createShareDto: CreateShareDto,
    @Request() req: any,
  ) {
    return this.sharedCollectionsService.shareCollection(
      collectionId,
      createShareDto,
      req.user.id,
    );
  }

  @Get('collections/:collectionId/shares')
  @ApiOperation({
    summary: 'Get all shares for a collection',
    description:
      'Only collection owner can view. Returns list of users who have access to this collection.',
  })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'List of shares',
    type: [CollectionShareDto],
  })
  @ApiResponse({ status: 403, description: 'Not the collection owner' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  async getCollectionShares(
    @Param('collectionId') collectionId: string,
    @Request() req: any,
  ) {
    return this.sharedCollectionsService.getCollectionShares(
      collectionId,
      req.user.id,
    );
  }

  @Patch('collections/:collectionId/shares/:shareId')
  @ApiOperation({
    summary: 'Update share permission',
    description: 'Only collection owner can update permissions.',
  })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiParam({ name: 'shareId', description: 'Share ID to update' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: CollectionShareDto,
  })
  @ApiResponse({ status: 403, description: 'Not the collection owner' })
  @ApiResponse({ status: 404, description: 'Collection or share not found' })
  async updateSharePermission(
    @Param('collectionId') collectionId: string,
    @Param('shareId') shareId: string,
    @Body() updateShareDto: UpdateShareDto,
    @Request() req: any,
  ) {
    return this.sharedCollectionsService.updateSharePermission(
      collectionId,
      shareId,
      updateShareDto,
      req.user.id,
    );
  }

  @Delete('collections/:collectionId/shares/:shareId/revoke')
  @ApiOperation({
    summary: 'Revoke a share (soft delete)',
    description:
      'Only collection owner can revoke. User loses access but share record is kept.',
  })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiParam({ name: 'shareId', description: 'Share ID to revoke' })
  @ApiResponse({ status: 200, description: 'Share revoked successfully' })
  @ApiResponse({ status: 403, description: 'Not the collection owner' })
  @ApiResponse({ status: 404, description: 'Collection or share not found' })
  async revokeShare(
    @Param('collectionId') collectionId: string,
    @Param('shareId') shareId: string,
    @Request() req: any,
  ) {
    return this.sharedCollectionsService.revokeShare(
      collectionId,
      shareId,
      req.user.id,
    );
  }

  @Delete('collections/:collectionId/shares/:shareId')
  @ApiOperation({
    summary: 'Delete a share permanently',
    description:
      'Only collection owner can delete. Share record is permanently removed.',
  })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiParam({ name: 'shareId', description: 'Share ID to delete' })
  @ApiResponse({ status: 200, description: 'Share deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not the collection owner' })
  @ApiResponse({ status: 404, description: 'Collection or share not found' })
  async deleteShare(
    @Param('collectionId') collectionId: string,
    @Param('shareId') shareId: string,
    @Request() req: any,
  ) {
    return this.sharedCollectionsService.deleteShare(
      collectionId,
      shareId,
      req.user.id,
    );
  }

  // ==========================================
  // RECIPIENT ENDPOINTS - View collections shared with you
  // ==========================================

  @Get('shared-with-me')
  @ApiOperation({
    summary: 'Get all collections shared with the current user',
    description:
      'Returns collections that others have shared with you (not collections you own).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of shared collections',
    type: [SharedCollectionDto],
  })
  async getSharedCollections(@Request() req: any) {
    return this.sharedCollectionsService.getSharedCollections(req.user.id);
  }

  @Get('my-shared-collections')
  @ApiOperation({
    summary: 'Get collections owned by user that have active shares',
    description:
      'Returns only your collections that you have shared with others. Used in Share Management tab.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of collections with active shares',
  })
  async getMySharedCollections(@Request() req: any) {
    return this.sharedCollectionsService.getMySharedCollections(req.user.id);
  }

  @Get('collections/:collectionId/permission')
  @ApiOperation({
    summary: "Get current user's permission for a collection",
    description: "Returns 'owner', 'edit', 'view', or null if no access.",
  })
  @ApiParam({ name: 'collectionId', description: 'Collection ID' })
  @ApiResponse({
    status: 200,
    description: 'User permission level',
    schema: {
      type: 'object',
      properties: {
        permission: {
          type: 'string',
          enum: ['owner', 'edit', 'view', null],
        },
      },
    },
  })
  async getUserPermission(
    @Param('collectionId') collectionId: string,
    @Request() req: any,
  ) {
    const permission = await this.sharedCollectionsService.getUserPermission(
      req.user.id,
      collectionId,
    );
    return { permission };
  }
}
