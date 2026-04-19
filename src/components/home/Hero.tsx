"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Venue } from "@/types";
import HeroCarousel from "./HeroCarousel";

export default function Hero() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const venueData = await api.getFeaturedVenues();
        setVenues(venueData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = () => {
    router.push("/venues");
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

        {/* 3. PREMIUM CTA (Bottom) */}
        <div ref={searchBarRef} className="w-full mt-8 md:mt-12 flex justify-center opacity-0 px-4">
          <button
            onClick={handleSearch}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-black font-extrabold text-lg md:text-xl px-10 py-5 rounded-full flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:scale-[1.05] transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/30 before:to-white/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>Book Your Court Now</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            {/* Subtle inner glow / border effect */}
            <div className="absolute inset-0 rounded-full border border-white/20"></div>
          </button>
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