import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;
}

export class AddItemsResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Successfully added 3 item(s) to collection',
  })
  message: string;

  @ApiProperty({
    description: 'Number of items added',
    example: 3,
  })
  addedCount: number;
}

export class RemoveItemsResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Successfully removed 2 item(s) from collection',
  })
  message: string;

  @ApiProperty({
    description: 'Number of items removed',
    example: 2,
  })
  removedCount: number;
}
