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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common';
import { SharedLinksService } from './shared-links.service';
import {
  CreateSharedLinkDto,
  QuerySharedLinksDto,
  AccessSharedLinkDto,
  UpdateSharedLinkDto,
  SharedLinkResponseDto,
  SharedLinksListResponseDto,
  AccessSharedLinkResponseDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { MessageResponseDto } from 'src/common/dto/message.response.dto';

@ApiTags('shared-links')
@Controller()
export class SharedLinksController {
  constructor(private readonly sharedLinksService: SharedLinksService) {}

  /**
   * Create a share link for an item (Protected)
   */
  @Post('shared-links')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a shared link for an item' })
  @ApiResponse({
    status: 201,
    description: 'Shared link created successfully.',
    type: SharedLinkResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
  async createShareLink(
    @Body() data: CreateSharedLinkDto,
    @GetUser() user: { id: string },
  ) {
    return this.sharedLinksService.createShareLink(data, user.id);
  }

  /**
   * Get all share links for current user (Protected)
   */
  @Get('shared-links')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all shared links' })
  @ApiResponse({
    status: 200,
    description: 'Shared links retrieved successfully.',
    type: SharedLinksListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getUserLinks(
    @Query() query: QuerySharedLinksDto,
    @GetUser() user: { id: string },
  ) {
    return this.sharedLinksService.findUserLinks(user.id, query);
  }

  /**
   * Update a share link (Protected)
   */
  @Patch('shared-links/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a shared link (expiration/password)' })
  @ApiResponse({
    status: 200,
    description: 'Shared link updated successfully.',
    type: SharedLinkResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Shared link not found.',
  })
  async updateLink(
    @Param('id') id: string,
    @Body() data: UpdateSharedLinkDto,
    @GetUser() user: { id: string },
  ) {
    return this.sharedLinksService.updateLink(id, user.id, data);
  }

  /**
   * Delete a share link (Protected)
   * Supports both revoke (soft delete) and permanent delete
   */
  @Delete('shared-links/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a shared link',
    description:
      'Use ?permanent=true to permanently delete, otherwise revokes the link',
  })
  @ApiResponse({
    status: 200,
    description: 'Shared link deleted/revoked successfully.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Shared link not found.',
  })
  async deleteLink(
    @Param('id') id: string,
    @Query('permanent') permanent: string,
    @GetUser() user: { id: string },
  ) {
    // If permanent=true, hard delete, otherwise soft delete (revoke)
    if (permanent === 'true') {
      return this.sharedLinksService.permanentlyDeleteLink(id, user.id);
    }
    return this.sharedLinksService.revokeLink(id, user.id);
  }

  /**
   * Access shared item via token (Public)
   */
  @Get('s/:token')
  @ApiOperation({ summary: 'Access shared item via token (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Shared item retrieved successfully.',
    type: AccessSharedLinkResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Password protected (password required).',
  })
  @ApiResponse({
    status: 404,
    description: 'Link not found or expired.',
  })
  @ApiResponse({
    status: 410,
    description: 'Link expired.',
  })
  async accessSharedLink(
    @Param('token') token: string,
    @Query() query: AccessSharedLinkDto,
  ) {
    return this.sharedLinksService.accessSharedLink(token, query);
  }

  /**
   * Verify password for protected link (Public)
   */
  @Post('s/:token/verify')
  @ApiOperation({ summary: 'Verify password for protected link' })
  @ApiResponse({
    status: 200,
    description: 'Password verified, returns access token or item.',
    type: AccessSharedLinkResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password.',
  })
  @ApiResponse({
    status: 404,
    description: 'Link not found or expired.',
  })
  async verifyPassword(
    @Param('token') token: string,
    @Body() data: AccessSharedLinkDto,
  ) {
    return this.sharedLinksService.accessSharedLink(token, data);
  }
}
