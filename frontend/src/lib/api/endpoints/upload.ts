import apiClient from "../client";

export interface UploadAvatarResponse {
    success: boolean;
    data: {
        message: string;
        avatar: string;
    };
    timestamp: string;
}

export const uploadApi = {
    /**
     * Upload avatar image for current user
     */
    async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<UploadAvatarResponse>(
            "/upload/avatar",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },
};
