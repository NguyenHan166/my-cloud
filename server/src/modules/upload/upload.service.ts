import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { createReadStream, promises as fs, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadResult } from './interfaces';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Threshold for using streaming upload (5MB)
const STREAMING_THRESHOLD = 5 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = this.configService.get<string>('CF_R2_BUCKET')!;
    this.publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL')!;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('CF_R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('CF_R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'CF_R2_SECRET_ACCESS_KEY',
        )!,
      },
    });

    this.logger.log(`Upload service initialized with bucket: ${this.bucket}`);
  }

  /**
   * Upload a file to R2
   * Automatically uses streaming for files > 5MB
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadResult> {
    const ext = this.getFileExtension(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const key = `${folder}/${filename}`;

    // Use streaming upload for large files
    if (file.size > STREAMING_THRESHOLD) {
      this.logger.log(
        `Using streaming upload for large file: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      );
      return this.uploadFileStream(
        Readable.from(file.buffer),
        file.size,
        file.mimetype,
        file.originalname,
        key,
      );
    }

    // Use regular upload for small files
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    this.logger.log(`File uploaded: ${key}`);

    return {
      key,
      url: `${this.publicBaseUrl}/${key}`,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Upload file using streaming (for large files)
   * Uses multipart upload for memory efficiency
   */
  async uploadFileStream(
    stream: Readable,
    size: number,
    mimetype: string,
    originalName: string,
    key: string,
  ): Promise<UploadResult> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: mimetype,
        ContentLength: size,
      },
      // Multipart upload settings
      queueSize: 4, // Concurrent upload parts
      partSize: 5 * 1024 * 1024, // 5MB per part (minimum for S3/R2)
      leavePartsOnError: false, // Clean up on error
    });

    // Track upload progress (optional logging)
    upload.on('httpUploadProgress', (progress) => {
      if (progress.loaded && progress.total) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        if (percent % 25 === 0) {
          // Log at 25%, 50%, 75%, 100%
          this.logger.debug(`Upload progress: ${percent}% (${key})`);
        }
      }
    });

    await upload.done();

    this.logger.log(`File uploaded via streaming: ${key}`);

    return {
      key,
      url: `${this.publicBaseUrl}/${key}`,
      filename: originalName,
      mimetype,
      size,
    };
  }

  /**
   * Upload file from disk path (for true streaming uploads)
   * Streams file directly from disk to R2, minimizing memory usage
   */
  async uploadFileFromDisk(
    filePath: string,
    originalName: string,
    mimetype: string,
    folder: string = 'uploads',
  ): Promise<UploadResult> {
    const ext = this.getFileExtension(originalName);
    const filename = `${uuidv4()}${ext}`;
    const key = `${folder}/${filename}`;

    // Get file stats
    const stats = await fs.stat(filePath);
    const size = stats.size;

    this.logger.log(
      `Streaming file from disk: ${originalName} (${(size / 1024 / 1024).toFixed(2)}MB)`,
    );

    // Create read stream from disk
    const stream = createReadStream(filePath);

    try {
      const result = await this.uploadFileStream(
        stream,
        size,
        mimetype,
        originalName,
        key,
      );

      // Clean up temp file after successful upload
      await this.cleanupTempFile(filePath);

      return result;
    } catch (error) {
      // Clean up on error too
      await this.cleanupTempFile(filePath);
      throw error;
    }
  }

  /**
   * Clean up temporary file
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        this.logger.debug(`Cleaned up temp file: ${filePath}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup temp file ${filePath}: ${error}`);
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadFile(file, 'avatars');
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`File deleted: ${key}`);
  }

  /**
   * Delete file by URL
   */
  async deleteFileByUrl(url: string): Promise<void> {
    if (!url || !url.startsWith(this.publicBaseUrl)) {
      return;
    }

    const key = url.replace(`${this.publicBaseUrl}/`, '');
    await this.deleteFile(key);
  }

  /**
   * Get public URL for a storage key
   */
  getPublicUrl(storageKey: string): string {
    return `${this.publicBaseUrl}/${storageKey}`;
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }

  /**
   * Validate image file
   */
  validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Chỉ hỗ trợ file ảnh: JPEG, PNG, GIF, WEBP',
      };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File quá lớn. Tối đa 5MB' };
    }

    return { valid: true };
  }

  // ==================== MULTIPART UPLOAD METHODS ====================

  /**
   * Initiate multipart upload to R2
   */
  async initiateMultipartUpload(
    filename: string,
    mimetype: string,
    size: number,
    userId: string,
  ): Promise<{
    uploadId: string;
    key: string;
    sessionId: string;
    chunkSize: number;
    totalParts: number;
  }> {
    const ext = this.getFileExtension(filename);
    const key = `uploads/${uuidv4()}${ext}`;
    const chunkSize = 5 * 1024 * 1024; // 5MB
    const totalParts = Math.ceil(size / chunkSize);

    // Create multipart upload in R2
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimetype,
    });

    const result = await this.s3Client.send(command);

    if (!result.UploadId) {
      throw new Error('Failed to initiate multipart upload');
    }

    // Save session to database
    const session = await this.prisma.uploadSession.create({
      data: {
        uploadId: result.UploadId,
        key,
        filename,
        mimetype,
        size: BigInt(size),
        chunkSize,
        totalParts,
        userId,
        status: 'IN_PROGRESS',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    this.logger.log(
      `Initiated multipart upload: ${result.UploadId} (${totalParts} parts, ${(size / 1024 / 1024).toFixed(2)}MB)`,
    );

    return {
      uploadId: result.UploadId,
      key,
      sessionId: session.id,
      chunkSize,
      totalParts,
    };
  }

  /**
   * Generate presigned URL for uploading a specific part
   */
  async getPresignedUploadUrl(
    sessionId: string,
    partNumber: number,
    userId: string,
  ): Promise<{ presignedUrl: string; expiresIn: number }> {
    // Get session from DB
    const session = await this.prisma.uploadSession.findFirst({
      where: {
        id: sessionId,
        userId,
        status: 'IN_PROGRESS',
      },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found or expired');
    }

    if (partNumber < 1 || partNumber > session.totalParts) {
      throw new BadRequestException(
        `Invalid part number. Must be between 1 and ${session.totalParts}`,
      );
    }

    // Generate presigned URL (5 minutes)
    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: session.key,
      UploadId: session.uploadId,
      PartNumber: partNumber,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    this.logger.debug(
      `Generated presigned URL for part ${partNumber}/${session.totalParts} (session: ${sessionId})`,
    );

    return {
      presignedUrl,
      expiresIn: 300,
    };
  }

  /**
   * Complete multipart upload
   */
  async completeMultipartUpload(
    sessionId: string,
    parts: Array<{ PartNumber: number; ETag: string }>,
    userId: string,
  ): Promise<UploadResult> {
    const session = await this.prisma.uploadSession.findFirst({
      where: {
        id: sessionId,
        userId,
        status: 'IN_PROGRESS',
      },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    // Validate all parts are present
    if (parts.length !== session.totalParts) {
      throw new BadRequestException(
        `Expected ${session.totalParts} parts, got ${parts.length}`,
      );
    }

    // Sort parts by PartNumber
    const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

    // Validate part numbers are sequential
    const invalidParts = sortedParts.filter(
      (part, index) => part.PartNumber !== index + 1,
    );
    if (invalidParts.length > 0) {
      throw new BadRequestException('Part numbers must be sequential from 1');
    }

    // Complete multipart upload in R2
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: session.key,
      UploadId: session.uploadId,
      MultipartUpload: {
        Parts: sortedParts,
      },
    });

    await this.s3Client.send(command);

    // Update session status
    await this.prisma.uploadSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        uploadedParts: sortedParts,
      },
    });

    this.logger.log(
      `Completed multipart upload: ${session.key} (${(Number(session.size) / 1024 / 1024).toFixed(2)}MB)`,
    );

    return {
      key: session.key,
      url: `${this.publicBaseUrl}/${session.key}`,
      filename: session.filename,
      mimetype: session.mimetype,
      size: Number(session.size),
    };
  }

  /**
   * Abort multipart upload
   */
  async abortMultipartUpload(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.uploadSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      return; // Already cleaned up
    }

    try {
      // Abort in R2
      const command = new AbortMultipartUploadCommand({
        Bucket: this.bucket,
        Key: session.key,
        UploadId: session.uploadId,
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.warn(
        `Failed to abort multipart upload in R2: ${error.message}`,
      );
    }

    // Update session
    await this.prisma.uploadSession.update({
      where: { id: sessionId },
      data: { status: 'ABORTED' },
    });

    this.logger.log(`Aborted multipart upload: ${session.uploadId}`);
  }

  /**
   * Get upload session status
   */
  async getUploadSession(sessionId: string, userId: string) {
    const session = await this.prisma.uploadSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    return {
      id: session.id,
      uploadId: session.uploadId,
      key: session.key,
      filename: session.filename,
      mimetype: session.mimetype,
      size: Number(session.size),
      chunkSize: session.chunkSize,
      totalParts: session.totalParts,
      status: session.status,
      uploadedParts: session.uploadedParts,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Cleanup expired upload sessions (called by cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.prisma.uploadSession.findMany({
      where: {
        status: 'IN_PROGRESS',
        expiresAt: {
          lt: new Date(),
        },
      },
      take: 100, // Batch process
    });

    let cleaned = 0;
    for (const session of expiredSessions) {
      try {
        await this.abortMultipartUpload(session.id, session.userId);
        cleaned++;
      } catch (error) {
        this.logger.error(
          `Failed to cleanup session ${session.id}: ${error.message}`,
        );
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired upload sessions`);
    }

    return cleaned;
  }
}
