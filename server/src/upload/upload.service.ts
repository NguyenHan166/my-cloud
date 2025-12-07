import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

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
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<UploadResult> {
    const ext = this.getFileExtension(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const key = `${folder}/${filename}`;

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
