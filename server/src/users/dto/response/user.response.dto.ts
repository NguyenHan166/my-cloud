import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID (UUID)',
    example: 'c1b2a3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+84123456789',
  })
  phone?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['USER', 'ADMIN'],
    example: 'USER',
  })
  role: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the email has been verified',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
