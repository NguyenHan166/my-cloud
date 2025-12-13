import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Sanitized file DTO for public shared link access
 * Excludes sensitive fields like file ID and user ID
 */
export class PublicItemFileDto {
  @ApiProperty({
    description: 'Original file name',
    example: 'document.pdf',
  })
  originalName: string;

  @ApiProperty({
    description: 'File MIME type',
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
    example: 'https://cdn.example.com/files/file.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Whether this is the primary file',
    example: true,
  })
  isPrimary: boolean;
}

/**
 * Sanitized tag DTO for public shared link access
 * Only includes name and color, excludes tag ID and user ID
 */
export class PublicItemTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'Important',
  })
  name: string;

  @ApiProperty({
    description: 'Tag color (hex)',
    example: '#FF5733',
  })
  color: string;
}

/**
 * Sanitized item DTO for public shared link access
 * Excludes all sensitive fields: id, userId, isPinned, isTrashed, trashedAt, createdAt, updatedAt
 */
export class PublicItemResponseDto {
  @ApiProperty({
    description: 'Item title',
    example: 'My Document',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'This is an important document',
  })
  description?: string;

  @ApiProperty({
    description: 'Item type',
    enum: ['FILE', 'LINK', 'NOTE'],
    example: 'FILE',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'URL (for LINK type items)',
    example: 'https://example.com',
  })
  url?: string;

  @ApiPropertyOptional({
    description: 'Content (for NOTE type items)',
    example: 'This is my note content...',
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Category',
    example: 'Documents',
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'Project name',
    example: 'Project Alpha',
  })
  project?: string;

  @ApiProperty({
    description: 'Importance level',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    example: 'MEDIUM',
  })
  importance: string;

  @ApiPropertyOptional({
    description: 'Domain (for LINK type items)',
    example: 'example.com',
  })
  domain?: string;

  @ApiProperty({
    description: 'Files attached to this item',
    type: [PublicItemFileDto],
  })
  files: PublicItemFileDto[];

  @ApiProperty({
    description: 'Tags associated with this item',
    type: [PublicItemTagDto],
  })
  tags: PublicItemTagDto[];
}
