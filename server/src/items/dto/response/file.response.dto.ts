import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({
    description: 'File ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this file',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  userId: string;

  @ApiProperty({
    description: 'Storage key in R2',
    example: 'items/user123/abc123.pdf',
  })
  storageKey: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'document.pdf',
  })
  originalName: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'Public URL to access the file',
    example: 'https://storage.example.com/items/user123/abc123.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'File creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'File last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
