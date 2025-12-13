import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, Min } from 'class-validator';

export class UpdateSharedLinkDto {
  @ApiPropertyOptional({
    description: 'New expiration time in hours from now',
    example: 48,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  expiresIn?: number;

  @ApiPropertyOptional({
    description: 'New password (or null to remove password)',
    example: 'newPassword123',
  })
  @IsOptional()
  @IsString()
  password?: string | null;
}
