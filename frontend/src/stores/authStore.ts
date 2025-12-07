import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/api/authApi";
import type { UserRole } from "@/api/authApi";

// Types
export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: UserRole;
    isEmailVerified?: boolean;
}

export interface Account {
    id: string;
    name: string;
    plan: "free" | "pro" | "enterprise";
}

interface AuthState {
    user: User | null;
    account: Account | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
    verifyOtp: (
        email: string,
        otp: string
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
    resendOtp: (
        email: string
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
    forgotPassword: (
        email: string
    ) => Promise<{ success: boolean; error?: string; message?: string }>;
    resetPassword: (
        token: string,
        newPassword: string
    ) => Promise<{ success: boolean; error?: string; message?: string }>;

    // Pending verification
    pendingEmail: string | null;
    setPendingEmail: (email: string | null) => void;

    // State helpers
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
    initializeAuth: () => void;
    updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            account: null,
            isAuthenticated: false,
            isLoading: false,
            pendingEmail: null,

            setPendingEmail: (email: string | null) =>
                set({ pendingEmail: email }),

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            clearAuth: () => {
                authApi.clearTokens();
                set({
                    user: null,
                    account: null,
                    isAuthenticated: false,
                });
            },

            initializeAuth: () => {
                // Check if tokens exist and set authenticated state
                const hasTokens = authApi.hasValidTokens();
                if (!hasTokens) {
                    get().clearAuth();
                }
            },

            updateUser: (userData: Partial<User>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: { ...currentUser, ...userData },
                    });
                }
            },

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.login({ email, password });

                    // Store tokens
                    authApi.setTokens(response.tokens);

                    // Update state
                    set({
                        user: {
                            id: response.user.id,
                            email: response.user.email,
                            name: response.user.name,
                            avatar: response.user.avatar || null,
                            role: response.user.role,
                            isEmailVerified: response.user.isEmailVerified,
                        },
                        account: {
                            id: "default_account",
                            name: "Personal Workspace",
                            plan: "free",
                        },
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Đăng nhập thất bại",
                    };
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authApi.logout();
                } catch (error) {
                    // Even if logout API fails, clear local state
                    console.error("Logout API error:", error);
                } finally {
                    get().clearAuth();
                    set({ isLoading: false });
                }
            },

            register: async (name: string, email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.register({
                        name,
                        email,
                        password,
                    });
                    set({ isLoading: false });
                    return {
                        success: true,
                        message: response.message,
                    };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Đăng ký thất bại",
                    };
                }
            },

            verifyOtp: async (email: string, otp: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.verifyOtp(email, otp);
                    set({ isLoading: false, pendingEmail: null });
                    return {
                        success: true,
                        message: response.message,
                    };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Xác thực OTP thất bại",
                    };
                }
            },

            resendOtp: async (email: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.resendOtp(email);
                    set({ isLoading: false });
                    return {
                        success: true,
                        message: response.message,
                    };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Gửi lại OTP thất bại",
                    };
                }
            },

            forgotPassword: async (email: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.forgotPassword({ email });
                    set({ isLoading: false });
                    return {
                        success: true,
                        message: response.message,
                    };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Gửi email thất bại",
                    };
                }
            },

            resetPassword: async (token: string, newPassword: string) => {
                set({ isLoading: true });
                try {
                    const response = await authApi.resetPassword({
                        token,
                        newPassword,
                    });
                    set({ isLoading: false });
                    return {
                        success: true,
                        message: response.message,
                    };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Đặt lại mật khẩu thất bại",
                    };
                }
            },
        }),
        {
            name: "cloudhan-auth",
            partialize: (state) => ({
                user: state.user,
                account: state.account,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
