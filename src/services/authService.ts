
import axios from 'axios';
import { LoginResponse, Session, User } from "@/types";
import apiClient, { setAccessToken, clearAccessToken } from "./apiClient";
import { normalizeSession, normalizeUser } from "./normalizers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class AuthService {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await apiClient.post<LoginResponse>('/auth/login', formData);

            if (response.data) {
                setAccessToken(response.data.access_token);
            }
            return response.data;
        } catch (error) {
            console.error("API Login failed:", error);
            throw error;
        }
    }

    async getMe(): Promise<User> {
        const response = await apiClient.get<User>('/auth/me');
        return normalizeUser(response.data);
    }

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
            await apiClient.post('/auth/logout', {});
        } catch (e) {
            console.error("Logout API call failed", e);
        } finally {
            clearAccessToken();
        }
    }

    async silentRefresh(): Promise<string | null> {
        try {
            const { data } = await axios.post<LoginResponse>(
                `${API_URL}/auth/cookie-refresh`,
                {},
                { withCredentials: true }
            );
            setAccessToken(data.access_token);
            return data.access_token;
        } catch {
            clearAccessToken();
            return null;
        }
    }

    async googleLogin(idToken: string): Promise<LoginResponse> {
        try {
            const response = await apiClient.post<LoginResponse>('/auth/google', { id_token: idToken });
            if (response.data) {
                setAccessToken(response.data.access_token);
            }
            return response.data;
        } catch (error) {
            console.error("Google login failed:", error);
            throw error;
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
        clearAccessToken();
    }
}

export const authService = new AuthService();
