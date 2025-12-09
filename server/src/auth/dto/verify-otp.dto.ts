import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '8-digit OTP code sent to email',
    example: '12345678',
    minLength: 8,
    maxLength: 8,
  })
  @IsString()
  @Length(8, 8, { message: 'OTP phải có 8 số' })
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'User email address to resend OTP',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
