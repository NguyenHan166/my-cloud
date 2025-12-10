import apiClient from "../client";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    RefreshTokenResponse,
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
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await apiClient.post<RegisterResponse>(
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
    async logout(): Promise<void> {
        await apiClient.post("/auth/logout");
    },

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>("/auth/me");
        return response.data;
    },

    /**
     * Request password reset
     */
    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await apiClient.post("/auth/forgot-password", {
            email,
        });
        return response.data;
    },

    /**
     * Reset password with token
     */
    async resetPassword(
        token: string,
        password: string
    ): Promise<{ message: string }> {
        const response = await apiClient.post("/auth/reset-password", {
            token,
            password,
        });
        return response.data;
    },
};
