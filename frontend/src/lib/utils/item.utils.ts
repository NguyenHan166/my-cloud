import type { ItemType, Importance } from "@/types/item.types";
import {
    FileText,
    Link as LinkIcon,
    StickyNote,
    FileImage,
    FileVideo,
    FileCode,
    File as FileIcon,
} from "lucide-react";

/**
 * Get icon component for item type
 */
export function getItemTypeIcon(type: ItemType) {
    switch (type) {
        case "FILE":
            return FileText;
        case "LINK":
            return LinkIcon;
        case "NOTE":
            return StickyNote;
        default:
            return FileText;
    }
}

/**
 * Get color classes for importance badge
 */
export function getImportanceBadgeColor(importance: Importance): string {
    switch (importance) {
        case "URGENT":
            return "bg-red-100 text-red-700 border-red-200";
        case "HIGH":
            return "bg-orange-100 text-orange-700 border-orange-200";
        case "MEDIUM":
            return "bg-blue-100 text-blue-700 border-blue-200";
        case "LOW":
            return "bg-gray-100 text-gray-700 border-gray-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get icon for file type based on MIME type
 */
export function getFileIcon(mimeType: string) {
    if (isImageFile(mimeType)) {
        return FileImage;
    }
    if (isVideoFile(mimeType)) {
        return FileVideo;
    }
    if (
        mimeType.includes("javascript") ||
        mimeType.includes("json") ||
        mimeType.includes("html") ||
        mimeType.includes("css") ||
        mimeType.includes("python") ||
        mimeType.includes("java")
    ) {
        return FileCode;
    }
    return FileIcon;
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
    return mimeType.startsWith("image/");
}

/**
 * Check if file is a video
 */
export function isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith("video/");
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
    return mimeType === "application/pdf";
}

/**
 * Get display name for importance
 */
export function getImportanceLabel(importance: Importance): string {
    switch (importance) {
        case "URGENT":
            return "Urgent";
        case "HIGH":
            return "High";
        case "MEDIUM":
            return "Medium";
        case "LOW":
            return "Low";
        default:
            return "Medium";
    }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}
