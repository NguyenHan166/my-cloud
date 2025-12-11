import apiClient from "../client";
import type { MessageResponse } from "@/types/api";

export interface Tag {
    id: string;
    name: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTagRequest {
    name: string;
    color?: string;
}

export interface UpdateTagRequest {
    name: string;
    color?: string;
}

export interface TagResponse {
    success: boolean;
    data: Tag;
    timestamp: string;
}

export interface TagWithMessageResponse {
    success: boolean;
    data: {
        message: string;
        tag: Tag;
    };
    timestamp: string;
}

export interface TagsListResponse {
    success: boolean;
    data: Tag[];
    timestamp: string;
}

export const tagsApi = {
    /**
     * Get all tags for current user
     */
    async getAll(): Promise<TagsListResponse> {
        const response = await apiClient.get<TagsListResponse>("/tags");
        return response.data;
    },

    /**
     * Get tag by ID
     */
    async getById(id: string): Promise<TagResponse> {
        const response = await apiClient.get<TagResponse>(`/tags/${id}`);
        return response.data;
    },

    /**
     * Create new tag
     */
    async create(data: CreateTagRequest): Promise<TagWithMessageResponse> {
        const response = await apiClient.post<TagWithMessageResponse>(
            "/tags",
            data
        );
        return response.data;
    },

    /**
     * Update tag
     */
    async update(
        id: string,
        data: UpdateTagRequest
    ): Promise<TagWithMessageResponse> {
        const response = await apiClient.patch<TagWithMessageResponse>(
            `/tags/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Delete tag
     */
    async delete(id: string): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(`/tags/${id}`);
        return response.data;
    },
};
