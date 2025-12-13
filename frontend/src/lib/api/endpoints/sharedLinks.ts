import apiClient from "../client";
import type {
    SharedLink,
    AccessSharedLinkResponse,
    CreateSharedLinkRequest,
    QuerySharedLinksParams,
    AccessSharedLinkRequest,
} from "@/types/sharedLink.types";

/**
 * Shared Links API endpoints
 */
export const sharedLinksApi = {
    /**
     * Create a share link for an item (authenticated)
     */
    async create(data: CreateSharedLinkRequest): Promise<SharedLink> {
        const response = await apiClient.post<any>("/shared-links", data);
        // Backend wraps: { success, data: SharedLink, timestamp }
        return response.data.data;
    },

    /**
     * Get user's share links (authenticated)
     */
    async getUserLinks(params?: QuerySharedLinksParams): Promise<any> {
        const response = await apiClient.get<any>("/shared-links", { params });
        // Backend returns { success, data: { data: [...], meta }, timestamp }
        // Return the whole response for consumer to extract
        return response.data;
    },

    /**
     * Revoke a share link (authenticated)
     */
    async revoke(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<any>(`/shared-links/${id}`);
        return response.data.data || response.data;
    },

    /**
     * Update a share link (authenticated)
     */
    async update(
        id: string,
        data: { expiresIn?: number; password?: string | null }
    ): Promise<any> {
        const response = await apiClient.patch<any>(
            `/shared-links/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Permanently delete a share link (authenticated)
     */
    async permanentlyDelete(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<any>(
            `/shared-links/${id}?permanent=true`
        );
        return response.data.data || response.data;
    },

    /**
     * Access a shared item via token (public - no auth required)
     */
    async access(
        token: string,
        data?: AccessSharedLinkRequest
    ): Promise<AccessSharedLinkResponse> {
        const response = await apiClient.get<any>(`/s/${token}`, {
            params: data?.password ? { password: data.password } : undefined,
        });
        // Backend wraps: { success, data: { item, link }, timestamp }
        return response.data.data;
    },

    /**
     * Verify password for protected link (public - no auth required)
     */
    async verifyPassword(
        token: string,
        password: string
    ): Promise<AccessSharedLinkResponse> {
        const response = await apiClient.post<any>(`/s/${token}/verify`, {
            password,
        });
        // Backend wraps: { success, data: { item, link }, timestamp }
        return response.data.data;
    },
};
