import apiClient from "../client";
import type { Item, QueryParams } from "@/types/domain";
import type {
    CreateItemRequest,
    UpdateItemRequest,
    PaginatedResponse,
} from "@/types/api";

export const itemsApi = {
    /**
     * Get all items with optional filters
     */
    async getItems(params?: QueryParams): Promise<PaginatedResponse<Item>> {
        const response = await apiClient.get<PaginatedResponse<Item>>(
            "/items",
            { params }
        );
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
     */
    async createItem(data: CreateItemRequest): Promise<Item> {
        const response = await apiClient.post<Item>("/items", data);
        return response.data;
    },

    /**
     * Update item
     */
    async updateItem(id: string, data: UpdateItemRequest): Promise<Item> {
        const response = await apiClient.patch<Item>(`/items/${id}`, data);
        return response.data;
    },

    /**
     * Delete item
     */
    async deleteItem(id: string): Promise<void> {
        await apiClient.delete(`/items/${id}`);
    },

    /**
     * Search items with AI semantic search
     */
    async searchItems(query: string): Promise<Item[]> {
        const response = await apiClient.get<Item[]>("/items/search", {
            params: { q: query },
        });
        return response.data;
    },
};
