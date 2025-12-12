// Collection types matching backend DTOs

import type { Item } from "./item.types";

// Main Collection interface
export interface Collection {
    id: string;
    userId: string;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
    slugPublic?: string;
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
    // Included relations
    parent?: {
        id: string;
        name: string;
    } | null;
    _count?: {
        items: number;
        children: number;
    };
}

// Breadcrumb item
export interface BreadcrumbItem {
    id: string;
    name: string;
}

// Query parameters
export interface QueryCollectionsDto {
    search?: string;
    isPublic?: boolean;
    parentId?: string; // 'root' for root collections, or collection ID
    sortBy?: "name" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

// Create collection
export interface CreateCollectionDto {
    name: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
    slugPublic?: string;
    parentId?: string;
}

// Update collection
export interface UpdateCollectionDto {
    name?: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
    slugPublic?: string;
    parentId?: string | null;
}

// Move collection
export interface MoveCollectionDto {
    parentId?: string | null;
}

// Add/Remove items
export interface CollectionItemsDto {
    itemIds: string[];
}

// API Response types
export interface CollectionResponse {
    success: boolean;
    data: Collection;
    timestamp: string;
}

export interface CollectionsListResponse {
    success: boolean;
    data: {
        data: Collection[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    timestamp: string;
}

export interface CollectionItemsResponse {
    success: boolean;
    data: {
        data: Item[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    timestamp: string;
}

export interface BreadcrumbResponse {
    success: boolean;
    data: BreadcrumbItem[];
    timestamp: string;
}

export interface AddItemsResponse {
    success: boolean;
    data: {
        message: string;
        addedCount: number;
    };
    timestamp: string;
}

export interface RemoveItemsResponse {
    success: boolean;
    data: {
        message: string;
        removedCount: number;
    };
    timestamp: string;
}

export interface MessageResponse {
    success: boolean;
    data: {
        message: string;
    };
    timestamp: string;
}
