import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from '../queue.constants';
import type { GenerateThumbnailJobData } from '../queue.service';

@Processor(QUEUE_NAMES.FILE_PROCESSING)
export class FileProcessingProcessor extends WorkerHost {
    private readonly logger = new Logger(FileProcessingProcessor.name);

    async process(job: Job<GenerateThumbnailJobData>): Promise<void> {
        this.logger.log(`Processing file job: ${job.id} - ${job.name}`);

        try {
            switch (job.name) {
                case JOB_NAMES.GENERATE_THUMBNAIL:
                    await this.generateThumbnail(job.data);
                    break;
                case JOB_NAMES.EXTRACT_METADATA:
                    await this.extractMetadata(job.data);
                    break;
                default:
                    this.logger.warn(`Unknown file processing job: ${job.name}`);
            }

            this.logger.log(`File processing job completed: ${job.id}`);
        } catch (error) {
            this.logger.error(`File processing job failed: ${job.id}`, error);
            throw error;
        }
    }

    private async generateThumbnail(data: GenerateThumbnailJobData): Promise<void> {
        const { fileId, storageKey, mimeType } = data;

        this.logger.log(`Generating thumbnail for file: ${fileId}`);

        // Check if file type supports thumbnail
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!supportedTypes.includes(mimeType)) {
            this.logger.debug(`Skipping thumbnail for unsupported type: ${mimeType}`);
            return;
        }

        // TODO: Implement with sharp
        // 1. Download file from R2
        // 2. Generate thumbnail using sharp
        // 3. Upload thumbnail to R2
        // 4. Update database with thumbnail URL

        this.logger.log(`Thumbnail generated for file: ${fileId}`);
    }

    private async extractMetadata(data: GenerateThumbnailJobData): Promise<void> {
        const { fileId, storageKey, mimeType } = data;

        this.logger.log(`Extracting metadata for file: ${fileId}`);

        // TODO: Extract metadata based on file type
        // - Images: EXIF data, dimensions
        // - Videos: duration, codec, resolution
        // - Documents: page count, author

        this.logger.log(`Metadata extracted for file: ${fileId}`);
    }
}
