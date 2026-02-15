
"use client";

import { createContext, useContext, useEffect, useState, FunctionComponent } from "react";
import { User, UserRole } from "@/types";
import { authService } from "./authService";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
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

    // Load user from stored token on mount
    useEffect(() => {
        const initAuth = async () => {
            const { accessToken } = authService.getTokens();
            if (accessToken) {
                try {
                    const userData = await authService.getMe(accessToken);
                    setUser(userData);
                } catch (error) {
                    console.error("Session expired or invalid token", error);
                    authService.logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // 1. Get Tokens
            const tokenResponse = await authService.login(email, password);

            // 2. Get User Profile
            const userData = await authService.getMe(tokenResponse.access_token);

            setUser(userData);

            // 3. Create Refresh Timer (Mock implementation)
            // In real app: setup an interceptor or timeout based on tokenResponse.expires_in

        } catch (error) {
            console.error("Login Failed", error);
            throw error; // Let UI handle the error (toast)
        }
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
                logout,
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
