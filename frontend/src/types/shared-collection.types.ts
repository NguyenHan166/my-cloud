// Shared Collections types matching backend DTOs

export type CollectionPermission = "VIEW" | "EDIT";

export interface UserBasic {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
}

export interface CollectionBasic {
    id: string;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CollectionShare {
    id: string;
    collectionId: string;
    userId: string;
    permission: CollectionPermission;
    sharedById?: string;
    invitedAt: string;
    acceptedAt?: string;
    revokedAt?: string;
    sharedBy?: UserBasic;
    user: UserBasic;
}

export interface SharedCollection {
    id: string;
    permission: CollectionPermission;
    invitedAt: string;
    acceptedAt?: string;
    collection: CollectionBasic;
    sharedBy?: UserBasic;
}

// Request DTOs
export interface CreateShareDto {
    userEmail: string;
    permission: CollectionPermission;
}

export interface UpdateShareDto {
    permission: CollectionPermission;
}

// Response types
export interface CollectionShareResponse {
    success: boolean;
    data: CollectionShare;
    timestamp: string;
}

export interface CollectionSharesListResponse {
    success: boolean;
    data: CollectionShare[];
    timestamp: string;
}

export interface SharedCollectionsListResponse {
    success: boolean;
    data: SharedCollection[];
    timestamp: string;
}

export interface UserPermissionResponse {
    success: boolean;
    data: {
        permission: "owner" | "edit" | "view" | null;
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
