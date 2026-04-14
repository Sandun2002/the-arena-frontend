
"use client";

import { createContext, useContext, useEffect, useState, FunctionComponent } from "react";
import { User, UserRole } from "@/types";
import { authService } from "./authService";
import { playerService } from "./playerService";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    loginWithGoogle: (idToken: string) => Promise<User>;
    logout: () => void;
    updateUser: (fields: Partial<User>) => void;
    // Role Helpers
    hasRole: (role: UserRole) => boolean;
    isCustomer: boolean;
    isVenueOwner: boolean;
    isVenueManager: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Provider Component
export const AuthProvider: FunctionComponent<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchAndApplyStats = async (baseUser: User): Promise<User> => {
        try {
            const stats = await playerService.getStats();
            if (stats?.xp !== undefined) {
                const updated = { ...baseUser, xp: stats.xp, level: stats.level ?? baseUser.level };
                setUser(updated);
                return updated;
            }
        } catch (_) {}
        return baseUser;
    };

    // Load user from stored token on mount
    useEffect(() => {
        const initAuth = async () => {
            const { accessToken } = authService.getTokens();
            if (accessToken) {
                try {
                    const userData = await authService.getMe(accessToken);
                    setUser(userData);
                    fetchAndApplyStats(userData);
                } catch (error) {
                    console.error("Session expired or invalid token", error);
                    authService.logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        try {
            // 1. Get Tokens
            const tokenResponse = await authService.login(email, password);

            // 2. Get User Profile
            const userData = await authService.getMe(tokenResponse.access_token);
            setUser(userData);

            // 3. Hydrate xp/level from stats
            const hydrated = await fetchAndApplyStats(userData);
            return hydrated;

        } catch (error) {
            console.error("Login Failed", error);
            throw error; // Let UI handle the error (toast)
        }
    };

    const loginWithGoogle = async (idToken: string): Promise<User> => {
        try {
            await authService.googleLogin(idToken);
            const userData = await authService.getMe();
            setUser(userData);
            const hydrated = await fetchAndApplyStats(userData);
            return hydrated;
        } catch (error) {
            console.error("Google Login Failed", error);
            throw error;
        }
    };

    const updateUser = (fields: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...fields } : null);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        router.push("/login");
    };

    // Role Helpers
    const hasRole = (roleSlug: UserRole): boolean => {
        return user?.roles.some(r => r.slug === roleSlug) ?? false;
    };

    const isCustomer = hasRole("customer");
    const isVenueOwner = hasRole("venue_owner");
    const isVenueManager = hasRole("venue_manager");

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!user,
                user,
                loading,
                login,
                loginWithGoogle,
                logout,
                updateUser,
                hasRole,
                isCustomer,
                isVenueOwner,
                isVenueManager
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook
export const useAuth = () => useContext(AuthContext);
