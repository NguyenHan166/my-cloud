import { diskStorage, memoryStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Temp directory for large file uploads
const TEMP_DIR = join(process.cwd(), 'temp-uploads');

// Threshold for using disk storage (5MB)
export const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

/**
 * Ensure temp directory exists
 */
function ensureTempDir(): void {
    if (!existsSync(TEMP_DIR)) {
        mkdirSync(TEMP_DIR, { recursive: true });
    }
}

/**
 * Disk storage configuration for large files
 * Files are stored temporarily on disk before streaming to R2
 */
export const diskStorageConfig = diskStorage({
    destination: (_req, _file, cb) => {
        ensureTempDir();
        cb(null, TEMP_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = file.originalname.split('.').pop() || '';
        const filename = `${uuidv4()}.${ext}`;
        cb(null, filename);
    },
});

/**
 * Memory storage configuration for small files
 */
export const memoryStorageConfig = memoryStorage();

/**
 * Get temp directory path
 */
export function getTempDir(): string {
    return TEMP_DIR;
}
