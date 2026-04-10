
"use client";

import { AuthProvider } from "@/services/authContext";
import { ToastProvider } from "@/components/ui/Toast";
import { VenueProvider } from "@/components/venue/VenueContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
            <ToastProvider>
                <AuthProvider>
                    <LocationProvider>
                        <VenueProvider>
                            {children}
                        </VenueProvider>
                    </LocationProvider>
                </AuthProvider>
            </ToastProvider>
        </GoogleOAuthProvider>
    );
}
