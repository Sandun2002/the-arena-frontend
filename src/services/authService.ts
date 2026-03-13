
import { LoginResponse, Session, User } from "@/types";
import apiClient from "./apiClient";
import { normalizeSession, normalizeUser } from "./normalizers";

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
        return normalizeUser(response.data);
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
        return normalizeUser(response.data);
    }

    async logout() {
        try {
            const { refreshToken } = this.getTokens();
            if (refreshToken) {
                await apiClient.post('/auth/logout', { refresh_token: refreshToken });
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

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
        return true;
    }

    // === MFA ===
    async setupMfa() {
        const response = await apiClient.post<{ secret: string; qr_code: string; provisioning_uri: string }>('/auth/mfa/setup');
        return response.data;
    }

    async getMfaStatus() {
        const response = await apiClient.get<{ is_enabled: boolean; enabled_at: string | null; recovery_codes_remaining: number }>('/auth/mfa/status');
        return response.data;
    }

    async verifyMfa(code: string) {
        const response = await apiClient.post<{ message: string; recovery_codes: string[]; recovery_codes_count: number }>('/auth/mfa/confirm', { code });
        return response.data;
    }

    async disableMfa(password: string) {
        const response = await apiClient.post<{ message: string; sessions_revoked: number }>('/auth/mfa/disable', { password });
        return response.data;
    }

    // === Sessions ===
    async getSessions(): Promise<Session[]> {
        const response = await apiClient.get<{ sessions: any[] }>('/auth/sessions');
        return (response.data.sessions || []).map(normalizeSession);
    }

    async logoutAllDevices(): Promise<void> {
        await apiClient.post('/auth/logout', { all_devices: true });
    }
}

export const authService = new AuthService();
