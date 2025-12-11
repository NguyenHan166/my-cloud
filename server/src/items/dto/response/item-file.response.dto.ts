import { ApiProperty } from '@nestjs/swagger';
import { FileResponseDto } from './file.response.dto';

export class ItemFileResponseDto {
  @ApiProperty({
    description: 'ItemFile junction ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Item ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  itemId: string;

  @ApiProperty({
    description: 'File ID',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  fileId: string;

  @ApiProperty({
    description: 'Position/order of file in item',
    example: 0,
  })
  position: number;

  @ApiProperty({
    description: 'Whether this is the primary/thumbnail file',
    example: true,
  })
  isPrimary: boolean;

  @ApiProperty({
    description: 'File details with URL',
    type: FileResponseDto,
  })
  file: FileResponseDto;
}
