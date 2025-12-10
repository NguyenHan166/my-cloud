/**
 * Format file size from bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const targetDate = typeof date === "string" ? new Date(date) : date;
    const diffInSeconds = Math.floor(
        (now.getTime() - targetDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000)
        return `${Math.floor(diffInSeconds / 2592000)} months ago`;

    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Format date to locale string (e.g., "Dec 11, 2025")
 */
export function formatDate(date: Date | string): string {
    const targetDate = typeof date === "string" ? new Date(date) : date;
    return targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Format date and time (e.g., "Dec 11, 2025 1:30 PM")
 */
export function formatDateTime(date: Date | string): string {
    const targetDate = typeof date === "string" ? new Date(date) : date;
    return targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Check if file is an image based on MIME type or extension
 */
export function isImageFile(mimeType?: string, filename?: string): boolean {
    if (mimeType) {
        return mimeType.startsWith("image/");
    }
    if (filename) {
        const ext = getFileExtension(filename);
        return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
            ext
        );
    }
    return false;
}

/**
 * Check if file is a video
 */
export function isVideoFile(mimeType?: string, filename?: string): boolean {
    if (mimeType) {
        return mimeType.startsWith("video/");
    }
    if (filename) {
        const ext = getFileExtension(filename);
        return ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext);
    }
    return false;
}

/**
 * Check if file is a PDF
 */
export function isPDFFile(mimeType?: string, filename?: string): boolean {
    if (mimeType) {
        return mimeType === "application/pdf";
    }
    if (filename) {
        return getFileExtension(filename) === "pdf";
    }
    return false;
}
