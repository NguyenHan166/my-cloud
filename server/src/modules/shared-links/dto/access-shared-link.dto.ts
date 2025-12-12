import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AccessSharedLinkDto {
  @ApiPropertyOptional({
    description: 'Password if the link is protected',
    example: 'secret123',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
