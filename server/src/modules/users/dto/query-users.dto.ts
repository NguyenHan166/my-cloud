import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsIn,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  EMAIL = 'email',
  NAME = 'name',
}

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search term for email or name',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by email verification status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: UserSortField,
    example: UserSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UserSortField)
  sortBy?: UserSortField = UserSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
