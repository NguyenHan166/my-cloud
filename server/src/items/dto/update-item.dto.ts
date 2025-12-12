import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { Importance } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Helper to parse JSON string from FormData
 */
const parseJsonArray = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

/**
 * DTO for creating new tags inline during update
 */
export class NewTagDto {
  @ApiProperty({ description: 'Tag name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Tag color' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateItemDto {
  @ApiPropertyOptional({ description: 'Update title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Update URL (for LINK)' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Update content (for NOTE)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Update description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Update category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Update project' })
  @IsOptional()
  @IsString()
  project?: string;

  @ApiPropertyOptional({ enum: Importance, description: 'Update importance' })
  @IsOptional()
  @IsEnum(Importance)
  importance?: Importance;

  // Existing tag IDs
  @ApiPropertyOptional({
    description: 'Array of tag IDs to replace existing ones',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  // New tags to create inline (parse JSON and convert to class instances)
  @ApiPropertyOptional({
    description: 'New tags to create inline (can be JSON string)',
    type: [NewTagDto],
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

  // File IDs to remove (for multi-file items)
  @ApiPropertyOptional({
    description: 'Array of file IDs to remove (can be JSON string)',
    isArray: true,
  })
  @IsOptional()
  @Transform(parseJsonArray)
  @IsArray()
  @IsString({ each: true })
  removeFileIds?: string[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'New files to upload (append to existing files)',
  })
  @IsOptional()
  files?: any[];
}
