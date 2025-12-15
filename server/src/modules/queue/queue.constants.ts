// Queue names used across the application
export const QUEUE_NAMES = {
    EMAIL: 'email',
    FILE_PROCESSING: 'file-processing',
    CLEANUP: 'cleanup',
} as const;

// Job names for each queue
export const JOB_NAMES = {
    // Email jobs
    SEND_VERIFICATION: 'send-verification',
    SEND_PASSWORD_RESET: 'send-password-reset',
    SEND_NOTIFICATION: 'send-notification',

    // File processing jobs
    GENERATE_THUMBNAIL: 'generate-thumbnail',
    EXTRACT_METADATA: 'extract-metadata',

    // Cleanup jobs
    CLEANUP_TRASHED_ITEMS: 'cleanup-trashed-items',
    CLEANUP_EXPIRED_LINKS: 'cleanup-expired-links',
} as const;

// Default job options
export const DEFAULT_JOB_OPTIONS = {
    attempts: 3,
    backoff: {
        type: 'exponential' as const,
        delay: 1000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
};
