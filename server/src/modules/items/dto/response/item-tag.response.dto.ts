import { ApiProperty } from '@nestjs/swagger';

export class ItemTagResponseDto {
  @ApiProperty({
    description: 'Tag ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

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
}

export class ItemTagJunctionResponseDto {
  @ApiProperty({
    description: 'Tag details',
    type: ItemTagResponseDto,
  })
  tag: ItemTagResponseDto;
}
