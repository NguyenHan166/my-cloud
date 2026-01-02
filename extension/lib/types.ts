/**
 * TypeScript types for PersonalCloud Extension
 * Matching frontend types for API compatibility
 */

// User types
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        user: User;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    };
    timestamp: string;
}

export interface RefreshTokenResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
    timestamp: string;
}

// Storage types
export interface StorageUsage {
    usedStorageBytes: number;
    maxStorageBytes: number;
    usedPercentage: number;
    itemCount: number;
    collectionCount: number;
    formattedUsed: string;
    formattedMax: string;
}

export interface StorageUsageResponse {
    success: boolean;
    data: StorageUsage;
    timestamp: string;
}

// Item types
export type ItemType = "FILE" | "LINK" | "NOTE" | "FOLDER";
export type ImportanceLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface FileInfo {
    id: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    isPrimary: boolean;
    order: number;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface Item {
    id: string;
    type: ItemType;
    title: string;
    description?: string;
    category?: string;
    project?: string;
    importance: ImportanceLevel;
    url?: string;
    content?: string;
    isPinned: boolean;
    isTrashed: boolean;
    reminderAt?: string;
    files: FileInfo[];
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateItemDto {
    type: ItemType;
    title: string;
    description?: string;
    category?: string;
    project?: string;
    importance?: ImportanceLevel;
    url?: string;
    content?: string;
    tagIds?: string[];
    newTags?: Array<{ name: string; color: string }>;
    reminderAt?: string;
}

export interface ItemResponse {
    success: boolean;
    data: Item;
    timestamp: string;
}

export interface ItemsListResponse {
    success: boolean;
    data: {
        items: Item[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    timestamp: string;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    status: number;
}
