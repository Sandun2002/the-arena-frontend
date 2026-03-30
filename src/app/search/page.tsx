"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, MapPin, Search } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import TimePicker from "@/components/ui/TimePicker";
import DatePicker from "@/components/ui/DatePicker";
import { api } from "@/services/api";
import { City, Sport, VenueSearchResult } from "@/types";

function SearchContent() {
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [results, setResults] = useState<VenueSearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "All");
    const [selectedDate, setSelectedDate] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);
    const [selectedSport, setSelectedSport] = useState(searchParams.get("sport") || "All");
    const [startTime, setStartTime] = useState(() => {
        if (searchParams.get("start")) return searchParams.get("start") as string;
        const nextHour = new Date().getHours() + 1;
        return nextHour < 23 ? `${nextHour.toString().padStart(2, '0')}:00` : "22:00";
    });
    const [endTime, setEndTime] = useState(() => {
        if (searchParams.get("end")) return searchParams.get("end") as string;
        const nextHour = new Date().getHours() + 1;
        return nextHour < 23 ? `${(nextHour + 1).toString().padStart(2, '0')}:00` : "23:00";
    });

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".filter-sidebar", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
            gsap.fromTo(".venue-card", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.15 });
        }, containerRef);
        return () => ctx.revert();
    }, [results]);

    const loadFilters = async () => {
        try {
            const [citiesData, sportsData] = await Promise.all([api.getCities(), api.getSports()]);
            setCities(citiesData);
            setSports(sportsData);
            
            // Auto-select first sport if none selected or if "All" is active (to avoid 422 errors)
            if (sportsData.length > 0 && (selectedSport === "All" || !selectedSport)) {
                setSelectedSport(sportsData[0].name);
            }
        } catch (error) {
            console.error("Failed to load filters", error);
        }
    };

    const loadResults = async () => {
        if (selectedCity === "All") {
            setResults([]);
            setLoading(false);
            return;
        }

        setSubmitting(true);
        try {
            // Find the selected sport object to get its backend slug
            const sportObj = sports.find(s => s.name === selectedSport);
            const sportValue = sportObj?.slug || (selectedSport === "All" ? undefined : selectedSport.toLowerCase());

            const response = await api.searchVenues({
                city: selectedCity === "All" ? undefined : selectedCity,
                sport: sportValue,
                date: selectedDate,
                start_time: startTime,
                end_time: endTime,
                page_size: 20,
            });
            setResults(response.results);
        } catch (error) {
            console.error("Search failed", error);
            setResults([]);
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([loadFilters(), loadResults()]).catch(() => {
            setResults([]);
            setLoading(false);
        });
    }, []);

    const sportOptions = useMemo(() => ["All", ...sports.map((sport) => sport.name)], [sports]);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                        Find Your <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">Court</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl">Search live venue availability by sport, city, and time window.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="filter-sidebar lg:col-span-1 space-y-6">
                        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                                <Filter className="h-5 w-5 text-emerald-500" />
                                Filters
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">City</label>
                                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer">
                                    <option value="All">All Cities</option>
                                    {cities.map((city) => <option key={city.name} value={city.name}>{city.name}</option>)}
                                </select>
                            </div>

                            <div className="mb-6">
                                <DatePicker
                                    label="Date"
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    disablePast={true}
                                    placeholder="Select date"
                                />
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-3">
                                {/* Compute if today is selected for past-blocking */}
                                {(() => {
                                    const today = new Date().toISOString().split("T")[0];
                                    const isToday = selectedDate === today;
                                    return (
                                        <>
                                            <div>
                                                <TimePicker
                                                    label="Start"
                                                    value={startTime}
                                                    onChange={setStartTime}
                                                    disablePast={true}
                                                    sameDay={isToday}
                                                />
                                            </div>
                                            <div>
                                                <TimePicker
                                                    label="End"
                                                    value={endTime}
                                                    onChange={setEndTime}
                                                    disablePast={true}
                                                    sameDay={isToday}
                                                />
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Sport</label>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {sportOptions.map((sport) => (
                                        <button
                                            key={sport}
                                            onClick={() => setSelectedSport(sport)}
                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSport === sport ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                                        >
                                            {sport}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={loadResults} disabled={submitting} className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400">
                                {submitting ? "Searching..." : "Apply Filters"}
                            </Button>
                        </div>
                    </aside>

                    <div className="lg:col-span-3 space-y-6">
                        {loading ? (
                            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-10 text-center text-zinc-500">Loading live availability...</div>
                        ) : selectedCity === "All" && results.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-zinc-500 text-lg">Please select a City to view live availability.</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-zinc-500 text-lg">No venues found matching your criteria.</p>
                                <button onClick={() => { setSelectedCity("All"); setSelectedSport("All"); }} className="mt-4 text-emerald-500 hover:underline">Clear Filters</button>
                            </div>
                        ) : (
                            results.map((venue) => {
                                const sportObj = sports.find(s => s.name === selectedSport);
                                const sportValue = sportObj?.slug || (selectedSport === "All" ? "" : selectedSport.toLowerCase());
                                const queryStr = new URLSearchParams({
                                    date: selectedDate,
                                    sport: sportValue,
                                    start: startTime,
                                    end: endTime
                                }).toString();

                                return (
                                <div key={venue.venue_id} className="venue-card group rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                                    <div className="grid md:grid-cols-3 gap-0">
                                        <div className="relative h-48 md:h-auto overflow-hidden bg-zinc-950">
                                            <Image src={venue.cover_image || "/images/placeholder.jpg"} alt={venue.venue_name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                            {venue.distance_km !== null && (
                                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                                    {venue.distance_km.toFixed(1)} km away
                                                </div>
                                            )}
                                        </div>

                                        <div className="md:col-span-2 p-6 md:p-8">
                                            <div className="flex justify-between items-start mb-4 gap-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-1">{venue.venue_name}</h3>
                                                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                                                        <MapPin className="h-4 w-4 text-emerald-500" />
                                                        {venue.city}
                                                    </div>
                                                    <p className="text-sm text-zinc-500">{venue.address}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center justify-end gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                                        <span className="text-yellow-500 font-bold text-sm">★ {(venue.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                    <p className="mt-2 text-xs text-zinc-500">{venue.review_count} reviews</p>
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-3 gap-3 mb-6">
                                                <div className="rounded-xl border border-zinc-800/60 bg-black/20 p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Available Courts</p>
                                                    <p className="mt-2 text-xl font-bold text-white">{venue.available_courts_count}/{venue.total_courts_count}</p>
                                                </div>
                                                <div className="rounded-xl border border-zinc-800/60 bg-black/20 p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Starting Rate</p>
                                                    <p className="mt-2 text-xl font-bold text-emerald-400">LKR {venue.hourly_rate.toLocaleString()}</p>
                                                </div>
                                                <div className="rounded-xl border border-zinc-800/60 bg-black/20 p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Amenities</p>
                                                    <p className="mt-2 text-sm text-zinc-300 line-clamp-2">{venue.amenities.length > 0 ? venue.amenities.join(", ") : "Venue amenities available on details page"}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center gap-4">
                                                <p className="text-xs text-zinc-500">Search window: {selectedDate} · {startTime} - {endTime}</p>
                                                <Link href={`/venues/${venue.venue_id}?${queryStr}`} className="text-sm font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1">
                                                    View Venue Details <Search className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div></div>}>
            <SearchContent />
        </Suspense>
    );
}
