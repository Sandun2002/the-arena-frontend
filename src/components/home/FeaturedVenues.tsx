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
            <p className="text-zinc-400">Most booked arenas in the last two weeks.</p>
          </div>
          <div className="hidden md:block">
            <Button href="/venues" variant="ghost">View All Venues</Button>
          </div>
        </div>

        <div className="min-h-[440px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden animate-pulse">
                  <div className="h-64 bg-zinc-800" />
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="h-6 bg-zinc-800 rounded w-3/4" />
                      <div className="h-5 bg-zinc-800 rounded w-10" />
                    </div>
                    <div className="mb-4 h-4 bg-zinc-800 rounded w-1/2" />
                    <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
                      <div className="h-5 bg-zinc-800 rounded w-2/5" />
                      <div className="h-4 bg-zinc-800 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {venues.map((venue) => (
                <div key={venue.id} className="w-full">
                  <VenueCard venue={venue} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-10">
              No trending venues found.
            </div>
          )}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Button href="/venues" variant="outline">View All Venues</Button>
        </div>
      </div>
    </section>
  );
}