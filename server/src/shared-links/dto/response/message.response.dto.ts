import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Share link revoked successfully',
  })
  message: string;
}
