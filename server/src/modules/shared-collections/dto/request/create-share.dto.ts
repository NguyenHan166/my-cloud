import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { CollectionPermission } from '@prisma/client';

export class CreateShareDto {
  @ApiProperty({
    description: 'Email of the user to share the collection with',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @ApiProperty({
    description: 'Permission level for the shared user',
    enum: CollectionPermission,
    example: CollectionPermission.VIEW,
  })
  @IsEnum(CollectionPermission)
  @IsNotEmpty()
  permission: CollectionPermission;
}
