import apiClient from "./client";
import { AxiosError } from "axios";

// ============ Types ============

export interface UploadResult {
    key: string;
    url: string;
    filename: string;
    mimetype: string;
    size: number;
}

export interface AvatarUploadResult {
    message: string;
    avatar: string;
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
 * Upload avatar for current user
 */
export const uploadAvatar = async (file: File): Promise<AvatarUploadResult> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<{
            success: boolean;
            data: AvatarUploadResult;
        }>("/upload/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Upload avatar for specific user (Admin only)
 */
export const uploadAvatarForUser = async (
    userId: string,
    file: File
): Promise<AvatarUploadResult> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.patch<{
            success: boolean;
            data: AvatarUploadResult;
        }>(`/upload/avatar/${userId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * General file upload
 */
export const uploadFile = async (file: File): Promise<UploadResult> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<{
            success: boolean;
            data: UploadResult;
        }>("/upload/file", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};
