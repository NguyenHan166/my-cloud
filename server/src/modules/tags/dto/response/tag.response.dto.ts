import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({
    description: 'Tag ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this tag',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  userId: string;

  @ApiProperty({
    description: 'Tag name',
    example: 'Work',
  })
  name: string;

  @ApiProperty({
    description: 'Tag color (hex code)',
    example: '#3B82F6',
  })
  color: string;

  @ApiPropertyOptional({
    description: 'Number of items using this tag',
    example: 5,
  })
  itemCount?: number;

  @ApiProperty({
    description: 'Tag creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Tag last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
