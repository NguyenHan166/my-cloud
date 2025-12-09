import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemsDto {
  @ApiProperty({
    description: 'Array of Item IDs to add/remove',
    example: ['item-1', 'item-2'],
  })
  @IsArray()
  @IsString({ each: true })
  itemIds: string[];
}
