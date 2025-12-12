import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ItemsService } from './items.service';

@Injectable()
export class TrashCleanupService {
  private readonly logger = new Logger(TrashCleanupService.name);

  constructor(private readonly itemsService: ItemsService) {}

  /**
   * Scheduled task to cleanup expired trash items
   * Runs daily at midnight (00:00)
   * Items in trash for more than 30 days will be permanently deleted
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleTrashCleanup() {
    this.logger.log('Starting scheduled trash cleanup...');

    try {
      const result = await this.itemsService.cleanupExpiredTrash();
      this.logger.log(
        `Trash cleanup completed. Deleted ${result.deletedCount} expired items.`,
      );
    } catch (error) {
      this.logger.error('Trash cleanup failed:', error);
    }
  }
}
