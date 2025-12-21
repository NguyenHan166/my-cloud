import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UploadService } from './upload.service';

class PartDto {
  @ApiProperty({ description: 'Part number (1-indexed)' })
  @IsInt()
  PartNumber: number;

  @ApiProperty({ description: 'ETag returned from R2 after uploading part' })
  @IsString()
  ETag: string;
}

class InitiateUploadDto {
  @ApiProperty({ description: 'Original filename', example: 'video.mp4' })
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'video/mp4',
  })
  @IsString()
  mimetype: string;

  @ApiProperty({
    description: 'Total file size in bytes',
    example: 187494855,
  })
  @IsNumber()
  size: number;
}

class CompleteUploadDto {
  @ApiProperty({
    description: 'Array of uploaded parts with PartNumber and ETag',
    type: [PartDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts: PartDto[];
}

@ApiTags('upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload/chunked')
@UseGuards(JwtAuthGuard)
export class ChunkedUploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate chunked upload for large files' })
  @ApiBody({ type: InitiateUploadDto })
  @ApiResponse({
    status: 201,
    description: 'Upload session initiated successfully',
  })
  async initiateUpload(
    @Body() data: InitiateUploadDto,
    @GetUser() user: { id: string },
  ) {
    return this.uploadService.initiateMultipartUpload(
      data.filename,
      data.mimetype,
      data.size,
      user.id,
    );
  }

  @Get(':sessionId/part/:partNumber')
  @ApiOperation({ summary: 'Get presigned URL for uploading a part' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
  })
  async getPartUrl(
    @Param('sessionId') sessionId: string,
    @Param('partNumber', ParseIntPipe) partNumber: number,
    @GetUser() user: { id: string },
  ) {
    return this.uploadService.getPresignedUploadUrl(
      sessionId,
      partNumber,
      user.id,
    );
  }

  @Post(':sessionId/complete')
  @ApiOperation({ summary: 'Complete multipart upload' })
  @ApiBody({ type: CompleteUploadDto })
  @ApiResponse({
    status: 200,
    description: 'Upload completed successfully',
  })
  async completeUpload(
    @Param('sessionId') sessionId: string,
    @Body() data: CompleteUploadDto,
    @GetUser() user: { id: string },
  ) {
    return this.uploadService.completeMultipartUpload(
      sessionId,
      data.parts,
      user.id,
    );
  }

  @Delete(':sessionId/abort')
  @ApiOperation({ summary: 'Abort multipart upload' })
  @ApiResponse({
    status: 200,
    description: 'Upload aborted successfully',
  })
  async abortUpload(
    @Param('sessionId') sessionId: string,
    @GetUser() user: { id: string },
  ) {
    await this.uploadService.abortMultipartUpload(sessionId, user.id);
    return { message: 'Upload aborted successfully' };
  }

  @Get(':sessionId/status')
  @ApiOperation({ summary: 'Get upload session status' })
  @ApiResponse({
    status: 200,
    description: 'Session status retrieved successfully',
  })
  async getStatus(
    @Param('sessionId') sessionId: string,
    @GetUser() user: { id: string },
  ) {
    return this.uploadService.getUploadSession(sessionId, user.id);
  }
}
