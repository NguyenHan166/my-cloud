import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { createReadStream, promises as fs, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadResult } from './interfaces';

// Threshold for using streaming upload (5MB)
const STREAMING_THRESHOLD = 5 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
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
}

