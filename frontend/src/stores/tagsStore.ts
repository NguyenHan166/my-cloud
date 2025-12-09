import { create } from 'zustand';
import type { Tag } from '@/types/domain';
import * as tagsApi from '@/api/tagsApi';

interface TagsState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTags: () => Promise<void>;
  addTag: (name: string, color: string) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTagById: (id: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
  getPopularTags: (limit?: number) => Tag[];

  // For manual set
  setTags: (tags: Tag[]) => void;
  clearTags: () => void;
}

export const useTagsStore = create<TagsState>()((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  loadTags: async () => {
    set({ isLoading: true, error: null });

    try {
      const tags = await tagsApi.listTags();
      set({ tags, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load tags:', error);
      set({
        error: error.message || 'Failed to load tags',
        isLoading: false
      });
    }
  },

  addTag: async (name: string, color: string) => {
    try {
      const newTag = await tagsApi.createTag({ name, color });
      set((state) => ({
        tags: [...state.tags, newTag],
      }));
      return newTag;
    } catch (error: any) {
      console.error('Failed to add tag:', error);
      throw error;
    }
  },

  updateTag: async (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => {
    try {
      const updatedTag = await tagsApi.updateTag(id, updates);
      set((state) => ({
        tags: state.tags.map((tag) =>
          tag.id === id ? updatedTag : tag
        ),
      }));
    } catch (error: any) {
      console.error('Failed to update tag:', error);
      throw error;
    }
  },

  deleteTag: async (id: string) => {
    try {
      await tagsApi.deleteTag(id);
      set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== id),
      }));
    } catch (error: any) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  },

  getTagById: (id: string) => {
    return get().tags.find((tag) => tag.id === id);
  },

  getTagsByIds: (ids: string[]) => {
    return get().tags.filter((tag) => ids.includes(tag.id));
  },

  getPopularTags: (limit: number = 5) => {
    return get().tags
      .slice()
      .sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0))
      .slice(0, limit);
  },

  setTags: (tags: Tag[]) => {
    set({ tags });
  },

  clearTags: () => {
    set({ tags: [], error: null });
  },
}));

// Hook to initialize tags when user logs in
export const useInitializeTags = () => {
  const loadTags = useTagsStore((state) => state.loadTags);
  return loadTags;
};
