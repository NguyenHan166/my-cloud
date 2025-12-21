import { ApiProperty } from '@nestjs/swagger';

export class StorageUsageResponseDto {
  @ApiProperty({
    description: 'Used storage in bytes',
    example: 2576980378,
  })
  usedStorageBytes: number;

  @ApiProperty({
    description: 'Maximum storage in bytes (5GB default)',
    example: 5368709120,
  })
  maxStorageBytes: number;

  @ApiProperty({
    description: 'Usage percentage (0-100)',
    example: 48,
  })
  usedPercentage: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 42,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Total number of collections',
    example: 5,
  })
  collectionCount: number;

  @ApiProperty({
    description: 'Formatted used storage string',
    example: '2.4 GB',
  })
  formattedUsed: string;

  @ApiProperty({
    description: 'Formatted max storage string',
    example: '5 GB',
  })
  formattedMax: string;
}
