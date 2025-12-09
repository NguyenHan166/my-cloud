import {
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    IsUrl,
    ValidateNested,
    IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Importance } from '@prisma/client';

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
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    color?: string;
}

export class UpdateItemDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsUrl()
    url?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    project?: string;

    @IsOptional()
    @IsEnum(Importance)
    importance?: Importance;

    // Existing tag IDs
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tagIds?: string[];

    // New tags to create inline (Transform must be FIRST)
    @IsOptional()
    @Transform(parseJsonArray, { toClassOnly: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NewTagDto)
    newTags?: NewTagDto[];

    // File IDs to remove (for multi-file items)
    @IsOptional()
    @Transform(parseJsonArray)
    @IsArray()
    @IsString({ each: true })
    removeFileIds?: string[];
}
