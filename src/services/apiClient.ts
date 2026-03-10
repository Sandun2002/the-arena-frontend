
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LoginResponse } from '@/types';

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const ACCESS_TOKEN_KEY = "arena_access_token";
const REFRESH_TOKEN_KEY = "arena_refresh_token";

// Create Axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get tokens safely
const getAccessToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem(ACCESS_TOKEN_KEY);
    return null;
};

const getRefreshToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem(REFRESH_TOKEN_KEY);
    return null;
};

const setTokens = (tokens: LoginResponse) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
};

const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};

// Request Interceptor: Attach Token and Request ID
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add unique request ID
        if (config.headers) {
            config.headers['X-Request-ID'] = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        }

        // Remove Content-Type for FormData so browser can set boundary
        if (config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void, reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Valid 401 error and not already retried
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                // No refresh token -> logout
                isRefreshing = false;
                clearTokens();
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Attempt refresh (using a clean axios instance to avoid loops)
                const response = await axios.post<LoginResponse>(`${API_URL}/auth/refresh`, {
                    refresh_token: refreshToken
                });

                const newTokens = response.data;
                setTokens(newTokens);

                processQueue(null, newTokens.access_token);

                // Update header and retry original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
                }

                return apiClient(originalRequest);

            } catch (refreshError) {
                // Refresh failed -> logout
                processQueue(refreshError, null);
                clearTokens();
                if (typeof window !== 'undefined') window.location.href = '/login?session=expired';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
