import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi } from "@/lib/api/endpoints/auth";
import type { User } from "@/types/domain";
import type { LoginRequest } from "@/types/api";

/* eslint-disable react-refresh/only-export-components */

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch fresh user data from API
                const response = await authApi.getCurrentUser();
                setUser(response.data);
            } catch (error) {
                console.error("Failed to load user:", error);
                // Token invalid, clear storage
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: LoginRequest) => {
        const response = await authApi.login(credentials);
        const { user, tokens } = response.data;
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await authApi.getCurrentUser();
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
