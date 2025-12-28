import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Chạy mỗi 5 phút để kiểm tra các item có reminderAt sắp đến
   * Timezone: Vietnam (GMT+7)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkAndSendReminders() {
    this.logger.log('🔔 Checking for pending reminders...');

    // Lấy thời gian hiện tại theo giờ Việt Nam
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    this.logger.debug(
      `Checking reminders between ${now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} and ${fiveMinutesFromNow.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
    );

    try {
      // Lấy các item có reminderAt trong 5 phút tới và chưa bị trash
      const itemsWithReminders = await this.prisma.item.findMany({
        where: {
          reminderAt: {
            gte: now,
            lte: fiveMinutesFromNow,
          },
          isTrashed: false,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (itemsWithReminders.length === 0) {
        this.logger.log('No pending reminders found');
        return;
      }

      this.logger.log(
        `Found ${itemsWithReminders.length} reminder(s) to process`,
      );

      // Gửi email cho từng item
      for (const item of itemsWithReminders) {
        try {
          await this.sendReminderEmail(item);

          // Sau khi gửi xong, xóa reminderAt để không gửi lại
          await this.prisma.item.update({
            where: { id: item.id },
            data: { reminderAt: null },
          });

          this.logger.log(
            `✅ Sent reminder for item ${item.id} to ${item.user.email}`,
          );
        } catch (error) {
          this.logger.error(
            `❌ Failed to send reminder for item ${item.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error checking reminders:', error);
    }
  }

  /**
   * Gửi email nhắc nhở
   */
  private async sendReminderEmail(item: any) {
    const { user, title, description, type, url, content, reminderAt } = item;

    if (!user.email) {
      this.logger.warn(`User ${user.id} has no email address`);
      return;
    }

    // Format thời gian nhắc nhở theo giờ Việt Nam
    const reminderTime = new Date(reminderAt).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let itemContent = '';
    if (type === 'LINK' && url) {
      itemContent = `<p><strong>URL:</strong> <a href="${url}">${url}</a></p>`;
    } else if (type === 'NOTE' && content) {
      const truncatedContent =
        content.length > 200 ? content.substring(0, 200) + '...' : content;
      itemContent = `<div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0;">
        <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${truncatedContent}</pre>
      </div>`;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6b7fd7ff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background: #544cafff; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Lời Nhắc Từ PersonalCloud</h2>
          </div>
          <div class="content">
            <p>Xin chào ${user.name || 'bạn'},</p>
            <p>Đây là lời nhắc cho item của bạn:</p>
            
            <h3 style="color: #543de7ff; margin-top: 20px;">${title}</h3>
            
            ${description ? `<p><strong>Mô tả:</strong> ${description}</p>` : ''}
            ${itemContent}
            
            <p style="color: #888; font-size: 14px; margin-top: 20px;">
              <strong>Loại:</strong> ${type === 'FILE' ? 'Tệp' : type === 'LINK' ? 'Liên kết' : 'Ghi chú'}<br/>
              <strong>Thời gian nhắc:</strong> ${reminderTime}
            </p>
            
            <a href="${this.getItemUrl(item.id)}" class="btn">Xem chi tiết</a>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động từ PersonalCloud.</p>
            <p>&copy; 2025 PersonalCloud. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Lời nhắc: ${title}
${description ? `Mô tả: ${description}` : ''}
${type === 'LINK' && url ? `URL: ${url}` : ''}
${type === 'NOTE' && content ? `Nội dung: ${content.substring(0, 200)}...` : ''}

Xem chi tiết tại: ${this.getItemUrl(item.id)}
    `.trim();

    await this.mailService.sendMail({
      to: user.email,
      subject: `🔔 Lời nhắc: ${title}`,
      html,
      text,
    });
  }

  /**
   * Tạo URL để xem item (có thể customize theo frontend của bạn)
   */
  private getItemUrl(itemId: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/library?itemId=${itemId}`;
  }

  /**
   * Manual trigger để test
   */
  async sendReminderManually(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    await this.sendReminderEmail(item);
    this.logger.log(`Manually sent reminder for item ${itemId}`);
  }
}
