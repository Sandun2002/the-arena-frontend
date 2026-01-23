"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/services/api";
import { Venue } from "@/types";
import VenueCard from "@/components/ui/VenueCard";
import FilterBar from "@/components/venues/FilterBar";
import { Loader2 } from "lucide-react";

export default function VenuesPage() {
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");

  // 1. Fetch Data on Load
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await api.getVenues(); // Gets all venues
        setAllVenues(data);
      } catch (error) {
        console.error("Error loading venues:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVenues();
  }, []);

  // 2. Filter Logic (Real-time)
  const filteredVenues = useMemo(() => {
    return allVenues.filter((venue) => {
      // Step A: Match Sport
      const matchesSport = selectedSport === "All" || venue.sport === selectedSport;
      
      // Step B: Match Search Text (Name or Location)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        venue.name.toLowerCase().includes(searchLower) || 
        venue.location.toLowerCase().includes(searchLower);

      return matchesSport && matchesSearch;
    });
  }, [allVenues, selectedSport, searchTerm]);

  return (
    <main className="min-h-screen bg-black pt-20 pb-20">
      
      {/* Header Section */}
      <div className="container mx-auto px-4 mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
          Explore <span className="text-emerald-500">Venues</span>
        </h1>
        <p className="text-zinc-400">Find the perfect pitch, court, or gym near you.</p>
      </div>

      {/* Sticky Filter Bar */}
      <FilterBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        selectedSport={selectedSport} 
        setSelectedSport={setSelectedSport} 
      />

      {/* Grid Content */}
      <div className="container mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex h-64 w-full items-center justify-center text-emerald-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-bold text-white mb-2">No venues found</h3>
            <p className="text-zinc-500">
              Try adjusting your search or changing the sport filter.
            </p>
            <button 
              onClick={() => {setSelectedSport("All"); setSearchTerm("");}}
              className="mt-6 text-emerald-500 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}