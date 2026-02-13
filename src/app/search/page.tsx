"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Check, Clock, Filter, MapPin, Search } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const MOCK_CITIES = ["Colombo", "Kandy", "Galle", "Negombo", "Jaffna"];

const MOCK_SEARCH_RESULTS = [
    {
        venue_id: "1",
        venue_name: "Emerald Turf Arena",
        venue_image: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop",
        city: "Colombo",
        distance_km: 2.3,
        rating: 4.8,
        courts: [
            {
                court_id: "c1",
                court_name: "Court A",
                sport: "Futsal",
                hourly_rate: 1800,
                is_indoor: true,
                available_slots: [
                    { start: "18:00", end: "19:00", status: "available" },
                    { start: "19:00", end: "20:00", status: "available" },
                    { start: "20:00", end: "21:00", status: "booked" },
                ]
            },
            {
                court_id: "c2",
                court_name: "Court B",
                sport: "Badminton",
                hourly_rate: 1500,
                is_indoor: true,
                available_slots: [
                    { start: "17:00", end: "18:00", status: "available" },
                    { start: "18:00", end: "19:00", status: "booked" },
                ]
            }
        ]
    },
    {
        venue_id: "2",
        venue_name: "Neon Sky Court",
        venue_image: "https://images.unsplash.com/photo-1505666287802-9311e90be4c9?q=80&w=2671&auto=format&fit=crop",
        city: "Kandy",
        distance_km: 5.1,
        rating: 4.5,
        courts: [
            {
                court_id: "c3",
                court_name: "Center Court",
                sport: "Basketball",
                hourly_rate: 2200,
                is_indoor: false,
                available_slots: [
                    { start: "16:00", end: "17:00", status: "available" },
                    { start: "17:00", end: "18:00", status: "available" },
                ]
            }
        ]
    },
    {
        venue_id: "3",
        venue_name: "Royal Sports Complex",
        venue_image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop",
        city: "Colombo",
        distance_km: 1.2,
        rating: 4.9,
        courts: [
            {
                court_id: "c4",
                court_name: "Tennis Court 1",
                sport: "Tennis",
                hourly_rate: 3500,
                is_indoor: false,
                available_slots: [
                    { start: "07:00", end: "08:00", status: "available" },
                    { start: "08:00", end: "09:00", status: "booked" },
                ]
            }
        ]
    }
];


import { Suspense } from "react";

function SearchContent() {
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedCity, setSelectedCity] = useState("Colombo");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today
    const [selectedSport, setSelectedSport] = useState("All");

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".filter-sidebar",
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".venue-card",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Simple filtering logic
    const filteredResults = MOCK_SEARCH_RESULTS.filter(venue => {
        const matchCity = selectedCity === "All" || venue.city === selectedCity;
        const matchSport = selectedSport === "All" || venue.courts.some(c => c.sport === selectedSport);
        return matchCity && matchSport;
    });

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                        Find Your <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">Court</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl">Search for available slots, filter by sport, and book instantly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* -- Sidebar Filter -- */}
                    <aside className="filter-sidebar lg:col-span-1 space-y-6">
                        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                                <Filter className="h-5 w-5 text-emerald-500" />
                                Filters
                            </div>

                            {/* City Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Cities</option>
                                    {MOCK_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Sport Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Sport</label>
                                <div className="space-y-2">
                                    {["All", "Futsal", "Badminton", "Basketball", "Tennis", "Cricket"].map(sport => (
                                        <button
                                            key={sport}
                                            onClick={() => setSelectedSport(sport)}
                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSport === sport
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                                }`}
                                        >
                                            {sport}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400">
                                Apply Filters
                            </Button>
                        </div>
                    </aside>

                    {/* -- Results Grid -- */}
                    <div className="lg:col-span-3 space-y-6">
                        {filteredResults.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-zinc-500 text-lg">No venues found matching your criteria.</p>
                                <button
                                    onClick={() => { setSelectedCity("All"); setSelectedSport("All"); }}
                                    className="mt-4 text-emerald-500 hover:underline"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            filteredResults.map((venue) => (
                                <div key={venue.venue_id} className="venue-card group rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                                    <div className="grid md:grid-cols-3 gap-0">
                                        {/* Image */}
                                        <div className="relative h-48 md:h-auto overflow-hidden">
                                            <Image
                                                src={venue.venue_image}
                                                alt={venue.venue_name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                                {venue.distance_km} km away
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="md:col-span-2 p-6 md:p-8">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-1">{venue.venue_name}</h3>
                                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                        <MapPin className="h-4 w-4 text-emerald-500" />
                                                        {venue.city}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                                    <span className="text-yellow-500 font-bold text-sm">★ {venue.rating}</span>
                                                </div>
                                            </div>

                                            {/* Courts List */}
                                            <div className="space-y-4">
                                                {venue.courts.map(court => (
                                                    <div key={court.court_id} className="bg-black/20 rounded-xl p-4 border border-zinc-800/50">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div>
                                                                <h4 className="text-white font-bold text-sm">{court.court_name}</h4>
                                                                <span className="text-xs text-zinc-500">{court.sport} • {court.is_indoor ? "Indoor" : "Outdoor"}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-emerald-400 font-bold">LKR {court.hourly_rate}</span>
                                                                <span className="text-zinc-600 text-xs">/hr</span>
                                                            </div>
                                                        </div>

                                                        {/* Slots Grid */}
                                                        <div className="flex flex-wrap gap-2">
                                                            {court.available_slots.map((slot, idx) => {
                                                                const isAvailable = slot.status === "available";
                                                                return (
                                                                    <Link
                                                                        key={idx}
                                                                        href={isAvailable ? `/checkout?court_id=${court.court_id}&date=${selectedDate}&start=${slot.start}&end=${slot.end}` : '#'}
                                                                        className={`
                                                                            px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                                                            ${isAvailable
                                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black cursor-pointer"
                                                                                : "bg-zinc-800/50 border-zinc-800 text-zinc-600 cursor-not-allowed"}
                                                                        `}
                                                                    >
                                                                        {slot.start}
                                                                    </Link>
                                                                )
                                                            })}
                                                            <span className="text-xs text-zinc-600 self-center pl-1">+ More</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 flex justify-end">
                                                <Link href={`/venues/${venue.venue_id}`} className="text-sm font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1">
                                                    View Venue Details <Search className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

