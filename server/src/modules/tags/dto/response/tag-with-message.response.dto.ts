import { ApiProperty } from '@nestjs/swagger';
import { TagResponseDto } from './tag.response.dto';

export class TagWithMessageResponseDto {
  @ApiProperty({
    description: 'Tag data',
    type: TagResponseDto,
  })
  data: TagResponseDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Tag "Work" created successfully',
  })
  message: string;
}
