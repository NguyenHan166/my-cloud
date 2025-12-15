import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from './queue.constants';
import { EmailProcessor } from './processors/email.processor';
import { FileProcessingProcessor } from './processors/file-processing.processor';
import { CleanupProcessor } from './processors/cleanup.processor';
import { QueueService } from './queue.service';

@Global()
@Module({
    imports: [
        // Configure BullMQ with Redis connection
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('redis.host') || 'localhost',
                    port: configService.get<number>('redis.port') || 6379,
                    password: configService.get<string>('redis.password'),
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                    removeOnComplete: 100,
                    removeOnFail: 50,
                },
            }),
        }),
        // Register individual queues
        BullModule.registerQueue(
            { name: QUEUE_NAMES.EMAIL },
            { name: QUEUE_NAMES.FILE_PROCESSING },
            { name: QUEUE_NAMES.CLEANUP },
        ),
    ],
    providers: [
        QueueService,
        EmailProcessor,
        FileProcessingProcessor,
        CleanupProcessor,
    ],
    exports: [QueueService, BullModule],
})
export class QueueModule { }
