import apiClient from "../client";

export interface StorageUsage {
    usedStorageBytes: number;
    maxStorageBytes: number;
    usedPercentage: number;
    itemCount: number;
    collectionCount: number;
    formattedUsed: string;
    formattedMax: string;
}

export interface StorageUsageResponse {
    success: boolean;
    data: StorageUsage;
    timestamp: string;
}

export const storageApi = {
    /**
     * Get current user's storage usage
     */
    async getUsage(): Promise<StorageUsageResponse> {
        const response =
            await apiClient.get<StorageUsageResponse>("/users/me/storage");
        return response.data;
    },
};
