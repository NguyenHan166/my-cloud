import { ApiProperty } from '@nestjs/swagger';
import { ItemResponseDto } from './item.response.dto';

export class ItemWithMessageResponseDto {
  @ApiProperty({
    description: 'Item data',
    type: ItemResponseDto,
  })
  item: ItemResponseDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Item "My Document" created with 2 file(s)',
  })
  message: string;
}
