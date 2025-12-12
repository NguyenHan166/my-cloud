import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemFileResponseDto } from './item-file.response.dto';
import { ItemTagJunctionResponseDto } from './item-tag.response.dto';

export class ItemResponseDto {
  @ApiProperty({
    description: 'Item ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this item',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  userId: string;

  @ApiProperty({
    description: 'Item type',
    enum: ['FILE', 'LINK', 'NOTE'],
    example: 'FILE',
  })
  type: string;

  @ApiProperty({
    description: 'Item title',
    example: 'My Important Document',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'This is an important document for the project',
  })
  description?: string;

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

  @ApiProperty({
    description: 'Whether item is pinned',
    example: false,
  })
  isPinned: boolean;

  @ApiPropertyOptional({
    description: 'URL (for LINK type)',
    example: 'https://example.com',
  })
  url?: string;

  @ApiPropertyOptional({
    description: 'Domain extracted from URL (for LINK type)',
    example: 'example.com',
  })
  domain?: string;

  @ApiPropertyOptional({
    description: 'Note content (for NOTE type)',
    example: 'This is my note content...',
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Tags as text for search',
    example: 'Work, Important',
  })
  tagsText?: string;

  @ApiProperty({
    description: 'Files attached to this item (for FILE type)',
    type: [ItemFileResponseDto],
  })
  files: ItemFileResponseDto[];

  @ApiProperty({
    description: 'Tags associated with this item',
    type: [ItemTagJunctionResponseDto],
  })
  itemTags: ItemTagJunctionResponseDto[];

  @ApiProperty({
    description: 'Item creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Item last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
