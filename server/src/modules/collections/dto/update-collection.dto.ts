import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCollectionDto {
  @ApiPropertyOptional({ description: 'Update name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Update description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Update cover image' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Update public status' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Update public slug' })
  @IsOptional()
  @IsString()
  slugPublic?: string;

  @ApiPropertyOptional({
    description: 'Move to new parent collection. Set to null to move to root.',
    example: 'clxxx123...',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}
