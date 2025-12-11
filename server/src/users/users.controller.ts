import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  UserResponseDto,
  UsersListResponseDto,
  UpdateProfileResponseDto,
  ToggleStatusResponseDto,
  MessageResponseDto,
} from './dto/response';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ========== USER ENDPOINTS ==========

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async getProfile(@GetUser() user: { id: string }) {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      return null;
    }
    return this.usersService.sanitize(fullUser);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    type: UpdateProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async updateProfile(
    @GetUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(user.id, {
      name: dto.name,
      phone: dto.phone,
      password: dto.password,
    });

    return {
      message: 'Thông tin đã được cập nhật',
      user: this.usersService.sanitize(updated),
    };
  }

  // ========== ADMIN ENDPOINTS ==========

  /**
   * List all users with pagination and filters
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] List all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully.',
    type: UsersListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required.',
  })
  async listUsers(@Query() query: QueryUsersDto) {
    const result = await this.usersService.findAll({
      page: query.page || 1,
      limit: query.limit || 20,
      search: query.search,
      isActive: query.isActive,
      isEmailVerified: query.isEmailVerified,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    return {
      users: result.data.map((user) => this.usersService.sanitize(user)),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }
    return this.usersService.sanitize(user);
  }

  /**
   * Admin create new user
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Create new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserResponseDto,
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
    status: 403,
    description: 'Forbidden - Admin role required.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists.',
  })
  async createUser(@Body() dto: AdminCreateUserDto) {
    // Check if email already exists
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Đã Email được sử dụng');
    }

    const user = await this.usersService.adminCreate({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      role: dto.role,
      isActive: dto.isActive,
      isEmailVerified: dto.isEmailVerified,
    });

    return this.usersService.sanitize(user);
  }

  /**
   * Admin update user
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserResponseDto,
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
    status: 403,
    description: 'Forbidden - Admin role required or cannot demote self.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
    @GetUser() currentUser: { id: string },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Prevent admin from removing their own admin role
    if (id === currentUser.id && dto.role === UserRole.USER) {
      throw new ForbiddenException('Bạn không thể tự hạ quyền của mình');
    }

    const updated = await this.usersService.adminUpdate(id, {
      name: dto.name,
      password: dto.password,
      role: dto.role,
      isActive: dto.isActive,
      isEmailVerified: dto.isEmailVerified,
    });

    return this.usersService.sanitize(updated);
  }

  /**
   * Toggle user active status (soft delete/restore)
   */
  @Patch(':id/toggle-status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Toggle user active status' })
  @ApiResponse({
    status: 200,
    description: 'User status toggled successfully.',
    type: ToggleStatusResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required or cannot deactivate self.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async toggleUserStatus(
    @Param('id') id: string,
    @GetUser() currentUser: { id: string },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Prevent admin from deactivating themselves
    if (id === currentUser.id) {
      throw new ForbiddenException(
        'Bạn không thể vô hiệu hóa tài khoản của mình',
      );
    }

    const updated = await this.usersService.toggleStatus(id);
    return {
      message: updated.isActive
        ? 'Đã kích hoạt tài khoản'
        : 'Đã vô hiệu hóa tài khoản',
      user: this.usersService.sanitize(updated),
    };
  }

  /**
   * Hard delete user (permanent)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Permanently delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required or cannot delete self.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async deleteUser(
    @Param('id') id: string,
    @GetUser() currentUser: { id: string },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Prevent admin from deleting themselves
    if (id === currentUser.id) {
      throw new ForbiddenException('Bạn không thể xóa tài khoản của mình');
    }

    await this.usersService.hardDelete(id);
    return { message: 'Đã xóa user vĩnh viễn' };
  }
}
