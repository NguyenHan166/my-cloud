import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name',
    example: 'Work',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Tag color (hex code or color name)',
    example: '#3B82F6',
  })
  @IsString()
  @IsOptional()
  color?: string;
}
