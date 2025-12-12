// Item types matching backend DTOs

export type ItemType = "FILE" | "LINK" | "NOTE";

export type Importance = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// File within an item
export interface ItemFile {
    id: string;
    itemId: string;
    fileId: string;
    isPrimary: boolean;
    position: number;
    createdAt: string;
    // Nested file object from backend
    file?: {
        id: string;
        userId: string;
        storageKey: string;
        originalName: string;
        mimeType: string;
        size: number;
        checkSum?: string;
        createdAt: string;
        updatedAt: string;
        url: string;
    };
    // Flattened fields for convenience (from service transformation)
    url?: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
}

// Tag
export interface Tag {
    id: string;
    userId: string;
    name: string;
    color?: string;
    createdAt: string;
    updatedAt: string;
}

// Item-Tag junction
export interface ItemTag {
    itemId: string;
    tagId: string;
    tag: Tag;
}

// Main Item interface
export interface Item {
    id: string;
    userId: string;
    type: ItemType;
    title: string;
    description?: string;
    category?: string;
    project?: string;
    importance: Importance;
    isPinned: boolean;
    url?: string; // For LINK type
    domain?: string; // Extracted from URL
    content?: string; // For NOTE type
    tagsText?: string; // For search
    files: ItemFile[];
    itemTags: ItemTag[];
    createdAt: string;
    updatedAt: string;
}

// API Request/Response types
export interface CreateItemDto {
    type: ItemType;
    title: string;
    url?: string; // Required if type === LINK
    content?: string; // Required if type === NOTE
    description?: string;
    category?: string;
    project?: string;
    importance?: Importance;
    tagIds?: string[];
    newTags?: NewTagDto[];
}

export interface NewTagDto {
    name: string;
    color?: string;
}

export interface UpdateItemDto {
    title?: string;
    description?: string;
    category?: string;
    project?: string;
    importance?: Importance;
    tagIds?: string[];
    newTags?: NewTagDto[];
    removeFileIds?: string[]; // File IDs to remove
    url?: string; // For LINK type
    content?: string; // For NOTE type
}

export interface QueryItemsDto {
    type?: ItemType;
    category?: string;
    project?: string;
    domain?: string;
    importance?: Importance;
    isPinned?: boolean;
    tagIds?: string[];
    search?: string;
    sortBy?: "createdAt" | "updatedAt" | "title" | "importance";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}

export interface ItemResponse {
    success: boolean;
    data: {
        item: Item;
        message?: string;
    };
    timestamp: string;
}

export interface ItemsListResponse {
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

export interface MessageResponse {
    success: boolean;
    data: {
        message: string;
    };
    timestamp: string;
}

// Tag API types
export interface CreateTagDto {
    name: string;
    color?: string;
}

export interface UpdateTagDto {
    name?: string;
    color?: string;
}
