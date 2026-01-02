/**
 * API Client for PersonalCloud Extension
 * Handles authentication and API calls to the backend
 */
import type {
    User,
    LoginResponse,
    RefreshTokenResponse,
    StorageUsageResponse,
    ItemResponse,
    ItemsListResponse,
    CreateItemDto,
    ApiResponse,
    Tag,
} from "./types";

// API Configuration
const API_BASE_URL = "https://apistorage.nguyenvanhan.io.vn";
const API_PREFIX = "/api";

// Get full API URL
const getApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${API_PREFIX}${endpoint}`;
};

// Token management with debug logs
export const getAccessToken = async (): Promise<string | null> => {
    const result = (await browser.storage.local.get("accessToken")) as {
        accessToken?: string;
    };
    console.log(
        "[Extension] getAccessToken:",
        result.accessToken ? "exists" : "null"
    );
    return result.accessToken || null;
};

export const getRefreshToken = async (): Promise<string | null> => {
    const result = (await browser.storage.local.get("refreshToken")) as {
        refreshToken?: string;
    };
    console.log(
        "[Extension] getRefreshToken:",
        result.refreshToken ? "exists" : "null"
    );
    return result.refreshToken || null;
};

export const setTokens = async (
    accessToken: string,
    refreshToken: string
): Promise<void> => {
    console.log("[Extension] setTokens - saving tokens...");
    console.log(
        "[Extension] setTokens - accessToken length:",
        accessToken?.length
    );
    console.log(
        "[Extension] setTokens - refreshToken length:",
        refreshToken?.length
    );

    try {
        // Save tokens separately to ensure they're stored
        await browser.storage.local.set({ accessToken: accessToken });
        await browser.storage.local.set({ refreshToken: refreshToken });

        // Verify tokens were saved
        const saved = (await browser.storage.local.get([
            "accessToken",
            "refreshToken",
        ])) as {
            accessToken?: string;
            refreshToken?: string;
        };
        console.log("[Extension] setTokens - verified:", {
            accessToken: saved.accessToken
                ? `saved (${saved.accessToken.length} chars)`
                : "NOT SAVED",
            refreshToken: saved.refreshToken
                ? `saved (${saved.refreshToken.length} chars)`
                : "NOT SAVED",
        });
    } catch (error) {
        console.error("[Extension] setTokens - ERROR:", error);
    }
};

export const clearTokens = async (): Promise<void> => {
    console.log("[Extension] clearTokens - clearing all tokens");
    await browser.storage.local.remove(["accessToken", "refreshToken", "user"]);
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
    const token = await getAccessToken();
    console.log("[Extension] isAuthenticated:", !!token);
    return !!token;
};

// Refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
        console.log("[Extension] refreshAccessToken - no refresh token");
        return null;
    }

    try {
        console.log(
            "[Extension] refreshAccessToken - calling /auth/refresh..."
        );
        const response = await fetch(getApiUrl("/auth/refresh"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            console.log(
                "[Extension] refreshAccessToken - failed:",
                response.status
            );
            await clearTokens();
            return null;
        }

        const data: RefreshTokenResponse = await response.json();
        console.log(
            "[Extension] refreshAccessToken - success, new tokens received"
        );
        await setTokens(data.data.accessToken, data.data.refreshToken);
        return data.data.accessToken;
    } catch (error) {
        console.error("[Extension] refreshAccessToken - error:", error);
        await clearTokens();
        return null;
    }
};

// API request helper with auto token refresh
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
): Promise<ApiResponse<T>> => {
    try {
        const token = await getAccessToken();
        console.log(
            "[Extension] apiRequest:",
            endpoint,
            "- token:",
            token ? "present" : "MISSING"
        );

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...((options.headers as Record<string, string>) || {}),
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const url = getApiUrl(endpoint);
        console.log("[Extension] Fetching:", url);

        const response = await fetch(url, {
            ...options,
            headers,
        });

        console.log("[Extension] Response status:", response.status);

        // Handle 401 - try to refresh token and retry
        if (response.status === 401 && retry) {
            console.log("[Extension] 401 - attempting token refresh...");
            const newToken = await refreshAccessToken();
            if (newToken) {
                console.log("[Extension] Token refreshed, retrying request...");
                return apiRequest<T>(endpoint, options, false);
            }
            console.log("[Extension] Token refresh failed");
            return {
                error: "Session expired. Please login again.",
                status: 401,
            };
        }

        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.message || "Request failed",
                status: response.status,
            };
        }

        return { data, status: response.status };
    } catch (error) {
        console.error("[Extension] apiRequest error:", error);
        return {
            error: error instanceof Error ? error.message : "Network error",
            status: 0,
        };
    }
};

// Auth API
export const authApi = {
    async login(
        email: string,
        password: string
    ): Promise<ApiResponse<LoginResponse>> {
        console.log("[Extension] authApi.login - attempting login for:", email);

        const response = await apiRequest<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        console.log(
            "[Extension] authApi.login - response:",
            response.status,
            response.error || "OK"
        );

        if (response.data?.data) {
            const { user, tokens } = response.data.data;
            console.log(
                "[Extension] authApi.login - tokens received, saving..."
            );
            console.log("[Extension] authApi.login - user:", user?.email);
            console.log(
                "[Extension] authApi.login - accessToken:",
                tokens?.accessToken ? "present" : "missing"
            );

            if (tokens?.accessToken && tokens?.refreshToken) {
                await setTokens(tokens.accessToken, tokens.refreshToken);
                await browser.storage.local.set({ user });
                console.log(
                    "[Extension] authApi.login - user saved:",
                    user.email
                );
            } else {
                console.error(
                    "[Extension] authApi.login - tokens missing in response!"
                );
            }
        }

        return response;
    },

    async logout(): Promise<void> {
        console.log("[Extension] authApi.logout");
        try {
            await apiRequest("/auth/logout", { method: "POST" });
        } finally {
            await clearTokens();
        }
    },

    async getProfile(): Promise<
        ApiResponse<{ success: boolean; data: User; timestamp: string }>
    > {
        console.log("[Extension] authApi.getProfile");
        return apiRequest("/users/me");
    },
};

// Storage API
export const storageApi = {
    async getUsage(): Promise<ApiResponse<StorageUsageResponse>> {
        return apiRequest("/users/me/storage");
    },
};

// Items API
export const itemsApi = {
    async getItems(params?: {
        page?: number;
        limit?: number;
    }): Promise<ApiResponse<ItemsListResponse>> {
        const query = params
            ? `?page=${params.page || 1}&limit=${params.limit || 10}`
            : "";
        return apiRequest(`/items${query}`);
    },

    async createItem(
        data: CreateItemDto,
        files?: File[]
    ): Promise<ApiResponse<ItemResponse>> {
        const token = await getAccessToken();

        const formData = new FormData();
        formData.append("type", data.type);
        formData.append("title", data.title);

        if (data.description) formData.append("description", data.description);
        if (data.category) formData.append("category", data.category);
        if (data.project) formData.append("project", data.project);
        if (data.importance) formData.append("importance", data.importance);
        if (data.url) formData.append("url", data.url);
        if (data.content) formData.append("content", data.content);

        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append("files", file);
            });
        }

        try {
            const response = await fetch(getApiUrl("/items"), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                return { error: responseData.message, status: response.status };
            }

            return { data: responseData, status: response.status };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : "Upload failed",
                status: 0,
            };
        }
    },

    async createLink(
        url: string,
        title: string
    ): Promise<ApiResponse<ItemResponse>> {
        return apiRequest("/items", {
            method: "POST",
            body: JSON.stringify({
                type: "LINK",
                title,
                url,
            }),
        });
    },

    async getRecentItems(limit = 10): Promise<ApiResponse<ItemsListResponse>> {
        return apiRequest(
            `/items?limit=${limit}&sortBy=createdAt&sortOrder=desc`
        );
    },

    async deleteItem(
        id: string
    ): Promise<ApiResponse<{ success: boolean; message: string }>> {
        return apiRequest(`/items/${id}/trash`, {
            method: "PATCH",
        });
    },

    async getItemFileUrl(itemId: string, fileId: string): Promise<string> {
        return `${API_BASE_URL}${API_PREFIX}/files/${fileId}/download`;
    },
};

// Tags API
export const tagsApi = {
    async getAll(): Promise<
        ApiResponse<{ success: boolean; data: Tag[]; timestamp: string }>
    > {
        return apiRequest("/tags");
    },

    async create(data: {
        name: string;
        color: string;
    }): Promise<
        ApiResponse<{ success: boolean; data: Tag; timestamp: string }>
    > {
        return apiRequest("/tags", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};

// Export types
export type { ApiResponse };
