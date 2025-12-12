import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MoveCollectionDto {
  @ApiPropertyOptional({
    description:
      'New parent collection ID. Set to null or omit to move to root.',
    example: 'clxxx123...',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;
}
