"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/services/api";
import { Sport, SearchParams } from "@/types";
import { useToast } from "@/components/ui/Toast";
import {
    MapPin,
    Calendar,
    Clock,
    Search,
    Navigation,
    ChevronDown,
    Loader2,
    Sparkles,
    Building
} from "lucide-react";
import { City } from "@/types";

const TIME_SLOTS = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];


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
    const [location, setLocation] = useState("All Locations");
    const [useMyLocation, setUseMyLocation] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoadingSports(false);
                setLoadingCities(false);
            }
        };
        loadInitialData();
    }, []);

    const handleSearch = () => {
        setIsSearching(true);
        try {
            const isAllLocations = location.toLowerCase() === "all locations";
            
            // Backend validation: Search requires city OR geolocation
            if (isAllLocations && !useMyLocation) {
                addToast("Please select a specific city or use 'Live' location to search.", "warning");
                setIsSearching(false);
                return;
            }

            // Find the actual sport slug
            const sportObj = sports.find(s => s.name === selectedSport);
            const sportSlug = sportObj?.slug || selectedSport.toLowerCase().replace(/\s+/g, '-');

            const params: SearchParams = {
                sport: sportSlug === "all" ? undefined : sportSlug,
                city: isAllLocations ? undefined : location,
                date: selectedDate,
                start_time: startTime,
                end_time: endTime,
                lat: useMyLocation && userLocation ? userLocation.lat : undefined,
                lng: useMyLocation && userLocation ? userLocation.lng : undefined,
                radius_km: useMyLocation ? 5 : undefined, // Default radius if using location
            };

            // Basic validation
            if (!params.sport) {
                addToast("Please select a sport", "error");
                setIsSearching(false);
                return;
            }

            onSearch(params);
        } catch (error) {
            console.error("Search preparation failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative">
            {/* Animated background effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-emerald-500/5 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-emerald-500/8 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Main Panel */}
            <div className="relative container mx-auto px-3 md:px-4">
                <div
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl p-5 md:p-6"
                    style={{
                        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 60px -20px rgba(80, 200, 120, 0.15)'
                    }}
                >
                    {/* Animated gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-50 pointer-events-none"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(80, 200, 120, 0.1), transparent)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 3s ease-in-out infinite'
                        }}
                    />

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 via-transparent to-emerald-900/10 pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 space-y-5 md:space-y-4">

                        {/* Header - Better mobile layout */}
                        <div className="flex flex-col gap-1 pb-4 border-b border-zinc-800/50">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
                                    <Sparkles className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h1 className="text-2xl md:text-2xl font-bold text-white">
                                    Find Your{' '}
                                    <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent animate-gradient">
                                        Court
                                    </span>
                                </h1>
                            </div>
                            <p className="text-sm text-zinc-400 ml-0.5">
                                Select • Pick time • Book instantly
                            </p>
                        </div>

                        {/* Section 1: SELECT SPORT - Grid layout showing all sports */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
                                SELECT SPORT
                            </h3>

                            {loadingSports ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-2 md:gap-3">
                                    {sports.map((sport, index) => {
                                        const isSelected = selectedSport === sport.name;

                                        return (
                                            <button
                                                key={sport.id}
                                                onClick={() => setSelectedSport(sport.name)}
                                                className={`
                                                    group relative flex flex-col items-center justify-center gap-1.5 p-2.5 md:p-2 rounded-xl
                                                    border transition-all duration-300 ease-out
                                                    transform hover:scale-105 active:scale-95
                                                    ${isSelected
                                                        ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500 shadow-[0_0_20px_rgba(80,200,120,0.3)]'
                                                        : 'bg-zinc-800/50 border-zinc-700/50 hover:border-emerald-500/50 hover:bg-zinc-800/60'
                                                    }
                                                `}
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                    animation: 'fadeInUp 0.4s ease-out forwards',
                                                    opacity: 0
                                                }}
                                            >
                                                {/* Glow ring on selected */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 rounded-xl bg-emerald-500/10 animate-pulse" />
                                                )}

                                                {/* Sport Image */}
                                                <div className={`
                                                    relative w-10 h-10 md:w-10 md:h-10 rounded-full overflow-hidden
                                                    transition-all duration-300
                                                    ${isSelected
                                                        ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-900'
                                                        : 'group-hover:ring-2 group-hover:ring-zinc-600 group-hover:ring-offset-1 group-hover:ring-offset-zinc-900'
                                                    }
                                                `}>
                                                    <Image
                                                        src={sport.imageUrl}
                                                        alt={sport.name}
                                                        fill
                                                        className={`
                                                            object-cover transition-all duration-300
                                                            ${isSelected ? 'scale-110 brightness-110' : 'group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0'}
                                                        `}
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-emerald-500/20" />
                                                    )}
                                                </div>

                                                {/* Sport Name */}
                                                <span
                                                    className={`
                                                        text-[9px] md:text-[10px] font-semibold transition-all duration-300 text-center leading-tight truncate w-full
                                                        ${isSelected ? 'text-emerald-300' : 'text-zinc-400 group-hover:text-white'}
                                                    `}
                                                >
                                                    {sport.name}
                                                </span>

                                                {/* Selection indicator */}
                                                {isSelected && (
                                                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Section 2: DATE & TIME - Stacked on mobile */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">2</span>
                                DATE & TIME
                            </h3>

                            {/* Mobile: Stacked layout, Desktop: Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Date Picker */}
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-700/50">
                                        <Calendar className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={`
                                            w-full bg-zinc-800/70 border border-zinc-700/50 rounded-xl py-3.5 md:py-2.5 pl-12 pr-3
                                            text-white text-sm font-medium
                                            focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                                            hover:border-zinc-600
                                            transition-all duration-200
                                            [color-scheme:dark]
                                        `}
                                    />
                                </div>

                                {/* Time row on mobile */}
                                <div className="grid grid-cols-2 gap-3 md:contents">
                                    {/* Start Time */}
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-700/50">
                                            <Clock className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <select
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className={`
                                                w-full appearance-none bg-zinc-800/70 border border-zinc-700/50 rounded-xl
                                                py-3.5 md:py-2.5 pl-12 pr-8 text-white text-sm font-medium
                                                focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                                                hover:border-zinc-600
                                                transition-all duration-200 cursor-pointer
                                            `}
                                        >
                                            {TIME_SLOTS.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>

                                    {/* End Time */}
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-700/50">
                                            <Clock className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <select
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className={`
                                                w-full appearance-none bg-zinc-800/70 border border-zinc-700/50 rounded-xl
                                                py-3.5 md:py-2.5 pl-12 pr-8 text-white text-sm font-medium
                                                focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                                                hover:border-zinc-600
                                                transition-all duration-200 cursor-pointer
                                            `}
                                        >
                                            {TIME_SLOTS.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: LOCATION */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
                                LOCATION <span className="text-zinc-600 font-normal lowercase">(optional)</span>
                            </h3>

                            <div className="flex gap-3">
                                {/* Location Dropdown */}
                                <div className="relative flex-1 group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-700/50">
                                        <MapPin className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={loadingCities}
                                        className={`
                                            w-full appearance-none bg-zinc-800/70 border border-zinc-700/50 rounded-xl
                                            py-3.5 md:py-2.5 pl-12 pr-10 text-white text-sm font-medium
                                            focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                                            hover:border-zinc-600
                                            transition-all duration-200 cursor-pointer disabled:opacity-50
                                        `}
                                    >
                                        <option value="All Locations">All Locations</option>
                                        {availableCities.map(city => (
                                            <option key={city.name} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>

                                {/* Live Location Button */}
                                <button
                                    onClick={() => setUseMyLocation(!useMyLocation)}
                                    className={`
                                        flex items-center justify-center gap-2 px-4 py-3.5 md:py-2.5 rounded-xl border transition-all duration-300
                                        transform hover:scale-105 active:scale-95 min-w-[48px]
                                        ${useMyLocation
                                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(80,200,120,0.2)]'
                                            : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400'
                                        }
                                    `}
                                >
                                    <Navigation className={`w-5 h-5 transition-transform duration-300 ${useMyLocation ? 'rotate-45' : ''}`} />
                                    <span className="text-sm font-medium hidden md:inline">Live</span>
                                </button>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className={`
                                    group relative overflow-hidden flex items-center justify-center gap-3
                                    w-full md:w-auto md:ml-auto md:flex px-8 py-4 md:py-3 rounded-2xl md:rounded-xl font-bold text-base md:text-sm
                                    bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500
                                    text-black
                                    shadow-[0_0_25px_rgba(80,200,120,0.4)]
                                    hover:shadow-[0_0_35px_rgba(80,200,120,0.6)]
                                    hover:scale-[1.02]
                                    active:scale-[0.98]
                                    transition-all duration-300 ease-out
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                `}
                            >
                                {/* Animated shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                
                                {isSearching ? (
                                    <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                                ) : (
                                    <Search className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                                )}
                                <span className="relative z-10">{isSearching ? 'Searching...' : 'Search Courts'}</span>
                                
                                {!isSearching && (
                                    <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300">→</span>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Add keyframe animations and custom scrollbar hide */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
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
            `}</style>
        </div>
    );
}
