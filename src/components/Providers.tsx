
"use client";

import { AuthProvider } from "@/services/authContext";
import { ToastProvider } from "@/components/ui/Toast";
import { VenueProvider } from "@/components/venue/VenueContext";
import { LocationProvider } from "@/contexts/LocationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <AuthProvider>
                <LocationProvider>
                    <VenueProvider>
                        {children}
                    </VenueProvider>
                </LocationProvider>
            </AuthProvider>
        </ToastProvider>
    );
}
