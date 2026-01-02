/**
 * Zustand store for extension state management
 */
import { create } from "zustand";
import type { User, StorageUsage, Item } from "./types";

interface ExtensionState {
    // Auth state
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    // Storage state
    storageUsage: StorageUsage | null;

    // Recent items
    recentItems: Item[];

    // UI state
    activeTab: "browse" | "settings";
    error: string | null;

    // Upload state
    isUploading: boolean;
    uploadProgress: number;

    // Actions
    setAuthenticated: (isAuthenticated: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    setStorageUsage: (usage: StorageUsage | null) => void;
    setRecentItems: (items: Item[]) => void;
    setActiveTab: (tab: "browse" | "settings") => void;
    setError: (error: string | null) => void;
    setUploading: (isUploading: boolean) => void;
    setUploadProgress: (progress: number) => void;
    reset: () => void;
}

const initialState = {
    isAuthenticated: false,
    user: null,
    isLoading: true,
    storageUsage: null,
    recentItems: [],
    activeTab: "browse" as const,
    error: null,
    isUploading: false,
    uploadProgress: 0,
};

export const useExtensionStore = create<ExtensionState>((set) => ({
    ...initialState,

    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    setStorageUsage: (storageUsage) => set({ storageUsage }),
    setRecentItems: (recentItems) => set({ recentItems }),
    setActiveTab: (activeTab) => set({ activeTab }),
    setError: (error) => set({ error }),
    setUploading: (isUploading) => set({ isUploading }),
    setUploadProgress: (uploadProgress) => set({ uploadProgress }),
    reset: () => set(initialState),
}));

// Helper to format bytes to human readable
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
