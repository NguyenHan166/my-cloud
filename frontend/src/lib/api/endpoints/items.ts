import apiClient from "../client";
import type {
    Item,
    QueryItemsDto,
    CreateItemDto,
    UpdateItemDto,
    ItemResponse,
    ItemsListResponse,
    MessageResponse,
} from "@/types/item.types";

export const itemsApi = {
    /**
     * Get all items with optional filters and pagination
     */
    async getItems(params?: QueryItemsDto): Promise<ItemsListResponse> {
        // Convert tagIds array to comma-separated string for backend
        const queryParams = params
            ? {
                  ...params,
                  tagIds: params.tagIds?.join(",") || undefined,
              }
            : undefined;

        const response = await apiClient.get<ItemsListResponse>("/items", {
            params: queryParams,
        });
        return response.data;
    },

    /**
     * Get single item by ID
     */
    async getItem(id: string): Promise<Item> {
        const response = await apiClient.get<Item>(`/items/${id}`);
        return response.data;
    },

    /**
     * Create new item
     * For FILE type: send as multipart/form-data with files
     */
    async createItem(
        data: CreateItemDto,
        files?: File[]
    ): Promise<ItemResponse> {
        const formData = new FormData();

        // Add item data
        formData.append("type", data.type);
        formData.append("title", data.title);

        if (data.description) formData.append("description", data.description);
        if (data.category) formData.append("category", data.category);
        if (data.project) formData.append("project", data.project);
        if (data.importance) formData.append("importance", data.importance);
        if (data.url) formData.append("url", data.url);
        if (data.content) formData.append("content", data.content);

        // Add tag IDs
        if (data.tagIds && data.tagIds.length > 0) {
            data.tagIds.forEach((tagId) => {
                formData.append("tagIds[]", tagId);
            });
        }

        // Add new tags as JSON string
        if (data.newTags && data.newTags.length > 0) {
            formData.append("newTags", JSON.stringify(data.newTags));
        }

        // Add files
        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append("files", file);
            });
        }

        const response = await apiClient.post<ItemResponse>(
            "/items",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    /**
     * Update item
     * Can optionally add new files or remove existing ones
     */
    async updateItem(
        id: string,
        data: UpdateItemDto,
        newFiles?: File[]
    ): Promise<ItemResponse> {
        const formData = new FormData();

        if (data.title) formData.append("title", data.title);
        if (data.description !== undefined)
            formData.append("description", data.description);
        if (data.category !== undefined)
            formData.append("category", data.category);
        if (data.project !== undefined)
            formData.append("project", data.project);
        if (data.importance) formData.append("importance", data.importance);
        if (data.url !== undefined) formData.append("url", data.url);
        if (data.content !== undefined)
            formData.append("content", data.content);

        // Tag IDs
        if (data.tagIds && data.tagIds.length > 0) {
            data.tagIds.forEach((tagId) => {
                formData.append("tagIds[]", tagId);
            });
        }

        // New tags
        if (data.newTags && data.newTags.length > 0) {
            formData.append("newTags", JSON.stringify(data.newTags));
        }

        // Files to remove
        if (data.removeFileIds && data.removeFileIds.length > 0) {
            data.removeFileIds.forEach((fileId) => {
                formData.append("removeFileIds[]", fileId);
            });
        }

        // New files to add
        if (newFiles && newFiles.length > 0) {
            newFiles.forEach((file) => {
                formData.append("files", file);
            });
        }

        const response = await apiClient.patch<ItemResponse>(
            `/items/${id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    /**
     * Delete item
     */
    async deleteItem(id: string): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(
            `/items/${id}`
        );
        return response.data;
    },

    /**
     * Toggle pin status
     */
    async togglePin(id: string): Promise<ItemResponse> {
        const response = await apiClient.patch<ItemResponse>(
            `/items/${id}/pin`
        );
        return response.data;
    },

    /**
     * Set primary file for an item
     */
    async setPrimaryFile(itemId: string, fileId: string): Promise<Item> {
        const response = await apiClient.patch<Item>(
            `/items/${itemId}/files/${fileId}/primary`
        );
        return response.data;
    },

    /**
     * Reorder files in an item
     */
    async reorderFiles(itemId: string, fileIds: string[]): Promise<Item> {
        const response = await apiClient.patch<Item>(
            `/items/${itemId}/files/reorder`,
            { fileIds }
        );
        return response.data;
    },

    /**
     * Move item to trash (soft delete)
     */
    async moveToTrash(id: string): Promise<ItemResponse> {
        const response = await apiClient.patch<ItemResponse>(
            `/items/${id}/trash`
        );
        return response.data;
    },

    /**
     * Restore item from trash
     */
    async restoreFromTrash(id: string): Promise<ItemResponse> {
        const response = await apiClient.patch<ItemResponse>(
            `/items/${id}/restore`
        );
        return response.data;
    },

    /**
     * Get trash items
     */
    async getTrashedItems(params?: QueryItemsDto): Promise<ItemsListResponse> {
        const response = await apiClient.get<ItemsListResponse>(
            "/items/trash",
            { params }
        );
        return response.data;
    },

    /**
     * Permanently delete item
     */
    async permanentlyDeleteItem(id: string): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(
            `/items/trash/${id}`
        );
        return response.data;
    },

    /**
     * Empty trash
     */
    async emptyTrash(): Promise<{
        success: boolean;
        data: { message: string; count: number };
        timestamp: string;
    }> {
        const response = await apiClient.delete<{
            success: boolean;
            data: { message: string; count: number };
            timestamp: string;
        }>("/items/trash");
        return response.data;
    },
};
