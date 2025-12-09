// Library API - Items CRUD operations with real backend calls
import apiClient from './client';
import type { Item, Tag } from '@/types/domain';
import type {
  ListItemsParams,
  PaginatedResponse,
  CreateItemPayload,
  UpdateItemPayload
} from '@/types/api';

/**
 * Normalize item from API response
 * - Populates `tags` from `itemTags` for backward compatibility
 * - Sets `thumbnailUrl` alias
 */
function normalizeItem(item: Item): Item {
  const tags: Tag[] = item.itemTags?.map(it => it.tag) || [];
  return {
    ...item,
    tags,
    thumbnailUrl: item.thumbnail,
  };
}

/**
 * Build FormData for item creation/update
 * Supports multiple files
 */
function buildItemFormData(
  payload: CreateItemPayload | UpdateItemPayload,
  files?: File[]
): FormData {
  const formData = new FormData();

  // Add scalar fields
  const scalarFields = ['type', 'title', 'description', 'category', 'project', 'importance', 'url', 'content'];
  scalarFields.forEach(field => {
    const value = (payload as Record<string, unknown>)[field];
    if (value !== undefined && value !== null && value !== '') {
      formData.append(field, String(value));
    }
  });

  // Add tagIds as array
  if (payload.tagIds?.length) {
    payload.tagIds.forEach(id => formData.append('tagIds[]', id));
  }

  // Add newTags as JSON string
  if (payload.newTags?.length) {
    formData.append('newTags', JSON.stringify(payload.newTags));
  }

  // Add removeFileIds for update (type guard)
  if ('removeFileIds' in payload && payload.removeFileIds?.length) {
    payload.removeFileIds.forEach(id => formData.append('removeFileIds[]', id));
  }

  // Add files if provided (multiple)
  if (files?.length) {
    files.forEach(file => formData.append('files', file));
  }

  return formData;
}

/**
 * POST /items
 * Create new item (FILE, LINK, or NOTE)
 * For FILE type, pass files array parameter
 * Returns item and message from backend
 */
export async function createItem(
  payload: CreateItemPayload,
  files?: File[]
): Promise<{ item: Item; message: string }> {
  const formData = buildItemFormData(payload, files);

  const response = await apiClient.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const { item, message } = response.data.data;
  return { item: normalizeItem(item), message };
}

/**
 * GET /items
 * List items with filtering, sorting, and pagination
 */
export async function listItems(
  params: ListItemsParams = {}
): Promise<PaginatedResponse<Item>> {
  // Convert tagIds array to comma-separated for query string
  const queryParams: Record<string, unknown> = { ...params };
  if (params.tagIds?.length) {
    queryParams.tagIds = params.tagIds.join(',');
  }

  const response = await apiClient.get('/items', { params: queryParams });
  const result = response.data.data as PaginatedResponse<Item>;

  return {
    ...result,
    data: result.data.map(normalizeItem),
  };
}

/**
 * GET /items/:id
 * Get single item by ID
 */
export async function getItem(id: string): Promise<Item> {
  const response = await apiClient.get(`/items/${id}`);
  return normalizeItem(response.data.data);
}

/**
 * PATCH /items/:id
 * Update item
 * For FILE type: pass newFiles to add files, use removeFileIds in payload to remove
 * Returns item and message from backend
 */
export async function updateItem(
  id: string,
  payload: UpdateItemPayload,
  newFiles?: File[]
): Promise<{ item: Item; message: string }> {
  const formData = buildItemFormData(payload, newFiles);

  const response = await apiClient.patch(`/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const { item, message } = response.data.data;
  return { item: normalizeItem(item), message };
}

/**
 * PATCH /items/:id/files/:fileId/primary
 * Set a file as primary for the item
 */
export async function setPrimaryFile(itemId: string, fileId: string): Promise<Item> {
  const response = await apiClient.patch(`/items/${itemId}/files/${fileId}/primary`);
  return normalizeItem(response.data.data);
}

/**
 * PATCH /items/:id/files/reorder
 * Reorder files in an item
 */
export async function reorderFiles(itemId: string, fileIds: string[]): Promise<Item> {
  const response = await apiClient.patch(`/items/${itemId}/files/reorder`, { fileIds });
  return normalizeItem(response.data.data);
}

/**
 * DELETE /items/:id
 * Delete item (and file from R2 if FILE type)
 * Returns message from backend
 */
export async function deleteItem(id: string): Promise<{ message: string }> {
  const response = await apiClient.delete(`/items/${id}`);
  return { message: response.data.message || 'Item deleted successfully' };
}

/**
 * PATCH /items/:id/pin
 * Toggle pin status - returns item and message
 */
export async function togglePinItem(id: string): Promise<{ item: Item; message: string }> {
  const response = await apiClient.patch(`/items/${id}/pin`);
  const { item, message } = response.data.data;
  return {
    item: normalizeItem(item),
    message: message || 'Pin status updated'
  };
}

/**
 * Helper: Get pinned items
 */
export async function getPinnedItems(): Promise<Item[]> {
  const response = await listItems({ isPinned: true, limit: 50 });
  return response.data;
}

/**
 * Helper: Get recent items
 */
export async function getRecentItems(limit: number = 10): Promise<Item[]> {
  const response = await listItems({
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    limit
  });
  return response.data;
}

