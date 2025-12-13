// Shared Links DTOs - matching backend response types

/**
 * Public file DTO (sanitized for public access)
 */
export interface PublicItemFile {
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    isPrimary: boolean;
}

/**
 * Public tag DTO (sanitized for public access)
 */
export interface PublicItemTag {
    name: string;
    color: string;
}

/**
 * Public item DTO (sanitized - no sensitive fields)
 */
export interface PublicItem {
    title: string;
    description?: string;
    type: "FILE" | "LINK" | "NOTE";
    url?: string;
    content?: string;
    category?: string;
    project?: string;
    importance: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    domain?: string;
    files: PublicItemFile[];
    tags: PublicItemTag[];
}

/**
 * Minimal item info for share link creation
 */
export interface SharedLinkItem {
    id: string;
    title: string;
    type: string;
}

/**
 * Share link response (for authenticated users)
 */
export interface SharedLink {
    id: string;
    token: string;
    url: string;
    expiresAt: string;
    revoked?: boolean;
    hasPassword: boolean;
    accessCount?: number;
    isExpired?: boolean;
    item: SharedLinkItem;
    createdAt: string;
}

/**
 * Public access response
 */
export interface AccessSharedLinkResponse {
    item: PublicItem;
    link: {
        expiresAt: string;
        accessCount: number;
    };
}

/**
 * Create share link request
 */
export interface CreateSharedLinkRequest {
    itemId: string;
    expiresIn: number; // hours
    password?: string;
}

/**
 * Query shared links request
 */
export interface QuerySharedLinksParams {
    itemId?: string;
    revoked?: boolean;
    page?: number;
    limit?: number;
}

/**
 * Access shared link request
 */
export interface AccessSharedLinkRequest {
    password?: string;
}
