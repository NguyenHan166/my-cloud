import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Record<string, unknown>;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      // If email exists but NOT verified, resend OTP
      if (!existingUser.isEmailVerified) {
        const otp = this.generateOtp();
        const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await this.usersService.update(existingUser.id, {
          emailVerificationToken: otp,
          emailVerificationExpires: verificationExpires,
          // Update name and password if provided
          name: dto.name || existingUser.name || undefined,
          password: dto.password, // Will be hashed in update
        });

        try {
          await this.mailService.sendVerificationEmail(
            existingUser.email,
            dto.name || existingUser.name || '',
            otp,
          );
        } catch (error) {
          this.logger.error('Failed to resend verification email', error);
        }

        this.logger.log(
          `OTP resent for unverified user: ${existingUser.email}`,
        );
        return {
          message: 'Mã OTP mới đã được gửi đến email của bạn.',
        };
      }

      // Email exists and is verified
      throw new ConflictException('Email đã được sử dụng');
    }

    // Generate 8-digit OTP
    const otp = this.generateOtp();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      emailVerificationToken: otp,
      emailVerificationExpires: verificationExpires,
    });

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.name || '',
        otp,
      );
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      // Don't fail registration if email fails - user can resend
    }

    this.logger.log(`User registered: ${user.email}`);

    return {
      message:
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin để kích hoạt lại.',
      );
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Vui lòng xác thực email trước khi đăng nhập',
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Store refresh token hash
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: this.usersService.sanitize(user),
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Validate token in database
      const isValid = await this.usersService.validateRefreshToken(
        payload.sub,
        refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, user.email);

      // Update refresh token in database
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Email không tồn tại');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email đã được xác thực');
    }

    if (
      !user.emailVerificationToken ||
      !user.emailVerificationExpires ||
      user.emailVerificationToken !== otp ||
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    this.logger.log(`Email verified: ${user.email}`);

    return { message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.' };
  }

  /**
   * Resend OTP
   */
  async resendOtp(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return { message: 'Nếu email tồn tại, mã OTP mới đã được gửi.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email đã được xác thực');
    }

    // Generate new OTP
    const otp = this.generateOtp();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await this.usersService.update(user.id, {
      emailVerificationToken: otp,
      emailVerificationExpires: verificationExpires,
    });

    // Send new OTP email
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.name || '',
        otp,
      );
    } catch (error) {
      this.logger.error('Failed to send OTP email', error);
    }

    return { message: 'Mã OTP mới đã được gửi đến email của bạn.' };
  }

  /**
   * Request password reset
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    // Always return success to prevent email enumeration
    const successMessage =
      'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu.';

    if (!user) {
      return { message: successMessage };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send reset email
    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.name || '',
        resetToken,
      );
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
    }

    return { message: successMessage };
  }

  /**
   * Reset password
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(dto.token);

    if (!user) {
      throw new BadRequestException(
        'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      );
    }

    await this.usersService.update(user.id, {
      password: dto.newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshTokenHash: null, // Invalidate all sessions
    });

    this.logger.log(`Password reset: ${user.email}`);

    return {
      message:
        'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Đăng xuất thành công' };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<TokenPair> {
    const payload = { sub: userId, email };

    const accessExpiresIn =
      this.configService.get<string>('jwt.accessExpiresIn') || '15m';
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Generate 8-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }
}
