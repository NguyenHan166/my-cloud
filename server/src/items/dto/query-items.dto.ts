import {
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    IsBoolean,
    IsInt,
    Min,
    Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ItemType, Importance } from '@prisma/client';

export class QueryItemsDto {
    @IsOptional()
    @IsEnum(ItemType)
    type?: ItemType;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    project?: string;

    @IsOptional()
    @IsString()
    domain?: string;

    @IsOptional()
    @IsEnum(Importance)
    importance?: Importance;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isPinned?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
    tagIds?: string[];

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'importance';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}
