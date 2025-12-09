// API DTOs and request/response types
import type { ItemType, Importance, SortField, SortOrder } from './domain';

// Backend pagination response format
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// New tag inline creation
export interface NewTagPayload {
  name: string;
  color?: string;
}

// Tags
export interface CreateTagPayload {
  name: string;
  color?: string;
}

export interface UpdateTagPayload {
  name?: string;
  color?: string;
}

// Items / Library
export interface ListItemsParams {
  page?: number;
  limit?: number;
  type?: ItemType;
  category?: string;
  project?: string;
  domain?: string;
  tagIds?: string[];
  importance?: Importance;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  isPinned?: boolean;
}

export interface CreateItemPayload {
  type: ItemType;
  title: string;
  description?: string;
  category?: string;
  project?: string;
  importance?: Importance;
  tagIds?: string[];
  newTags?: NewTagPayload[];
  // For LINK
  url?: string;
  // For NOTE
  content?: string;
}

export interface UpdateItemPayload {
  title?: string;
  description?: string;
  category?: string;
  project?: string;
  importance?: Importance;
  tagIds?: string[];
  newTags?: NewTagPayload[];
  url?: string;
  content?: string;
  // For FILE type - IDs of files to remove
  removeFileIds?: string[];
}

// Collections
export interface ListCollectionsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
}

// Shared Links
export interface CreateSharedLinkPayload {
  itemId: string;
  expiresIn: number; // hours
  password?: string;
}

// Files / Upload
export interface UploadResult {
  key: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

// AI
export interface AiSuggestTagsResponse {
  tags: string[];
}

export interface AiSummarizeResponse {
  summary: string;
}

export interface AiSearchParams {
  query: string;
  limit?: number;
}

export interface AiSearchResult {
  itemId: string;
  score: number;
  highlight?: string;
}
