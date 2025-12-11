// Domain types matching backend schema

export interface User {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role: "USER" | "ADMIN";
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export type ItemType = "file" | "link" | "note";

export interface Item {
    id: string;
    userId: string;
    type: ItemType;
    fileId?: string;
    url?: string;
    title: string;
    description?: string;
    category?: string;
    project?: string;
    importance: "low" | "normal" | "high";
    isPinned: boolean;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    // Relations
    file?: File;
    tags?: Tag[];
    collections?: Collection[];
}

export interface File {
    id: string;
    userId: string;
    storageKey: string;
    originalName: string;
    mimeType: string;
    size: number;
    checksum?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tag {
    id: string;
    name: string;
    createdAt: string;
}

export interface Collection {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    slug?: string;
    createdAt: string;
    updatedAt: string;
    // Relations
    items?: Item[];
}

export interface SharedLink {
    id: string;
    userId: string;
    itemId: string;
    token: string;
    password?: string;
    expiresAt: string;
    createdAt: string;
    revoked: boolean;
    // Relations
    item?: Item;
}

export type SortField = "createdAt" | "updatedAt" | "title" | "size";
export type SortOrder = "asc" | "desc";

export interface QueryParams {
    search?: string;
    type?: ItemType;
    category?: string;
    project?: string;
    tags?: string[];
    sortBy?: SortField;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
