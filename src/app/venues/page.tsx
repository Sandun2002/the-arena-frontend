"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { VenueSearchResult, SearchParams, Sport, City } from "@/types";
import VenueCard from "@/components/ui/VenueCard";
import CourtFinderPanel from "@/components/venues/CourtFinderPanel";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import RequireAuth from "@/components/auth/RequireAuth";

export default function VenuesPage() {
    const { addToast } = useToast();
    const searchParams = useSearchParams();
    const [searchResults, setSearchResults] = useState<VenueSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);
    
    // For auto-selecting from URL params
    const [sports, setSports] = useState<Sport[]>([]);
    const [initialSport, setInitialSport] = useState<string>("All");
    const [initialCity, setInitialCity] = useState<string>("");
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    
    // Load sports and cities to map slugs to names
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [sportsData, citiesData] = await Promise.all([
                    api.getSports(),
                    api.getCities()
                ]);
                setSports(sportsData);
                
                // Read URL params
                const sportTypeSlug = searchParams.get("sport_type");
                const cityName = searchParams.get("city");
                
                // Convert sport slug to sport name for CourtFinderPanel
                if (sportTypeSlug) {
                    const sport = sportsData.find(s => s.slug === sportTypeSlug);
                    if (sport) {
                        setInitialSport(sport.name);
                    }
                }
                
                if (cityName) {
                    setInitialCity(cityName);
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setIsLoadingInit(false);
            }
        };
        loadInitialData();
    }, [searchParams]);

    // Filter Logic
    const handleSearch = async (params: SearchParams) => {
        setHasSearched(true);
        setIsSearching(true);
        setLastSearchParams(params);
        try {
            const response = await api.searchVenues(params);
            setSearchResults(response.results);
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
        <RequireAuth>
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
                        {!isLoadingInit && (
                            <CourtFinderPanel 
                                onSearch={handleSearch}
                                initialSport={initialSport}
                                initialCity={initialCity}
                            />
                        )}
                    </div>
                </section>

                {/* Results Section */}
                <section id="venue-results" className="pb-20">
                    <div className="container mx-auto px-4">

                        {/* Results Count */}
                        {hasSearched && (
                            <div className="mb-8 flex items-center justify-between">
                                <p className="text-secondary">
                                    Found <span className="text-primary font-bold">{searchResults.length}</span> venues matching your criteria
                                </p>
                            </div>
                        )}

                        {isSearching ? (
                            /* Loading States */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-surface-raised/50 border border-default rounded-3xl h-[400px] animate-pulse" />
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
                                <div className="w-20 h-20 bg-surface-raised rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-faint" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">No venues found</h3>
                                <p className="text-muted max-w-md">
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
                            /* Initial State - Search Prompt */
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-surface-raised rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-faint" />
                                </div>
                                <h3 className="text-2xl font-black text-primary mb-3 uppercase tracking-tight">Find Your Court</h3>
                                <p className="text-muted max-w-md">
                                    Choose a sport, pick a date, and enter your city above to discover available venues near you.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </main>
        </RequireAuth>
    );
}