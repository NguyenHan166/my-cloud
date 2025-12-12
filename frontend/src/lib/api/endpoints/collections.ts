import apiClient from "../client";
import type {
    Collection,
    QueryCollectionsDto,
    CreateCollectionDto,
    UpdateCollectionDto,
    MoveCollectionDto,
    CollectionItemsDto,
    CollectionResponse,
    CollectionsListResponse,
    CollectionItemsResponse,
    BreadcrumbItem,
    AddItemsResponse,
    RemoveItemsResponse,
    MessageResponse,
} from "@/types/collection.types";

export const collectionsApi = {
    /**
     * Get all collections with optional filters and pagination
     */
    async getAll(
        params?: QueryCollectionsDto
    ): Promise<CollectionsListResponse> {
        const response = await apiClient.get<CollectionsListResponse>(
            "/collections",
            { params }
        );
        return response.data;
    },

    /**
     * Get single collection by ID
     */
    async getById(id: string): Promise<Collection> {
        const response = await apiClient.get<Collection>(`/collections/${id}`);
        return response.data;
    },

    /**
     * Get child collections of a collection
     */
    async getChildren(
        id: string,
        page: number = 1,
        limit: number = 20
    ): Promise<CollectionsListResponse> {
        const response = await apiClient.get<CollectionsListResponse>(
            `/collections/${id}/children`,
            { params: { page, limit } }
        );
        return response.data;
    },

    /**
     * Get breadcrumb path from root to collection
     */
    async getBreadcrumb(id: string): Promise<BreadcrumbItem[]> {
        const response = await apiClient.get<BreadcrumbItem[]>(
            `/collections/${id}/breadcrumb`
        );
        return response.data;
    },

    /**
     * Create new collection
     */
    async create(data: CreateCollectionDto): Promise<CollectionResponse> {
        const response = await apiClient.post<CollectionResponse>(
            "/collections",
            data
        );
        return response.data;
    },

    /**
     * Update collection
     */
    async update(
        id: string,
        data: UpdateCollectionDto
    ): Promise<CollectionResponse> {
        const response = await apiClient.patch<CollectionResponse>(
            `/collections/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Move collection to new parent
     */
    async move(
        id: string,
        data: MoveCollectionDto
    ): Promise<CollectionResponse> {
        const response = await apiClient.patch<CollectionResponse>(
            `/collections/${id}/move`,
            data
        );
        return response.data;
    },

    /**
     * Delete collection (and all sub-collections)
     */
    async delete(id: string): Promise<MessageResponse> {
        const response = await apiClient.delete<MessageResponse>(
            `/collections/${id}`
        );
        return response.data;
    },

    /**
     * Add items to collection
     */
    async addItems(
        id: string,
        data: CollectionItemsDto
    ): Promise<AddItemsResponse> {
        const response = await apiClient.post<AddItemsResponse>(
            `/collections/${id}/items`,
            data
        );
        return response.data;
    },

    /**
     * Remove items from collection
     */
    async removeItems(
        id: string,
        data: CollectionItemsDto
    ): Promise<RemoveItemsResponse> {
        const response = await apiClient.delete<RemoveItemsResponse>(
            `/collections/${id}/items`,
            { data }
        );
        return response.data;
    },

    /**
     * Get items in collection with pagination
     */
    async getItems(
        id: string,
        page: number = 1,
        limit: number = 20
    ): Promise<CollectionItemsResponse> {
        const response = await apiClient.get<CollectionItemsResponse>(
            `/collections/${id}/items`,
            { params: { page, limit } }
        );
        return response.data;
    },
};

export type { Collection, BreadcrumbItem };
