
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Venue } from "@/types";
import { centerService } from "@/services/centerService";
import { useAuth } from "@/services/authContext";

interface VenueContextType {
    venues: Venue[];
    currentVenue: Venue | null;
    isLoading: boolean;
    error: string | null;
    selectVenue: (venueId: string) => void;
    refreshVenues: () => Promise<void>;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: isAuthLoading } = useAuth();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isVenueUser = user?.roles?.some(r => r.slug === "venue_owner" || r.slug === "venue_manager") ?? false;

    // Load venues only for venue owners/managers (not customers)
    useEffect(() => {
        if (isAuthLoading) return;

        if (!user || !isVenueUser) {
            setVenues([]);
            setCurrentVenue(null);
            setIsLoading(false);
            return;
        }

        loadVenues();
    }, [user, isAuthLoading]);

    const loadVenues = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const profile = await centerService.getProfile();
            const data = profile ? [profile] : []; // Wrap in array to maintain `venues` contract

            setVenues(data);

            // Restore selection or default to first
            const savedVenueId = localStorage.getItem("arena_current_venue_id");
            const savedVenue = data.find(v => v.id === savedVenueId);

            if (savedVenue) {
                setCurrentVenue(savedVenue);
            } else if (data.length > 0) {
                setCurrentVenue(data[0]);
                localStorage.setItem("arena_current_venue_id", data[0].id);
            }
        } catch (err) {
            console.error("Failed to load venues", err);
            setError("Failed to load venues");
        } finally {
            setIsLoading(false);
        }
    };

    const selectVenue = (venueId: string) => {
        const venue = venues.find(v => v.id === venueId);
        if (venue) {
            setCurrentVenue(venue);
            localStorage.setItem("arena_current_venue_id", venueId);
        }
    };

    return (
        <VenueContext.Provider value={{
            venues,
            currentVenue,
            isLoading,
            error,
            selectVenue,
            refreshVenues: loadVenues
        }}>
            {children}
        </VenueContext.Provider>
    );
}

export function useVenue() {
    const context = useContext(VenueContext);
    if (context === undefined) {
        throw new Error("useVenue must be used within a VenueProvider");
    }
    return context;
}
