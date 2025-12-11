import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';

export class ToggleStatusResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Đã kích hoạt tài khoản',
  })
  message: string;

  @ApiProperty({
    description: 'Updated user information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
