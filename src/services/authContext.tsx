"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { USER_PROFILE } from "./userData";

type UserType = "player" | "venue" | null;

interface AuthContextType {
    isLoggedIn: boolean;
    userType: UserType;
    user: typeof USER_PROFILE | null;
    login: (type: UserType) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userType, setUserType] = useState<UserType>(null);

    const login = (type: UserType) => {
        setIsLoggedIn(true);
        setUserType(type);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUserType(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                userType,
                user: isLoggedIn ? USER_PROFILE : null,
                login,
                logout,
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
