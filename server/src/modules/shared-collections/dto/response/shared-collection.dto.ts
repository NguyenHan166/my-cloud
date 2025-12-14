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

class CollectionBasicDto {
  @ApiProperty({ description: 'Collection ID' })
  id: string;

  @ApiProperty({ description: 'Collection name' })
  name: string;

  @ApiProperty({ description: 'Collection description', required: false })
  description?: string;

  @ApiProperty({ description: 'Cover image URL', required: false })
  coverImage?: string;

  @ApiProperty({ description: 'Public status' })
  isPublic: boolean;

  @ApiProperty({ description: 'Parent collection ID', required: false })
  parentId?: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}

export class SharedCollectionDto {
  @ApiProperty({ description: 'Share ID' })
  id: string;

  @ApiProperty({ description: 'Permission level', enum: CollectionPermission })
  permission: CollectionPermission;

  @ApiProperty({ description: 'Invitation timestamp' })
  invitedAt: Date;

  @ApiProperty({ description: 'Acceptance timestamp', required: false })
  acceptedAt?: Date;

  @ApiProperty({ description: 'Collection details', type: CollectionBasicDto })
  collection: CollectionBasicDto;

  @ApiProperty({
    description: 'Owner who shared the collection',
    type: UserBasicDto,
    required: false,
  })
  sharedBy?: UserBasicDto;
}
