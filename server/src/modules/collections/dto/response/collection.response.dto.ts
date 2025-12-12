import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionResponseDto {
  @ApiProperty({
    description: 'Collection ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this collection',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  userId: string;

  @ApiProperty({
    description: 'Collection name',
    example: 'My Documents',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Collection description',
    example: 'A collection of important documents',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://example.com/cover.jpg',
  })
  coverImage?: string;

  @ApiProperty({
    description: 'Whether the collection is public',
    example: false,
  })
  isPublic: boolean;

  @ApiPropertyOptional({
    description: 'Public slug for sharing',
    example: 'my-documents',
  })
  slugPublic?: string;

  @ApiPropertyOptional({
    description: 'Item count in collection',
    example: { items: 5 },
  })
  _count?: { items: number };

  @ApiProperty({
    description: 'Collection creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Collection last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
