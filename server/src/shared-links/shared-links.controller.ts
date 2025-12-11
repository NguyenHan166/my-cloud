import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common';
import { SharedLinksService } from './shared-links.service';
import {
  CreateSharedLinkDto,
  QuerySharedLinksDto,
  AccessSharedLinkDto,
  SharedLinkResponseDto,
  SharedLinksListResponseDto,
  AccessSharedLinkResponseDto,
  MessageResponseDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

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
   * Revoke a share link (Protected)
   */
  @Delete('shared-links/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke (delete) a shared link' })
  @ApiResponse({
    status: 200,
    description: 'Shared link revoked successfully.',
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
  async revokeLink(@Param('id') id: string, @GetUser() user: { id: string }) {
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
