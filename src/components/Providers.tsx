
"use client";

import { AuthProvider } from "@/services/authContext";
import { ToastProvider } from "@/components/ui/Toast";
import { VenueProvider } from "@/components/venue/VenueContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PushPromptBanner } from "@/components/notifications/PushPromptBanner";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
                <ToastProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <LocationProvider>
                                <VenueProvider>
                                    {children}
                                    <PushPromptBanner />
                                </VenueProvider>
                            </LocationProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </ToastProvider>
            </GoogleOAuthProvider>
        </ThemeProvider>
    );
}
