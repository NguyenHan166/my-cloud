import { ItemType, Importance } from '@prisma/client';

export interface ItemFilter {
    userId: string;
    type?: ItemType;
    category?: string;
    project?: string;
    domain?: string;
    importance?: Importance;
    isPinned?: boolean;
    tagIds?: string[];
    search?: string;
}

export interface ItemSort {
    field: 'createdAt' | 'updatedAt' | 'title' | 'importance';
    order: 'asc' | 'desc';
}
