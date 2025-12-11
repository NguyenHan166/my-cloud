import apiClient from "../client";
import type { User } from "@/types/domain";

export interface UpdateProfileRequest {
    name?: string;
    phone?: string;
    password?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    data: {
        message: string;
        user: User;
    };
    timestamp: string;
}

export interface UserResponse {
    success: boolean;
    data: User;
    timestamp: string;
}

export const usersApi = {
    /**
     * Get current user profile
     */
    async getProfile(): Promise<UserResponse> {
        const response = await apiClient.get<UserResponse>("/users/me");
        return response.data;
    },

    /**
     * Update current user profile (name, phone, password)
     */
    async updateProfile(
        data: UpdateProfileRequest
    ): Promise<UpdateProfileResponse> {
        const response = await apiClient.patch<UpdateProfileResponse>(
            "/users/me",
            data
        );
        return response.data;
    },

    /**
     * Change password (convenience method)
     */
    async changePassword(newPassword: string): Promise<UpdateProfileResponse> {
        return this.updateProfile({ password: newPassword });
    },
};
