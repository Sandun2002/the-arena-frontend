"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Venue, Sport, City } from "@/types";
import HeroCarousel from "./HeroCarousel";
import { ChevronDown, Search } from "lucide-react";

export default function Hero() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sports, setSports] = useState<Sport[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const textRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [venueData, sportsData, citiesData] = await Promise.all([
          api.getFeaturedVenues(),
          api.getSports(),
          api.getCities(),
        ]);
        setVenues(venueData);
        setSports(sportsData);
        setCities(citiesData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
        setFiltersLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = () => {
    if (!selectedSport && !selectedCity) {
      router.push("/venues");
      return;
    }
    const params = new URLSearchParams();
    if (selectedSport) params.set("sport_type", selectedSport);
    if (selectedCity) params.set("city", selectedCity);
    router.push(`/venues?${params.toString()}`);
  };

  useGSAP(() => {
    // Animate search bar
    if (searchBarRef.current) {
      gsap.fromTo(searchBarRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 1.6 }
      );
    }

    // Animate scroll indicator
    if (scrollIndicatorRef.current) {
      gsap.fromTo(scrollIndicatorRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out", delay: 2.2 }
      );
    }

    // Animate text with stagger effect
    if (textRef.current) {
      gsap.fromTo(textRef.current.querySelectorAll(".hero-word"),
        { y: 30, opacity: 0, rotateX: -20 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)", delay: 0.9 }
      );

      gsap.fromTo(textRef.current.querySelector(".hero-tagline"),
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 1.3 }
      );
    }
  }, []);

  return (
    <section className="hero-section relative w-full flex flex-col justify-start items-center pt-24 md:pt-28 pb-6 md:pb-20">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-black z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center w-full gap-0">

        {/* 1. CAROUSEL (Top) */}
        <div className="w-full">
          {venues.length > 0 ? (
            <HeroCarousel venues={venues} />
          ) : isLoading ? (
            <div className="h-[180px] md:h-[260px] w-full flex items-center justify-center text-zinc-600">
              Loading Arenas...
            </div>
          ) : null}
        </div>

        {/* 2. TEXT (Middle) */}
        <div ref={textRef} className="text-center max-w-2xl perspective-[1000px] mt-4 md:mt-6 px-2">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter text-white mb-1 md:mb-2 flex flex-wrap justify-center gap-x-2 md:gap-x-3">
            <span className="hero-word inline-block">WHERE</span>
            <span className="hero-word inline-block text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text">CHAMPIONS</span>
            <span className="hero-word inline-block">PLAY</span>
          </h1>
          <p className="hero-tagline text-zinc-400 text-xs sm:text-sm md:text-base">
            Discover and book Sri Lanka&apos;s most premium sports venues instantly.
          </p>
        </div>

        {/* 3. QUICK SEARCH BAR (Bottom) */}
        <div ref={searchBarRef} className="w-full max-w-2xl mt-6 md:mt-8 opacity-0">
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-3 md:p-4">
            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              {/* Sport Dropdown */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <span className="text-lg">⚽</span>
                </div>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  disabled={filtersLoading}
                  className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl pl-10 pr-10 py-3 text-white text-sm appearance-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer hover:border-zinc-600"
                >
                  <option value="">Select Sport</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.slug}>
                      {sport.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* City Dropdown */}
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <span className="text-lg">🏙</span>
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={filtersLoading}
                  className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl pl-10 pr-10 py-3 text-white text-sm appearance-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer hover:border-zinc-600"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={filtersLoading || !selectedSport || !selectedCity}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-black font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(80,200,120,0.4)] hover:scale-[1.02] transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/30 before:to-white/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Find Courts</span>
                  <span className="sm:hidden">Search</span>
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll Indicator - desktop only */}
      <div ref={scrollIndicatorRef} className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 opacity-0 z-20">
        <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-zinc-600 flex items-start justify-center p-1">
          <div className="w-1 h-1.5 bg-emerald-400 rounded-full animate-scroll" />
        </div>
      </div>

    </section>
  );
}