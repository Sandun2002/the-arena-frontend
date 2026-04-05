"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/services/api";
import { Sport, SearchParams, City } from "@/types";
import { useToast } from "@/components/ui/Toast";
import TimePicker from "@/components/ui/TimePicker";
import DatePicker from "@/components/ui/DatePicker";
import CityCombobox from "@/components/ui/CityCombobox";
import {
    MapPin,
    Search,
    Navigation,
    Loader2,
    Sparkles,
    Locate,
    Check
} from "lucide-react";

interface CourtFinderPanelProps {
    onSearch: (params: SearchParams) => void;
    initialSport?: string;
}

export default function CourtFinderPanel({ onSearch, initialSport = "All" }: CourtFinderPanelProps) {
    const { addToast } = useToast();
    // Dynamic sports from API
    const [sports, setSports] = useState<Sport[]>([]);
    const [loadingSports, setLoadingSports] = useState(true);

    const [selectedSport, setSelectedSport] = useState(initialSport);
    const [selectedDate, setSelectedDate] = useState("");
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("11:00");
    const [location, setLocation] = useState("");
    const [useMyLocation, setUseMyLocation] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [searchRadius, setSearchRadius] = useState<number>(5);
    const [isSearching, setIsSearching] = useState(false);
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [loadingCities, setLoadingCities] = useState(true);

    // Fetch sports and cities on mount
    useEffect(() => {
        // Set deterministic client-side dates
        const now = new Date();
        setSelectedDate(now.toISOString().split('T')[0]);
        
        const nextHour = now.getHours() + 1;
        if (nextHour < 23) {
            setStartTime(`${nextHour.toString().padStart(2, '0')}:00`);
            setEndTime(`${(nextHour + 1).toString().padStart(2, '0')}:00`);
        } else {
            setStartTime("22:00");
            setEndTime("23:00");
        }

        const loadInitialData = async () => {
            try {
                const [sportsData, citiesData] = await Promise.all([
                    api.getSports(),
                    api.getCities()
                ]);
                setSports(sportsData);
                setAvailableCities(citiesData);
                // Default to first city
                if (citiesData.length > 0) {
                    setLocation(citiesData[0].name);
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoadingSports(false);
                setLoadingCities(false);
            }
        };
        loadInitialData();
    }, []);

    // Handle Live location toggle
    const handleToggleLiveLocation = () => {
        // Guard: prevent double-click/tap
        if (fetchingLocation) return;

        if (useMyLocation) {
            setUseMyLocation(false);
            setUserLocation(null);
            if (availableCities.length > 0 && !location) {
                setLocation(availableCities[0].name);
            }
            return;
        }

        if (!navigator.geolocation) {
            addToast("Geolocation is not supported by your browser.", "error");
            return;
        }


        setFetchingLocation(true);

        // Chrome/Windows dual-callback guard: delay error so success can cancel it
        let succeeded = false;
        let errorTimer: ReturnType<typeof setTimeout> | null = null;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                succeeded = true;
                if (errorTimer) clearTimeout(errorTimer);
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setUseMyLocation(true);
                setFetchingLocation(false);
                addToast(`Location detected! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, "success");
            },
            (error) => {
                errorTimer = setTimeout(() => {
                    if (succeeded) return;
                    setFetchingLocation(false);
                    if (error.code === 1) {
                        addToast("Location blocked. Click the 🔒 icon in your address bar to enable it.", "error");
                    } else {
                        addToast("Could not detect your location. Please select a city instead.", "error");
                    }
                }, 2000);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 600000 }
        );
    };

    const handleSearch = () => {
        setIsSearching(true);
        try {
            // Find the actual sport slug
            const sportObj = sports.find(s => s.name === selectedSport);
            const sportSlug = sportObj?.slug || selectedSport.toLowerCase().replace(/\s+/g, '-');

            // Basic validation
            if (!sportSlug || sportSlug === "all") {
                addToast("Please select a sport", "error");
                setIsSearching(false);
                return;
            }

            // Location validation: must have city OR live location
            if (useMyLocation && !userLocation) {
                addToast("Still fetching your location. Please wait.", "warning");
                setIsSearching(false);
                return;
            }

            if (!useMyLocation && !location) {
                addToast("Please select a city or use your live location.", "warning");
                setIsSearching(false);
                return;
            }

            const params: SearchParams = {
                sport: sportSlug,
                city: useMyLocation ? undefined : location,
                date: selectedDate,
                start_time: startTime,
                end_time: endTime,
                lat: useMyLocation && userLocation ? userLocation.lat : undefined,
                lng: useMyLocation && userLocation ? userLocation.lng : undefined,
                radius_km: useMyLocation ? searchRadius : undefined,
                sort_by: useMyLocation ? "nearest" : undefined,
            };

            onSearch(params);
        } catch (error) {
            console.error("Search preparation failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative z-10 w-full max-w-[1000px] mx-auto">
            {/* Animated background effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-teal-500/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Main Panel */}
            <div className="relative px-3 md:px-0">
                <div
                    className="relative overflow-hidden rounded-[24px] border border-zinc-700/30 bg-zinc-900/80 backdrop-blur-2xl p-5 md:p-8"
                    style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 80px -20px rgba(80, 200, 120, 0.12)'
                    }}
                >
                    {/* Top emerald accent stripe */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/60 via-teal-400/40 to-emerald-600/60" />

                    {/* Subtle inner gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-emerald-950/5 pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 space-y-6 md:space-y-8">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800/40">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(80,200,120,0.2)]">
                                        <Sparkles className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                                        Find Your{' '}
                                        <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent animate-gradient">
                                            Court
                                        </span>
                                    </h1>
                                </div>
                                <p className="text-sm text-zinc-400 ml-1 mt-1 font-medium">
                                    Select • Pick time • Book instantly
                                </p>
                            </div>

                            {/* Progress Dots */}
                            <div className="flex items-center gap-1.5 ml-1 md:ml-0">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(80,200,120,0.6)]" />
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            </div>
                        </div>

                        {/* Section 1: SELECT SPORT */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-zinc-400 tracking-[0.2em] uppercase flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/15 text-emerald-400 flex items-center justify-center text-[11px] font-bold shadow-inner shadow-emerald-500/20">1</span>
                                SELECT SPORT
                            </h3>

                            {loadingSports ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                </div>
                            ) : (
                                <div className="flex md:grid md:grid-cols-5 gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
                                    {sports.map((sport, index) => {
                                        const isSelected = selectedSport === sport.name;

                                        return (
                                            <button
                                                key={sport.id}
                                                onClick={() => setSelectedSport(sport.name)}
                                                className={`
                                                    group relative flex-shrink-0 snap-start flex flex-col justify-end w-[110px] h-[100px] md:w-auto md:h-[110px] rounded-xl overflow-hidden
                                                    transition-all duration-300 ease-out text-left
                                                    transform active:scale-95
                                                    ${isSelected
                                                        ? 'border-2 border-emerald-500 shadow-[0_0_20px_rgba(80,200,120,0.35)]'
                                                        : 'border border-zinc-700/50 hover:border-zinc-500/60 hover:scale-[1.03] shadow-lg shadow-black/20'
                                                    }
                                                `}
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                    animation: 'tileReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                                    opacity: 0
                                                }}
                                            >
                                                {/* Full bleed image */}
                                                <Image
                                                    src={sport.imageUrl}
                                                    alt={sport.name}
                                                    fill
                                                    className={`
                                                        object-cover transition-all duration-500 ease-out
                                                        ${isSelected ? 'brightness-110 scale-105' : 'group-hover:scale-[1.08] brightness-90 group-hover:brightness-105'}
                                                    `}
                                                    sizes="(max-width: 768px) 110px, 20vw"
                                                />
                                                
                                                {/* Gradient Overlay */}
                                                <div className={`
                                                    absolute inset-0 transition-opacity duration-300
                                                    ${isSelected 
                                                        ? 'bg-gradient-to-t from-emerald-900/90 via-emerald-900/40 to-transparent' 
                                                        : 'bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/80'
                                                    }
                                                `} />

                                                {/* Checkmark Badge */}
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 z-20 animate-fade-in">
                                                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                                                    </div>
                                                )}

                                                {/* Sport Name */}
                                                <span
                                                    className={`
                                                        relative z-10 px-3 pb-2.5 text-xs md:text-sm font-bold transition-all duration-300 leading-tight truncate w-full text-shadow-sm
                                                        ${isSelected ? 'text-emerald-300' : 'text-white'}
                                                    `}
                                                >
                                                    {sport.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Section 2: DATE & TIME */}
                        <div className="space-y-4 pt-5 border-t border-zinc-800/40">
                            <h3 className="text-xs font-bold text-zinc-400 tracking-[0.2em] uppercase flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/15 text-emerald-400 flex items-center justify-center text-[11px] font-bold shadow-inner shadow-emerald-500/20">2</span>
                                DATE & TIME
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                <div className="shadow-inner shadow-black/20 rounded-xl">
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={setSelectedDate}
                                        disablePast={true}
                                        placeholder="Select date"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:contents">
                                    {(() => {
                                        const today = new Date().toISOString().split("T")[0];
                                        const isToday = selectedDate === today;
                                        return (
                                            <>
                                                <div className="shadow-inner shadow-black/20 rounded-xl">
                                                    <TimePicker
                                                        value={startTime}
                                                        onChange={setStartTime}
                                                        disablePast={true}
                                                        sameDay={isToday}
                                                    />
                                                </div>
                                                <div className="shadow-inner shadow-black/20 rounded-xl">
                                                    <TimePicker
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
                            </div>
                        </div>

                        {/* Section 3: LOCATION */}
                        <div className="space-y-4 pt-5 border-t border-zinc-800/40">
                            <h3 className="text-xs font-bold text-zinc-400 tracking-[0.2em] uppercase flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/15 text-emerald-400 flex items-center justify-center text-[11px] font-bold shadow-inner shadow-emerald-500/20">3</span>
                                LOCATION
                            </h3>

                            <div className="flex gap-3 md:gap-4">
                                {/* City Combobox — disabled when live location is active */}
                                <div className="flex-1">
                                    <CityCombobox
                                        cities={availableCities}
                                        value={location}
                                        onChange={setLocation}
                                        loading={loadingCities}
                                        disabled={useMyLocation}
                                        placeholder="Select a city..."
                                    />
                                </div>

                                {/* Live Location Button */}
                                <button
                                    onClick={handleToggleLiveLocation}
                                    disabled={fetchingLocation}
                                    className={`
                                        flex items-center justify-center gap-2 px-5 py-4 md:py-3.5 rounded-xl border transition-all duration-300
                                        transform active:scale-95 min-w-[56px] shadow-lg
                                        ${fetchingLocation
                                            ? 'bg-zinc-800/80 border-zinc-700/50 text-zinc-400 cursor-wait'
                                            : useMyLocation
                                                ? 'bg-gradient-to-br from-emerald-500/25 to-teal-500/15 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10'
                                                : 'bg-zinc-800/80 border-zinc-700/50 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-zinc-800'
                                        }
                                    `}
                                >
                                    {fetchingLocation ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Locate className={`w-5 h-5 transition-all duration-300 ${useMyLocation ? 'text-emerald-400' : ''}`} />
                                    )}
                                    <span className="text-sm font-bold hidden md:inline">
                                        {fetchingLocation ? 'Locating...' : useMyLocation ? 'Live ✓' : 'Live'}
                                    </span>
                                </button>
                            </div>

                            {/* Radius selector — visible when live location is active */}
                            {useMyLocation && userLocation && (
                                <div className="flex items-center gap-3 animate-fade-in">
                                    <span className="text-xs text-zinc-400 font-medium">Radius:</span>
                                    <div className="flex gap-2">
                                        {[2, 5, 10].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setSearchRadius(r)}
                                                className={`
                                                    px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                                                    ${searchRadius === r
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(80,200,120,0.15)]'
                                                        : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 hover:text-white hover:border-zinc-600'
                                                    }
                                                `}
                                            >
                                                {r} km
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[11px] text-zinc-500 ml-auto hidden md:block">
                                        📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Search Action */}
                        <div className="pt-6 mt-2 border-t border-zinc-800/30">
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className={`
                                    group relative overflow-hidden flex items-center justify-center gap-3
                                    w-full px-8 py-4 md:py-4 rounded-xl font-bold text-base
                                    bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500
                                    text-black
                                    shadow-[0_0_25px_rgba(80,200,120,0.3)]
                                    hover:shadow-[0_0_40px_rgba(80,200,120,0.5)]
                                    hover:scale-[1.01]
                                    active:scale-[0.98]
                                    transition-all duration-300 ease-out
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                `}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                                
                                {isSearching ? (
                                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                                ) : (
                                    <Search className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                                )}
                                <span className="relative z-10">{isSearching ? 'Searching...' : 'Search Courts'}</span>
                                
                                {!isSearching && (
                                    <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">→</span>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes tileReveal {
                    from {
                        opacity: 0;
                        transform: translateY(12px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes shimmer {
                    0%, 100% { background-position: -200% 0; }
                    50% { background-position: 200% 0; }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% auto;
                    animation: gradient 3s ease infinite;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .text-shadow-sm {
                    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
