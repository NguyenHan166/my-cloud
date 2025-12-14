import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CollectionPermission } from '@prisma/client';

export class UpdateShareDto {
  @ApiProperty({
    description: 'Updated permission level',
    enum: CollectionPermission,
    example: CollectionPermission.EDIT,
  })
  @IsEnum(CollectionPermission)
  @IsNotEmpty()
  permission: CollectionPermission;
}
