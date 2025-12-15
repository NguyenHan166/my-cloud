import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES, DEFAULT_JOB_OPTIONS } from './queue.constants';

// Job data types
export interface SendEmailJobData {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

export interface GenerateThumbnailJobData {
    fileId: string;
    storageKey: string;
    mimeType: string;
}

export interface CleanupJobData {
    daysOld?: number;
}

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);

    constructor(
        @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
        @InjectQueue(QUEUE_NAMES.FILE_PROCESSING) private readonly fileQueue: Queue,
        @InjectQueue(QUEUE_NAMES.CLEANUP) private readonly cleanupQueue: Queue,
    ) {
        this.logger.log('QueueService initialized with all queues');
    }

    /**
     * Add email job to queue
     */
    async addEmailJob(
        jobName: string,
        data: SendEmailJobData,
        options?: JobsOptions,
    ) {
        const job = await this.emailQueue.add(jobName, data, {
            ...DEFAULT_JOB_OPTIONS,
            ...options,
        });
        this.logger.debug(`Email job added: ${job.id} - ${jobName}`);
        return job;
    }

    /**
     * Queue a verification email
     */
    async sendVerificationEmail(to: string, token: string, name: string) {
        return this.addEmailJob(JOB_NAMES.SEND_VERIFICATION, {
            to,
            subject: 'Verify your email',
            template: 'verify-email',
            context: { token, name },
        });
    }

    /**
     * Queue a password reset email
     */
    async sendPasswordResetEmail(to: string, token: string, name: string) {
        return this.addEmailJob(JOB_NAMES.SEND_PASSWORD_RESET, {
            to,
            subject: 'Reset your password',
            template: 'reset-password',
            context: { token, name },
        });
    }

    /**
     * Add file processing job
     */
    async addFileProcessingJob(
        jobName: string,
        data: GenerateThumbnailJobData,
        options?: JobsOptions,
    ) {
        const job = await this.fileQueue.add(jobName, data, {
            ...DEFAULT_JOB_OPTIONS,
            ...options,
        });
        this.logger.debug(`File processing job added: ${job.id} - ${jobName}`);
        return job;
    }

    /**
     * Queue thumbnail generation
     */
    async generateThumbnail(fileId: string, storageKey: string, mimeType: string) {
        return this.addFileProcessingJob(JOB_NAMES.GENERATE_THUMBNAIL, {
            fileId,
            storageKey,
            mimeType,
        });
    }

    /**
     * Add cleanup job
     */
    async addCleanupJob(
        jobName: string,
        data: CleanupJobData = {},
        options?: JobsOptions,
    ) {
        const job = await this.cleanupQueue.add(jobName, data, {
            ...DEFAULT_JOB_OPTIONS,
            ...options,
        });
        this.logger.debug(`Cleanup job added: ${job.id} - ${jobName}`);
        return job;
    }

    /**
     * Schedule periodic cleanup of trashed items
     */
    async scheduleCleanupTrashedItems(cronExpression: string = '0 0 * * *') {
        // Run daily at midnight
        await this.cleanupQueue.add(
            JOB_NAMES.CLEANUP_TRASHED_ITEMS,
            { daysOld: 30 },
            {
                repeat: { pattern: cronExpression },
                ...DEFAULT_JOB_OPTIONS,
            },
        );
        this.logger.log(`Scheduled cleanup job: ${cronExpression}`);
    }

    /**
     * Get queue statistics
     */
    async getStats() {
        const [emailStats, fileStats, cleanupStats] = await Promise.all([
            this.getQueueStats(this.emailQueue),
            this.getQueueStats(this.fileQueue),
            this.getQueueStats(this.cleanupQueue),
        ]);

        return {
            email: emailStats,
            fileProcessing: fileStats,
            cleanup: cleanupStats,
        };
    }

    private async getQueueStats(queue: Queue) {
        const [waiting, active, completed, failed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
        ]);

        return { waiting, active, completed, failed };
    }
}
