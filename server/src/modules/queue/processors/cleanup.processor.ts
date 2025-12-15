import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import type { CleanupJobData } from '../queue.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor(QUEUE_NAMES.CLEANUP)
export class CleanupProcessor extends WorkerHost {
    private readonly logger = new Logger(CleanupProcessor.name);

    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async process(job: Job<CleanupJobData>): Promise<void> {
        this.logger.log(`Processing cleanup job: ${job.id} - ${job.name}`);

        try {
            switch (job.name) {
                case JOB_NAMES.CLEANUP_TRASHED_ITEMS:
                    await this.cleanupTrashedItems(job.data);
                    break;
                case JOB_NAMES.CLEANUP_EXPIRED_LINKS:
                    await this.cleanupExpiredLinks();
                    break;
                default:
                    this.logger.warn(`Unknown cleanup job: ${job.name}`);
            }

            this.logger.log(`Cleanup job completed: ${job.id}`);
        } catch (error) {
            this.logger.error(`Cleanup job failed: ${job.id}`, error);
            throw error;
        }
    }

    /**
     * Permanently delete items that have been trashed for more than X days
     */
    private async cleanupTrashedItems(data: CleanupJobData): Promise<void> {
        const daysOld = data.daysOld || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        this.logger.log(`Cleaning up items trashed before ${cutoffDate.toISOString()}`);

        // Find items to delete
        const trashedItems = await this.prisma.item.findMany({
            where: {
                isTrashed: true,
                updatedAt: { lt: cutoffDate },
            },
            select: { id: true },
        });

        if (trashedItems.length === 0) {
            this.logger.log('No trashed items to clean up');
            return;
        }

        // Delete items (cascade will handle related records)
        const deleted = await this.prisma.item.deleteMany({
            where: {
                id: { in: trashedItems.map((item) => item.id) },
            },
        });

        this.logger.log(`Permanently deleted ${deleted.count} trashed items`);
    }

    /**
     * Delete expired shared links
     */
    private async cleanupExpiredLinks(): Promise<void> {
        const now = new Date();

        this.logger.log(`Cleaning up expired shared links`);

        const deleted = await this.prisma.sharedLink.deleteMany({
            where: {
                expiresAt: { lt: now },
            },
        });

        this.logger.log(`Deleted ${deleted.count} expired shared links`);
    }
}
