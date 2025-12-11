import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';

export class UpdateProfileResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Thông tin đã được cập nhật',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
