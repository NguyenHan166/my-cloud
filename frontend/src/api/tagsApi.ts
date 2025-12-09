// Tags API - Real backend calls
import apiClient from './client';
import type { Tag } from '@/types/domain';
import type { CreateTagPayload, UpdateTagPayload } from '@/types/api';

/**
 * POST /tags
 * Create new tag
 */
export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  const response = await apiClient.post('/tags', payload);
  return response.data.data;
}

/**
 * GET /tags
 * List all tags (with itemCount)
 */
export async function listTags(): Promise<Tag[]> {
  const response = await apiClient.get('/tags');
  return response.data.data;
}

/**
 * GET /tags/:id
 * Get single tag by ID
 */
export async function getTagById(id: string): Promise<Tag> {
  const response = await apiClient.get(`/tags/${id}`);
  return response.data.data;
}

/**
 * PATCH /tags/:id
 * Update tag
 */
export async function updateTag(id: string, payload: UpdateTagPayload): Promise<Tag> {
  const response = await apiClient.patch(`/tags/${id}`, payload);
  return response.data.data;
}

/**
 * DELETE /tags/:id
 * Delete tag
 */
export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}

/**
 * Get popular tags (sorted by itemCount)
 */
export async function getPopularTags(limit: number = 5): Promise<Tag[]> {
  const tags = await listTags();
  return tags
    .sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0))
    .slice(0, limit);
}
