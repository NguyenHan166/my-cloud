import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ItemType, Importance } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating new tags inline
 */
export class NewTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'New Tag',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Tag color',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  color?: string;
}

export class CreateItemDto {
  @ApiProperty({
    description: 'Item type: FILE, NOTE, or LINK',
    enum: ItemType,
    example: ItemType.NOTE,
  })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiProperty({
    description: 'Item title',
    example: 'Deep Learning Notes',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  // Required when type=LINK
  @ApiPropertyOptional({
    description: 'URL (required if type is LINK)',
    example: 'https://example.com',
  })
  @ValidateIf((o) => o.type === 'LINK')
  @IsUrl()
  url?: string;

  // Required when type=NOTE
  @ApiPropertyOptional({
    description: 'Text content (required if type is NOTE)',
    example: '# My Notes\n- Point 1',
  })
  @ValidateIf((o) => o.type === 'NOTE')
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Notes about neural networks',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Study',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Project name',
    example: 'AI Research',
  })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional({
    description: 'Importance level',
    enum: Importance,
    example: Importance.HIGH,
  })
  @IsOptional()
  @IsEnum(Importance)
  importance?: Importance;

  // Existing tag IDs
  @ApiPropertyOptional({
    description: 'Array of existing tag IDs',
    example: ['tag-uuid-1', 'tag-uuid-2'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  // New tags to create inline
  // Parse JSON string and convert to class instances in one Transform
  @ApiPropertyOptional({
    description:
      'Array of new tag objects to create inline. Can be sent as JSON string in form-data.',
    type: [NewTagDto],
    example: [{ name: 'Urgent', color: '#FF0000' }],
    isArray: true,
  })
  @IsOptional()
  @Transform(
    ({ value }) => {
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch {
          return value;
        }
      }
      // Convert plain objects to NewTagDto class instances
      if (Array.isArray(parsed)) {
        return plainToInstance(NewTagDto, parsed);
      }
      return parsed;
    },
    { toClassOnly: true },
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewTagDto)
  newTags?: NewTagDto[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Files to upload (required if type is FILE)',
  })
  @IsOptional()
  files?: any[];
}
