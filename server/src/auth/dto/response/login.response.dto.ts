import { ApiProperty } from '@nestjs/swagger';
import { TokensResponseDto } from './tokens.response.dto';
import { UserResponseDto } from './user.response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Authenticated user information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'JWT tokens',
    type: TokensResponseDto,
  })
  tokens: TokensResponseDto;
}
