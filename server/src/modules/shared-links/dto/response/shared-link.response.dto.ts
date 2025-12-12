import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SharedLinkItemDto {
  @ApiProperty({
    description: 'Item ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Item title',
    example: 'My Document',
  })
  title: string;

  @ApiProperty({
    description: 'Item type',
    enum: ['FILE', 'LINK', 'NOTE'],
    example: 'FILE',
  })
  type: string;
}

export class SharedLinkResponseDto {
  @ApiProperty({
    description: 'Shared link ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Share token',
    example: 'a1b2c3d4e5f6...',
  })
  token: string;

  @ApiProperty({
    description: 'Full shareable URL',
    example: 'https://example.com/s/a1b2c3d4e5f6...',
  })
  url: string;

  @ApiProperty({
    description: 'Expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Whether the link has a password',
    example: false,
  })
  hasPassword: boolean;

  @ApiPropertyOptional({
    description: 'Whether the link has been revoked',
    example: false,
  })
  revoked?: boolean;

  @ApiPropertyOptional({
    description: 'Number of times the link has been accessed',
    example: 5,
  })
  accessCount?: number;

  @ApiPropertyOptional({
    description: 'Whether the link is expired',
    example: false,
  })
  isExpired?: boolean;

  @ApiProperty({
    description: 'Associated item info',
    type: SharedLinkItemDto,
  })
  item: SharedLinkItemDto;

  @ApiProperty({
    description: 'Link creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
