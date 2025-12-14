import apiClient from "../client";
import type {
    CreateShareDto,
    UpdateShareDto,
    CollectionShare,
    SharedCollection,
    CollectionShareResponse,
    CollectionSharesListResponse,
    SharedCollectionsListResponse,
    UserPermissionResponse,
    MessageResponse,
} from "@/types/shared-collection.types";

export const sharedCollectionsApi = {
    /**
     * Share a collection with another user (owner only)
     */
    async shareCollection(
        collectionId: string,
        data: CreateShareDto
    ): Promise<CollectionShare> {
        const response = await apiClient.post<CollectionShareResponse>(
            `/shared-collections/collections/${collectionId}/shares`,
            data
        );
        return response.data.data;
    },

    /**
     * Get all shares for a collection (owner only)
     */
    async getCollectionShares(
        collectionId: string
    ): Promise<CollectionShare[]> {
        const response = await apiClient.get<CollectionSharesListResponse>(
            `/shared-collections/collections/${collectionId}/shares`
        );
        return response.data.data;
    },

    /**
     * Update share permission (owner only)
     */
    async updateSharePermission(
        collectionId: string,
        shareId: string,
        data: UpdateShareDto
    ): Promise<CollectionShare> {
        const response = await apiClient.patch<CollectionShareResponse>(
            `/shared-collections/collections/${collectionId}/shares/${shareId}`,
            data
        );
        return response.data.data;
    },

    /**
     * Revoke share (soft delete, owner only)
     */
    async revokeShare(
        collectionId: string,
        shareId: string
    ): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(
            `/shared-collections/collections/${collectionId}/shares/${shareId}/revoke`
        );
        return response.data;
    },

    /**
     * Delete share permanently (owner only)
     */
    async deleteShare(
        collectionId: string,
        shareId: string
    ): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(
            `/shared-collections/collections/${collectionId}/shares/${shareId}`
        );
        return response.data;
    },

    /**
     * Get all collections shared with current user
     */
    async getSharedWithMe(): Promise<SharedCollection[]> {
        const response = await apiClient.get<SharedCollectionsListResponse>(
            `/shared-collections/shared-with-me`
        );
        return response.data.data;
    },

    /**
     * Get collections owned by user that have active shares
     */
    async getMySharedCollections(): Promise<any[]> {
        const response = await apiClient.get<any>(
            `/shared-collections/my-shared-collections`
        );
        return response.data;
    },

    /**
     * Get current user's permission for a collection
     */
    async getUserPermission(
        collectionId: string
    ): Promise<"owner" | "edit" | "view" | null> {
        const response = await apiClient.get<UserPermissionResponse>(
            `/shared-collections/collections/${collectionId}/permission`
        );
        return response.data.data.permission;
    },
};

export type { CollectionShare, SharedCollection };
