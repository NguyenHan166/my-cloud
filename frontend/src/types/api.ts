// API request and response types
import type { User } from "./domain";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface RegisterResponse {
    message: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

export interface CreateItemRequest {
    type: "file" | "link" | "note";
    fileId?: string;
    url?: string;
    title: string;
    description?: string;
    category?: string;
    project?: string;
    importance?: "low" | "normal" | "high";
    tags?: string[];
    collectionIds?: string[];
}

export interface UpdateItemRequest {
    title?: string;
    description?: string;
    category?: string;
    project?: string;
    importance?: "low" | "normal" | "high";
    isPinned?: boolean;
    isPublic?: boolean;
    tags?: string[];
}

export interface CreateCollectionRequest {
    name: string;
    description?: string;
    isPublic?: boolean;
}

export interface CreateSharedLinkRequest {
    itemId: string;
    expiresIn: number; // in hours
    password?: string;
}

export interface UploadFileResponse {
    fileId: string;
    storageKey: string;
    url: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}
