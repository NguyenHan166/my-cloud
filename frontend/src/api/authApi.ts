import apiClient from "./client";
import { AxiosError } from "axios";

// ============ Types ============

export type UserRole = "ADMIN" | "USER";

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: UserRole;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    user: User;
    tokens: TokenPair;
}

export interface MessageResponse {
    message: string;
}

// ============ Request DTOs ============

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

// ============ Error Handling ============

export interface ApiErrorResponse {
    message: string;
    error?: string;
    statusCode?: number;
}

const extractErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiErrorResponse | undefined;
        return data?.message || error.message || "Có lỗi xảy ra";
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Có lỗi xảy ra";
};

// ============ API Functions ============

/**
 * Register a new user
 * After successful registration, user needs to verify email via link
 */
export const register = async (
    data: RegisterRequest
): Promise<MessageResponse> => {
    try {
        const response = await apiClient.post<MessageResponse>(
            "/auth/register",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Login with email and password
 * Returns user info and token pair
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    try {
        // Backend wraps response in { success, data, timestamp }
        const response = await apiClient.post<{
            success: boolean;
            data: AuthResponse;
        }>("/auth/login", data);
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
    refreshTokenValue: string
): Promise<TokenPair> => {
    try {
        const response = await apiClient.post<TokenPair>("/auth/refresh", {
            refreshToken: refreshTokenValue,
        });
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Verify email with 8-digit OTP
 */
export const verifyOtp = async (
    email: string,
    otp: string
): Promise<MessageResponse> => {
    try {
        const response = await apiClient.post<MessageResponse>(
            "/auth/verify-otp",
            { email, otp }
        );
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Resend OTP to email
 */
export const resendOtp = async (email: string): Promise<MessageResponse> => {
    try {
        const response = await apiClient.post<MessageResponse>(
            "/auth/resend-otp",
            { email }
        );
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Request password reset email
 */
export const forgotPassword = async (
    data: ForgotPasswordRequest
): Promise<MessageResponse> => {
    try {
        const response = await apiClient.post<MessageResponse>(
            "/auth/forgot-password",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Reset password with token from email link
 */
export const resetPassword = async (
    data: ResetPasswordRequest
): Promise<MessageResponse> => {
    try {
        const response = await apiClient.post<MessageResponse>(
            "/auth/reset-password",
            data
        );
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Logout current user
 * Requires authentication
 */
export const logout = async (): Promise<MessageResponse> => {
    try {
        const response = await apiClient.post<MessageResponse>("/auth/logout");
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

// ============ Token Storage Helpers ============

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (tokens: TokenPair): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const clearTokens = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasValidTokens = (): boolean => {
    return !!getAccessToken() && !!getRefreshToken();
};
