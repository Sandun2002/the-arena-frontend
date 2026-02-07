"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/services/api";
import { Venue } from "@/types";
import VenueCard from "@/components/ui/VenueCard";
import CourtFinderPanel from "@/components/venues/CourtFinderPanel";
import { Loader2 } from "lucide-react";

export default function VenuesPage() {
    const [allVenues, setAllVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);

    // Filter States
    const [selectedSport, setSelectedSport] = useState("All");

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
    const filteredVenues = useMemo(() => {
        return allVenues.filter((venue) => {
            const matchesSport = selectedSport === "All" || venue.sport === selectedSport;
            return matchesSport;
        });
    }, [allVenues, selectedSport]);

    // Handle search
    const handleSearch = () => {
        setHasSearched(true);
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
                    <CourtFinderPanel
                        selectedSport={selectedSport}
                        setSelectedSport={setSelectedSport}
                        onSearch={handleSearch}
                    />
                </section>

                {/* Results Section */}
                <section id="venue-results" className="pb-20">
                    <div className="container mx-auto px-4">

                        {/* Results Header */}
                        {hasSearched && (
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800/50">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                        Available Courts
                                    </h2>
                                    <p className="text-zinc-500 text-sm">
                                        {loading ? 'Searching...' : `${filteredVenues.length} venues found`}
                                        {selectedSport !== 'All' && ` for ${selectedSport}`}
                                    </p>
                                </div>

                                {/* Clear filters */}
                                {selectedSport !== 'All' && (
                                    <button
                                        onClick={() => setSelectedSport('All')}
                                        className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex h-64 w-full items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto mb-4" />
                                    <p className="text-zinc-500 text-sm">Loading venues...</p>
                                </div>
                            </div>
                        ) : hasSearched && filteredVenues.length > 0 ? (
                            /* Venue Grid */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredVenues.map((venue, index) => (
                                    <div
                                        key={venue.id}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <VenueCard venue={venue} />
                                    </div>
                                ))}
                            </div>
                        ) : hasSearched ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div
                                    className="w-24 h-24 mb-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center"
                                    style={{ boxShadow: '0 0 40px rgba(80, 200, 120, 0.05)' }}
                                >
                                    <span className="text-5xl">🏟️</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No venues found</h3>
                                <p className="text-zinc-500 mb-6 max-w-md">
                                    We couldn&apos;t find any venues matching your criteria. Try adjusting your filters or search for a different sport.
                                </p>
                                <button
                                    onClick={() => setSelectedSport("All")}
                                    className="px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-medium hover:bg-zinc-700 transition-all"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            /* Initial State - Show prompt */
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <p className="text-zinc-500 text-lg">
                                    Select your preferences above and click <span className="text-emerald-400 font-medium">Search Courts</span> to find venues
                                </p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}