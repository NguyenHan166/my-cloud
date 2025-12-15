import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import type { SendEmailJobData } from '../queue.service';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);

    async process(job: Job<SendEmailJobData>): Promise<void> {
        this.logger.log(`Processing email job: ${job.id} - ${job.name}`);

        const { to, subject, template, context } = job.data;

        try {
            switch (job.name) {
                case JOB_NAMES.SEND_VERIFICATION:
                    await this.sendVerificationEmail(to, context);
                    break;
                case JOB_NAMES.SEND_PASSWORD_RESET:
                    await this.sendPasswordResetEmail(to, context);
                    break;
                case JOB_NAMES.SEND_NOTIFICATION:
                    await this.sendNotificationEmail(to, subject, context);
                    break;
                default:
                    this.logger.warn(`Unknown email job: ${job.name}`);
            }

            this.logger.log(`Email job completed: ${job.id}`);
        } catch (error) {
            this.logger.error(`Email job failed: ${job.id}`, error);
            throw error; // Re-throw to trigger retry
        }
    }

    private async sendVerificationEmail(
        to: string,
        context: Record<string, any>,
    ): Promise<void> {
        // TODO: Integrate with MailService
        this.logger.log(`Sending verification email to ${to}`);
        // For now, just log - will integrate with existing MailService
    }

    private async sendPasswordResetEmail(
        to: string,
        context: Record<string, any>,
    ): Promise<void> {
        // TODO: Integrate with MailService
        this.logger.log(`Sending password reset email to ${to}`);
    }

    private async sendNotificationEmail(
        to: string,
        subject: string,
        context: Record<string, any>,
    ): Promise<void> {
        // TODO: Integrate with MailService
        this.logger.log(`Sending notification email to ${to}: ${subject}`);
    }
}
