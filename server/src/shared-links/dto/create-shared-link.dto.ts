import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSharedLinkDto {
  @ApiProperty({
    description: 'ID of the item to share',
    example: 'item-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    description: 'Expiration time in hours',
    example: 24,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  expiresIn: number; // Hours until expiration

  @ApiPropertyOptional({
    description: 'Optional password protection',
    example: 'secret123',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
