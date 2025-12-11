import apiClient from "../client";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    MessageResponse,
    RefreshTokenResponse,
    VerifyOtpRequest,
    ResendOtpRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from "@/types/api";
import type { User } from "@/types/domain";

export const authApi = {
    /**
     * Login user and get tokens
     */
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>(
            "/auth/login",
            data
        );
        return response.data;
    },

    /**
     * Register new user
     */
    async register(data: RegisterRequest): Promise<MessageResponse> {
        const response = await apiClient.post<MessageResponse>(
            "/auth/register",
            data
        );
        return response.data;
    },

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        const response = await apiClient.post<RefreshTokenResponse>(
            "/auth/refresh",
            { refreshToken }
        );
        return response.data;
    },

    /**
     * Logout user (revoke tokens)
     */
    async logout(): Promise<MessageResponse> {
        const response = await apiClient.post<MessageResponse>("/auth/logout");
        return response.data;
    },

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<{
        success: boolean;
        data: User;
        timestamp: string;
    }> {
        const response = await apiClient.get<{
            success: boolean;
            data: User;
            timestamp: string;
        }>("/users/me");
        return response.data;
    },

    /**
     * Verify email with OTP code
     */
    async verifyOtp(data: VerifyOtpRequest): Promise<MessageResponse> {
        const response = await apiClient.post<MessageResponse>(
            "/auth/verify-otp",
            data
        );
        return response.data;
    },

    /**
     * Resend OTP code to email
     */
    async resendOtp(data: ResendOtpRequest): Promise<MessageResponse> {
        const response = await apiClient.post<MessageResponse>(
            "/auth/resend-otp",
            data
        );
        return response.data;
    },

    /**
     * Request password reset OTP
     */
    async forgotPassword(
        data: ForgotPasswordRequest
    ): Promise<MessageResponse> {
        const response = await apiClient.post<MessageResponse>(
            "/auth/forgot-password",
            data
        );
        return response.data;
    },

    /**
     * Reset password with OTP token
     */
    async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
        const response = await apiClient.post<MessageResponse>(
            "/auth/reset-password",
            data
        );
        return response.data;
    },
};
