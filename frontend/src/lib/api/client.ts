import axios from "axios";
import type {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse,
} from "axios";
import type { ApiError } from "@/types/api";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}${API_PREFIX}`,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("accessToken");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const response = await axios.post(
                    `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
                    {
                        refreshToken,
                    }
                );

                const { accessToken } = response.data;
                localStorage.setItem("accessToken", accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        // Format error response
        const apiError: ApiError = {
            message:
                error.response?.data?.message ||
                error.message ||
                "An error occurred",
            statusCode: error.response?.status || 500,
            error: error.response?.data?.error,
        };

        return Promise.reject(apiError);
    }
);

export default apiClient;
