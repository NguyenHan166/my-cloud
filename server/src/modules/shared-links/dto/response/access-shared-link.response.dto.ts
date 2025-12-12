import { ApiProperty } from '@nestjs/swagger';
import { ItemResponseDto } from 'src/modules/items/dto';

export class AccessLinkInfoDto {
  @ApiProperty({
    description: 'Link expiration date',
    example: '2024-12-31T23:59:59.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Number of times the link has been accessed',
    example: 5,
  })
  accessCount: number;
}

export class AccessSharedLinkResponseDto {
  @ApiProperty({
    description: 'Shared item data',
    type: ItemResponseDto,
  })
  item: ItemResponseDto;

  @ApiProperty({
    description: 'Link info',
    type: AccessLinkInfoDto,
  })
  link: AccessLinkInfoDto;
}
