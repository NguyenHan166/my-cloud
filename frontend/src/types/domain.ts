// Domain types - matches BE schema

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string;
  itemCount: number;
  createdAt: string;
}

// Match BE enums (UPPER_CASE)
export type ItemType = 'FILE' | 'LINK' | 'NOTE';
export type Importance = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FileMeta {
  id: string;
  userId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  checkSum?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemTag {
  itemId: string;
  tagId: string;
  tag: Tag;
}

// ItemFile junction for multi-file support
export interface ItemFile {
  id: string;
  itemId: string;
  fileId: string;
  position: number;
  isPrimary: boolean;
  createdAt: string;
  file: FileMeta;
}

export interface CollectionSummary {
  id: string;
  name: string;
}

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
  tagsText?: string;
  createdAt: string;
  updatedAt: string;
  // For FILE type - now uses files array
  files?: ItemFile[];
  thumbnail?: string;
  thumbnailUrl?: string; // alias for backward compat
  // For LINK type
  url?: string;
  domain?: string;
  // For NOTE type
  content?: string;
  // Relations - backend returns itemTags
  itemTags: ItemTag[];
  // Computed from itemTags for backward compat
  tags?: Tag[];
  // Collections
  collections?: CollectionSummary[];
}

// Helper to get tags array from item
export function getTagsFromItem(item: Item): Tag[] {
  return item.itemTags?.map(it => it.tag) || [];
}

// Helper to get primary file from item
export function getPrimaryFile(item: Item): FileMeta | undefined {
  const primaryItemFile = item.files?.find(f => f.isPrimary);
  return primaryItemFile?.file || item.files?.[0]?.file;
}

// Helper to get all files from item
export function getFilesFromItem(item: Item): FileMeta[] {
  return item.files?.map(f => f.file) || [];
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  slugPublic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedLink {
  id: string;
  userId: string;
  itemId: string;
  item?: Item;
  token: string;
  passwordHash?: string;
  expiresAt: string;
  revoked: boolean;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
}

// View mode types
export type ViewMode = 'grid' | 'list';
export type SortField = 'createdAt' | 'updatedAt' | 'title' | 'importance';
export type SortOrder = 'asc' | 'desc';
