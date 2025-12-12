import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagResponseDto, TagWithMessageResponseDto } from './dto/response';
import { GetUser } from 'src/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { MessageResponseDto } from '../../common/dto';

@ApiTags('tags')
@ApiBearerAuth('JWT-auth')
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully.',
    type: TagWithMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async createTag(
    @Body() data: CreateTagDto,
    @GetUser() currentUser: { id: string },
  ) {
    return this.tagsService.createTag(data, currentUser.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags for current user' })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully.',
    type: [TagResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async getAllTags(@GetUser() currentUser: { id: string }) {
    return this.tagsService.getAllTags(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully.',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found.',
  })
  async getTagById(@Param('id') id: string) {
    return this.tagsService.getTagById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully.',
    type: TagWithMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found.',
  })
  async updateTag(
    @Param('id') id: string,
    @Body() data: CreateTagDto,
    @GetUser() currentUser: { id: string },
  ) {
    return this.tagsService.updateTag(id, data, currentUser.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found.',
  })
  async deleteTag(
    @Param('id') id: string,
    @GetUser() currentUser: { id: string },
  ) {
    return this.tagsService.deleteTag(id, currentUser.id);
  }
}
