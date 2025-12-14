import { ApiProperty } from '@nestjs/swagger';
import { CollectionPermission } from '@prisma/client';

class UserBasicDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User name', required: false })
  name?: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  avatar?: string;
}

export class CollectionShareDto {
  @ApiProperty({ description: 'Share ID' })
  id: string;

  @ApiProperty({ description: 'Collection ID' })
  collectionId: string;

  @ApiProperty({ description: 'User ID (shared to)' })
  userId: string;

  @ApiProperty({ description: 'Permission level', enum: CollectionPermission })
  permission: CollectionPermission;

  @ApiProperty({ description: 'Shared by user ID', required: false })
  sharedById?: string;

  @ApiProperty({ description: 'Invitation timestamp' })
  invitedAt: Date;

  @ApiProperty({ description: 'Acceptance timestamp', required: false })
  acceptedAt?: Date;

  @ApiProperty({ description: 'Revocation timestamp', required: false })
  revokedAt?: Date;

  @ApiProperty({
    description: 'User who shared (owner)',
    type: UserBasicDto,
    required: false,
  })
  sharedBy?: UserBasicDto;

  @ApiProperty({
    description: 'User who received the share',
    type: UserBasicDto,
  })
  user: UserBasicDto;
}
