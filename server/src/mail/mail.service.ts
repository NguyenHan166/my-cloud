import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<boolean>('mail.secure'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const from = this.configService.get<string>('mail.from');

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    otp: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; text-align: center; }
          .content h2 { color: #333333; margin-top: 0; }
          .content p { color: #666666; line-height: 1.6; }
          .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            letter-spacing: 8px; 
            color: #667eea; 
            background-color: #f0f4ff; 
            padding: 20px 30px; 
            border-radius: 12px; 
            border: 2px dashed #667eea;
            display: inline-block;
            margin: 20px 0;
          }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
          .warning { color: #f5576c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌩️ PersonalCloud</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name || 'bạn'}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản PersonalCloud. Đây là mã OTP để xác thực email:</p>
            <div class="otp-code">${otp}</div>
            <p>Nhập mã này vào trang xác thực để hoàn tất đăng ký.</p>
            <p class="warning">⏱️ Mã này sẽ hết hạn sau 30 phút!</p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
          </div>
          <div class="footer">
            <p>© 2024 PersonalCloud. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      to: email,
      subject: '🌩️ Mã OTP xác thực PersonalCloud',
      html,
      text: `Xin chào ${name || 'bạn'}! Mã OTP xác thực của bạn là: ${otp}. Mã hết hạn sau 30 phút.`,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #333333; margin-top: 0; }
          .content p { color: #666666; line-height: 1.6; }
          .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
          .code { background-color: #f0f0f0; padding: 15px; border-radius: 4px; font-family: monospace; word-break: break-all; }
          .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name || 'bạn'}!</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
            </p>
            <p>Hoặc copy link sau vào trình duyệt:</p>
            <div class="code">${resetUrl}</div>
            <div class="warning" style="margin-top: 20px;">
              ⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">Link này sẽ hết hạn sau 1 giờ.</p>
          </div>
          <div class="footer">
            <p>© 2024 PersonalCloud. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendMail({
      to: email,
      subject: '🔐 Đặt lại mật khẩu PersonalCloud',
      html,
      text: `Xin chào ${name || 'bạn'}! Đặt lại mật khẩu tại: ${resetUrl}`,
    });
  }
}
