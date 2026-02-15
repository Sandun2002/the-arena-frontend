
"use client";

import { AuthProvider } from "@/services/authContext";
import { ToastProvider } from "@/components/ui/Toast";

import { VenueProvider } from "@/components/venue/VenueContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <AuthProvider>
                <VenueProvider>
                    {children}
                </VenueProvider>
            </AuthProvider>
        </ToastProvider>
    );
}
