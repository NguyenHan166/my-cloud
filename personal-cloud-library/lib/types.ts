// User and Authentication Types
export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  avatar?: string
  role: "ADMIN" | "USER"
  isActive: boolean
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// File Storage Types
export interface FileData {
  id: string
  userId: string
  storageKey: string
  originalName: string
  mimeType: string
  size: bigint
  checkSum?: string
  createdAt: Date
  updatedAt: Date
}

// Item Types (Core - File/Link/Note)
export type ItemType = "FILE" | "LINK" | "NOTE"
export type Importance = "LOW" | "MEDIUM" | "HIGH"

export interface Item {
  id: string
  userId: string
  type: ItemType
  url?: string
  content?: string
  title: string
  description?: string
  thumbnail?: string
  category?: string
  project?: string
  importance: Importance
  isPinned: boolean
  tagsText?: string
  domain?: string
  createdAt: Date
  updatedAt: Date
}

// Tag Types
export interface Tag {
  id: string
  userId: string
  name: string
  color?: string
  createdAt: Date
}

export interface ItemTag {
  itemId: string
  tagId: string
}

// Collection Types
export interface Collection {
  id: string
  userId: string
  name: string
  description?: string
  coverImage?: string
  isPublic: boolean
  slugPublic?: string
  createdAt: Date
  updatedAt: Date
}

export interface CollectionItem {
  id: string
  userId: string
  collectionId: string
  itemId: string
  createdAt: Date
  updatedAt: Date
}

// Sharing Types
export interface SharedLink {
  id: string
  userId: string
  itemId: string
  token: string
  passwordHash?: string
  expiresAt: Date
  revoked: boolean
  accessCount: number
  createdAt: Date
  updatedAt: Date
}

// Usage/Analytics Types
export interface UserUsage {
  id: string
  userId: string
  usedStorageBytes: bigint
  maxStorageBytes: bigint
  itemCount: number
  maxItems: number
  collectionCount: number
  maxCollections: number
}

// Embedding for AI Search
export interface Embedding {
  id: string
  userId: string
  itemId: string
  vector: Buffer
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// UI Component Props Types
export interface ItemCardProps {
  item: Item
  tags?: Tag[]
  onClick?: () => void
  onPin?: (id: string) => void
}

export interface FilterOptions {
  type?: ItemType
  tags?: string[]
  category?: string
  project?: string
  importance?: Importance
  search?: string
  sortBy?: "createdAt" | "title" | "importance"
  sortOrder?: "asc" | "desc"
}
