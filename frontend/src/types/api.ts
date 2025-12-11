// API request and response types
import type { User } from "./domain";

// =====================
// Auth Request DTOs
// =====================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string; // 8 digits
}

export interface ResendOtpRequest {
    email: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string; // OTP code
    newPassword: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// =====================
// Auth Response DTOs (matching backend)
// =====================

// Standard API response wrapper (from NestJS interceptor)
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    timestamp: string;
}

// Login response - { user, tokens }
export interface LoginResponseData {
    user: User;
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export type LoginResponse = ApiResponse<LoginResponseData>;

// Message response for register, verify, forgot, reset
export interface MessageResponseData {
    message: string;
}

export type MessageResponse = ApiResponse<MessageResponseData>;

// Refresh token response - just tokens
export interface RefreshTokenResponseData {
    accessToken: string;
    refreshToken: string;
}

export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;

// =====================
// Items DTOs
// =====================

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

// =====================
// Collection DTOs
// =====================

export interface CreateCollectionRequest {
    name: string;
    description?: string;
    isPublic?: boolean;
}

// =====================
// Shared Links DTOs
// =====================

export interface CreateSharedLinkRequest {
    itemId: string;
    expiresIn: number; // in hours
    password?: string;
}

// =====================
// File Upload DTOs
// =====================

export interface UploadFileResponse {
    fileId: string;
    storageKey: string;
    url: string;
}

// =====================
// Pagination
// =====================

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// =====================
// Error Response
// =====================

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}
