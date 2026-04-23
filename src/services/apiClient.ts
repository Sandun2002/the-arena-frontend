
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ─── In-memory access token (never touches localStorage / sessionStorage) ───
// The refresh token lives exclusively as an httpOnly cookie set by the backend.
let _accessToken: string | null = null;

export const getAccessToken = (): string | null => _accessToken;

export const setAccessToken = (token: string | null): void => {
    _accessToken = token;
};

export const clearAccessToken = (): void => {
    _accessToken = null;
};

// Create Axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Required to send httpOnly cookies cross-origin
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach in-memory access token and Request ID
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (_accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${_accessToken}`;
        }

        if (config.headers) {
            config.headers['X-Request-ID'] = (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 15);
        }

        // Remove Content-Type for FormData so browser sets the boundary
        if (config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 — silent refresh via httpOnly cookie
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token as string);
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Cookie-based silent refresh — browser automatically sends httpOnly cookie
                const { data } = await axios.post(
                    `${API_URL}/auth/cookie-refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken: string = data.access_token;
                setAccessToken(newAccessToken);
                processQueue(null, newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAccessToken();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?session=expired';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
