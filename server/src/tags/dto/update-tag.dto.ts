import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiPropertyOptional({
    description: 'Tag name',
    example: 'Work',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Tag color (hex code or color name)',
    example: '#10B981',
  })
  @IsString()
  @IsOptional()
  color?: string;
}
