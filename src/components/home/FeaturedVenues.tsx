"use client";

import { useEffect, useState } from "react";
import { Venue } from "@/types";
import { api } from "@/services/api";
import VenueCard from "@/components/ui/VenueCard";
import Button from "@/components/ui/Button";

export default function FeaturedVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        // Fetch only trending venues
        const data = await api.getTrendingVenues();
        setVenues(data);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Trending <span className="text-emerald-500">Arenas</span>
            </h2>
            <p className="text-zinc-400">Hand-picked premium venues near you.</p>
          </div>
          <div className="hidden md:block">
            <Button href="/venues" variant="ghost">View All Venues</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden animate-pulse">
                <div className="h-64 bg-zinc-800" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                  <div className="h-4 bg-zinc-800 rounded w-1/3 mt-4" />
                </div>
              </div>
            ))
          ) : (
            venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))
          )}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Button href="/venues" variant="outline">View All Venues</Button>
        </div>
      </div>
    </section>
  );
}