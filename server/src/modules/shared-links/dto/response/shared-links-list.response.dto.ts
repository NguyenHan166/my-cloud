import { ApiProperty } from '@nestjs/swagger';
import { SharedLinkResponseDto } from './shared-link.response.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class SharedLinksListResponseDto {
  @ApiProperty({
    description: 'List of shared links',
    type: [SharedLinkResponseDto],
  })
  data: SharedLinkResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
