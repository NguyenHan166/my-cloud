import apiClient from "../client";
import type { UploadFileResponse } from "@/types/api";

export const filesApi = {
    /**
     * Upload file to storage
     */
    async uploadFile(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<UploadFileResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<UploadFileResponse>(
            "/files/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(progress);
                    }
                },
            }
        );

        return response.data;
    },

    /**
     * Get download URL for file
     */
    async getDownloadUrl(fileId: string): Promise<{ url: string }> {
        const response = await apiClient.get(`/files/${fileId}/download`);
        return response.data;
    },

    /**
     * Delete file
     */
    async deleteFile(fileId: string): Promise<void> {
        await apiClient.delete(`/files/${fileId}`);
    },
};
