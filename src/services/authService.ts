
import { LoginResponse, User, Session, UserRole } from "@/types";
import apiClient from "./apiClient";

// Local storage key for tokens
const ACCESS_TOKEN_KEY = "arena_access_token";
const REFRESH_TOKEN_KEY = "arena_refresh_token";

class AuthService {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 password flow standard
            formData.append('password', password);

            const response = await apiClient.post<LoginResponse>('/auth/login', formData);

            if (response.data) {
                this.setTokens(response.data);
            }
            return response.data;
        } catch (error) {
            console.error("API Login failed:", error);
            throw error;
        }
    }

    // 2. Initializing User Session
    async getMe(token?: string): Promise<User> {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    }

    // 3. Signup
    async signup(data: {
        email: string;
        full_name: string;
        phone_number: string;
        password: string;
        role: "customer" | "venue_owner";
    }): Promise<User> {
        const response = await apiClient.post<User>('/auth/signup', data);
        return response.data;
    }

    async logout() {
        try {
            const token = this.getTokens().accessToken;
            if (token) {
                await apiClient.post('/auth/logout');
            }
        } catch (e) {
            console.error("Logout API call failed", e);
        } finally {
            if (typeof window !== "undefined") {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
            }
        }
    }

    getTokens(): { accessToken: string | null; refreshToken: string | null } {
        if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
        return {
            accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
            refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
        };
    }

    private setTokens(tokens: LoginResponse) {
        if (typeof window !== "undefined") {
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
            localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        }
    }

    // === Password Reset ===
    async requestPasswordReset(email: string): Promise<boolean> {
        await apiClient.post('/auth/forgot-password', { email });
        return true;
    }

    async resetPassword(token: string, data: any): Promise<boolean> {
        await apiClient.post('/auth/reset-password', { token, ...data });
        return true;
    }

    // === MFA ===
    async setupMfa() {
        const response = await apiClient.post<{ secret: string, qr_code_uri: string }>('/auth/mfa/setup');
        return response.data;
    }

    async verifyMfa(code: string): Promise<boolean> {
        await apiClient.post('/auth/mfa/verify', { code });
        return true;
    }

    async disableMfa() {
        await apiClient.post('/auth/mfa/disable');
    }

    // === Sessions ===
    async getSessions(): Promise<Session[]> {
        const response = await apiClient.get<Session[]>('/auth/sessions');
        return response.data;
    }

    async revokeSession(jti: string): Promise<void> {
        await apiClient.delete(`/auth/sessions/${jti}`);
    }
}

export const authService = new AuthService();
