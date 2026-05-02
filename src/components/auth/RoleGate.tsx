
"use client";

import { ReactNode } from "react";
import { useAuth } from "@/services/authContext";
import { Warning } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface RoleGateProps {
    children: ReactNode;
    allowedRoles: ("admin" | "venue_owner" | "venue_manager" | "customer")[];
    showError?: boolean;
}

export default function RoleGate({ children, allowedRoles, showError = true }: RoleGateProps) {
    const { user, hasRole, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    if (!user) {
        if (showError) {
            return (
                <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
                    <Warning size={48} weight="duotone" className="text-faint mb-4" />
                    <h2 className="text-xl font-bold text-primary mb-2">Login Required</h2>
                    <p className="text-muted mb-6">You need to sign in to access this page.</p>
                    <Link href="/login">
                        <Button className="bg-emerald-500 text-black font-bold">Sign In</Button>
                    </Link>
                </div>
            );
        }
        return null;
    }

    const isAllowed = allowedRoles.some((role) => hasRole(role));

    if (!isAllowed) {
        if (showError) {
            return (
                <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-red-500/10 p-4 rounded-full mb-4">
                        <Warning size={32} weight="duotone" className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-primary mb-2">Access Denied</h2>
                    <p className="text-muted mb-6 max-w-md">
                        You do not have the required permissions to view this content.
                        Please contact your administrator if you believe this is an error.
                    </p>
                    <Link href="/">
                        <Button variant="outline">Return Home</Button>
                    </Link>
                </div>
            );
        }
        return null;
    }

    return <>{children}</>;
}
