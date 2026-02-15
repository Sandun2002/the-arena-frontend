
import { LoginResponse, User, Session, UserRole } from "@/types";
import { MOCK_USERS } from "./mockData";

// Simple UUID alternative for mock
const uuidv4 = () => Math.random().toString(36).substring(2, 15);

// Local storage key for tokens
const ACCESS_TOKEN_KEY = "arena_access_token";
const REFRESH_TOKEN_KEY = "arena_refresh_token";

let MOCK_SESSIONS: Session[] = [
    {
        jti: "session-123",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_current: true
    }
];

class AuthService {
    // 1. Simulating OAuth2 Password Flow (form-data)
    async login(email: string, password: string): Promise<LoginResponse> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
                if (user) {
                    const response: LoginResponse = {
                        access_token: `mock_access_token_${user.id}_${Date.now()}`,
                        refresh_token: `mock_refresh_token_${user.id}`,
                        token_type: "bearer",
                        expires_in: 900,
                    };
                    this.setTokens(response);
                    resolve(response);
                } else {
                    reject(new Error("Invalid credentials"));
                }
            }, 800);
        });
    }

    // 2. Initializing User Session
    async getMe(token: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = MOCK_USERS.find((u) => token.includes(u.id));
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error("User not found"));
                }
            }, 500);
        });
    }

    // 3. Signup Simulation
    async signup(data: {
        email: string;
        full_name: string;
        phone_number: string;
        password: string;
        role: "customer" | "venue_owner";
    }): Promise<User> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser: User = {
                    id: `user-${uuidv4()}`,
                    email: data.email,
                    full_name: data.full_name,
                    phone_number: data.phone_number,
                    profile_image: null,
                    bio: null,
                    is_active: true,
                    roles: [
                        {
                            id: data.role === "customer" ? 1 : 2,
                            name: data.role === "customer" ? "Customer" : "Venue Owner",
                            slug: data.role === "customer" ? "customer" : "venue_owner",
                            description: "New user",
                        },
                    ],
                    email_verified: false,
                    phone_verified: false,
                    verification_status: "unverified",
                    is_mfa_enabled: false,
                    xp: 0,
                    level: 1,
                    next_level_xp: 100,
                    xp_progress_percent: 0,
                    created_at: new Date().toISOString(),
                    updated_at: null,
                };
                resolve(newUser);
            }, 1000);
        });
    }

    logout() {
        if (typeof window !== "undefined") {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
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

    // === Password Reset Mock ===
    async requestPasswordReset(email: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true); // Simulate success
            }, 600);
        });
    }

    async resetPassword(token: string, data: any): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true); // Simulate success
            }, 600);
        });
    }

    // === MFA Mock ===
    async setupMfa() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    secret: "ABCD-EFGH-IJKL-MNOP",
                    qr_code_uri: "otpauth://totp/Arena.lk:user?secret=ABCD&issuer=Arena.lk"
                });
            }, 600);
        });
    }

    async verifyMfa(code: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(code.length === 6 && /^\d+$/.test(code));
            }, 600);
        });
    }

    // === Sessions Mock ===
    async getSessions(): Promise<Session[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_SESSIONS);
            }, 500);
        });
    }
    async revokeSession(jti: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                MOCK_SESSIONS = MOCK_SESSIONS.filter(s => s.jti !== jti);
                resolve();
            }, 500);
        });
    }
}

export const authService = new AuthService();
