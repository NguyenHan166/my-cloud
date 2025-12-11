import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user.response.dto';
import { PaginationMetaDto } from './pagination.response.dto';

export class UsersListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}
