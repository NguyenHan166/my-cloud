import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Patch,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UploadService } from './upload.service';
import { UsersService } from '../users/users.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Upload avatar for current user
   */
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: { id: string },
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    // Validate image
    const validation = this.uploadService.validateImage(file);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Get current user to delete old avatar if exists
    const currentUser = await this.usersService.findById(user.id);
    if (currentUser?.avatar) {
      await this.uploadService.deleteFileByUrl(currentUser.avatar);
    }

    // Upload new avatar
    const result = await this.uploadService.uploadAvatar(file);

    // Update user avatar
    await this.usersService.update(user.id, { avatar: result.url });

    return {
      message: 'Avatar đã được cập nhật',
      avatar: result.url,
    };
  }

  /**
   * Upload avatar for specific user (Admin only)
   */
  @Patch('avatar/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatarForUser(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    const validation = this.uploadService.validateImage(file);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const targetUser = await this.usersService.findById(userId);
    if (!targetUser) {
      throw new BadRequestException('User không tồn tại');
    }

    // Delete old avatar if exists
    if (targetUser.avatar) {
      await this.uploadService.deleteFileByUrl(targetUser.avatar);
    }

    // Upload new avatar
    const result = await this.uploadService.uploadAvatar(file);

    // Update user avatar
    await this.usersService.update(userId, { avatar: result.url });

    return {
      message: 'Avatar đã được cập nhật',
      avatar: result.url,
    };
  }

  /**
   * General file upload
   */
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    const result = await this.uploadService.uploadFile(file);

    return {
      message: 'File đã được upload',
      ...result,
    };
  }
}
