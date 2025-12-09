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
import { Type, Transform } from 'class-transformer';
import { ItemType, Importance } from '@prisma/client';

/**
 * DTO for creating new tags inline
 */
export class NewTagDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    color?: string;
}

export class CreateItemDto {
    @IsEnum(ItemType)
    type: ItemType;

    @IsString()
    @IsNotEmpty()
    title: string;

    // Required when type=LINK
    @ValidateIf((o) => o.type === 'LINK')
    @IsUrl()
    url?: string;

    // Required when type=NOTE
    @ValidateIf((o) => o.type === 'NOTE')
    @IsString()
    @IsNotEmpty()
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

    // New tags to create inline
    // Note: Transform must be FIRST to parse JSON string from FormData before Type transforms
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    }, { toClassOnly: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NewTagDto)
    newTags?: NewTagDto[];
}
