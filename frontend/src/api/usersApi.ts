import apiClient from "./client";
import { AxiosError } from "axios";

// ============ Types ============

export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar: string | null;
    role: "ADMIN" | "USER";
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UsersListResponse {
    users: AdminUser[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface QueryUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    sortBy?: "createdAt" | "updatedAt" | "email" | "name";
    sortOrder?: "asc" | "desc";
}

export interface CreateUserData {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role?: "ADMIN" | "USER";
    isActive?: boolean;
    isEmailVerified?: boolean;
}

export interface UpdateUserData {
    name?: string;
    phone?: string;
    avatar?: string;
    password?: string;
    role?: "ADMIN" | "USER";
    isActive?: boolean;
    isEmailVerified?: boolean;
}

// ============ Error Handling ============

const extractErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data;
        return data?.message || error.message || "Có lỗi xảy ra";
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Có lỗi xảy ra";
};

// ============ API Functions ============

/**
 * Get list of users with pagination and filters (Admin only)
 */
export const getUsers = async (
    params?: QueryUsersParams
): Promise<UsersListResponse> => {
    try {
        const response = await apiClient.get<{
            success: boolean;
            data: UsersListResponse;
        }>("/users", {
            params,
        });
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Get user by ID (Admin only)
 */
export const getUserById = async (id: string): Promise<AdminUser> => {
    try {
        const response = await apiClient.get<{
            success: boolean;
            data: AdminUser;
        }>(`/users/${id}`);
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Create new user (Admin only)
 */
export const createUser = async (data: CreateUserData): Promise<AdminUser> => {
    try {
        const response = await apiClient.post<{
            success: boolean;
            data: AdminUser;
        }>("/users", data);
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (
    id: string,
    data: UpdateUserData
): Promise<AdminUser> => {
    try {
        const response = await apiClient.patch<{
            success: boolean;
            data: AdminUser;
        }>(`/users/${id}`, data);
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = async (
    id: string
): Promise<{ message: string; user: AdminUser }> => {
    try {
        const response = await apiClient.patch<{
            success: boolean;
            data: { message: string; user: AdminUser };
        }>(`/users/${id}/toggle-status`);
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};

/**
 * Delete user permanently (Admin only)
 */
export const deleteUser = async (id: string): Promise<{ message: string }> => {
    try {
        const response = await apiClient.delete<{
            success: boolean;
            data: { message: string };
        }>(`/users/${id}`);
        return response.data.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error));
    }
};
