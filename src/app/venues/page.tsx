"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/services/api";
import { Sport, Venue, VenueSearchResult, SearchParams } from "@/types";
import VenueCard from "@/components/ui/VenueCard";
import CourtFinderPanel from "@/components/venues/CourtFinderPanel";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function VenuesPage() {
    const { addToast } = useToast();
    const [allVenues, setAllVenues] = useState<Venue[]>([]);
    const [searchResults, setSearchResults] = useState<VenueSearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedSport, setSelectedSport] = useState("All");
    const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

    // 1. Fetch Data on Load
    useEffect(() => {
        const loadVenues = async () => {
            try {
                const data = await api.getVenues();
                setAllVenues(data);
            } catch (error) {
                console.error("Error loading venues:", error);
            } finally {
                setLoading(false);
            }
        };
        loadVenues();
    }, []);

    // 2. Filter Logic
    const handleSearch = async (params: SearchParams) => {
        setHasSearched(true);
        setIsSearching(true);
        setLastSearchParams(params);
        try {
            const response = await api.searchVenues(params);
            setSearchResults(response.results);
            if (params.sport) {
                // Keep selected sport in sync if it was passed in params
                const sportObj = await api.getSports().then(sports => sports.find(s => s.slug === params.sport));
                if (sportObj) setSelectedSport(sportObj.name);
            }
        } catch (error: any) {
            console.error("Search failed:", error);
            const errorMessage = error.response?.data?.detail 
                ? (typeof error.response.data.detail === 'string' ? error.response.data.detail : error.response.data.detail[0]?.msg)
                : "Search failed. Please try again.";
            addToast(errorMessage, "error");
        } finally {
            setIsSearching(false);
        }
        // Scroll to results
        const resultsSection = document.getElementById('venue-results');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(80, 200, 120, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(80, 200, 120, 0.3) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* Top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />

                {/* Bottom ambient */}
                <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-emerald-900/10 rounded-full blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10">

                {/* Court Finder Panel - Compact layout, straight to action */}
                <section className="pt-24 md:pt-28 pb-8 md:pb-12">
                    <div className="max-w-5xl mx-auto mb-16 px-4">
                        <CourtFinderPanel 
                            onSearch={handleSearch}
                            initialSport={selectedSport}
                        />
                    </div>
                </section>

                {/* Results Section */}
                <section id="venue-results" className="pb-20">
                    <div className="container mx-auto px-4">

                        {/* Results Count */}
                        {hasSearched && (
                            <div className="mb-8 flex items-center justify-between">
                                <p className="text-zinc-400">
                                    Found <span className="text-white font-bold">{searchResults.length}</span> venues matching your criteria
                                </p>
                            </div>
                        )}

                        {loading || isSearching ? (
                            /* Loading States */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl h-[400px] animate-pulse" />
                                ))}
                            </div>
                        ) : hasSearched && searchResults.length > 0 ? (
                            /* Venue Grid from Search Results */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {searchResults.map((result) => (
                                    <VenueCard 
                                        key={result.venue_id} 
                                        venue={{
                                            id: result.venue_id,
                                            name: result.venue_name,
                                            city: result.city,
                                            address: result.address,
                                            rating: result.rating || 0,
                                            review_count: result.review_count,
                                            cover_image: result.cover_image,
                                            min_hourly_rate: result.hourly_rate,
                                            amenities: result.amenities.map(a => ({ id: a, name: a })),
                                            slug: result.venue_slug,
                                            description: null,
                                            // Fill defaults for other fields needed by VenueCard
                                            is_verified: true,
                                            is_active: true,
                                            is_featured: false,
                                            gallery_images: [],
                                            courts: [],
                                            operating_hours: [],
                                            owner_id: "",
                                            phone_contact: "",
                                            status: "active",
                                            geo_lat: null,
                                            geo_lng: null,
                                            suspended_at: null,
                                            deleted_at: null
                                        }} 
                                        searchParams={lastSearchParams}
                                    />
                                ))}
                            </div>
                        ) : hasSearched ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-zinc-700" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No venues found</h3>
                                <p className="text-zinc-500 max-w-md">
                                    We couldn't find any venues matching your criteria. Try adjusting your filters or location.
                                </p>
                                <button 
                                    onClick={() => setHasSearched(false)}
                                    className="mt-6 text-emerald-400 font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            /* Initial State - Show All Venues or Prompt */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {allVenues.slice(0, 6).map((venue) => (
                                    <VenueCard key={venue.id} venue={venue} />
                                ))}
                                {allVenues.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-zinc-500">
                                        Select your preferences above to find venues
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}