import apiClient from "./client";
import { AxiosError } from "axios";

// ============ Types ============

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar: string | null;
    role: "ADMIN" | "USER";
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileData {
    name?: string;
    phone?: string;
    password?: string;
}

export interface UpdateProfileResponse {
    message: string;
    user: UserProfile;
}

// ============ Error Handling ============

const extractErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data;
        return data?.message || error.message || "Có lỗi xảy ra";
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Có lỗi xảy ra";
};

// ============ API Functions ============

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<UserProfile> => {
    try {
        const response = await apiClient.get<{
            success: boolean;
            data: UserProfile;
        }>("/users/me");
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Update current user profile
 */
export const updateProfile = async (
    data: UpdateProfileData
): Promise<UpdateProfileResponse> => {
    try {
        const response = await apiClient.patch<{
            success: boolean;
            data: UpdateProfileResponse;
        }>("/users/me", data);
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};
