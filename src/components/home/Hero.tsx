"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { api } from "@/services/api";
import { Venue } from "@/types";
import HeroCarousel from "./HeroCarousel";
import Button from "@/components/ui/Button";
import { useEffect } from "react";

export default function Hero() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getFeaturedVenues();
        setVenues(data);
      } catch (error) {
        console.error("Failed to load venues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useGSAP(() => {
    // Animate button with bounce effect
    if (buttonRef.current) {
      gsap.fromTo(buttonRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)", delay: 1.5 }
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
    <section className="relative w-full flex flex-col justify-start items-center pt-24 md:pt-28 pb-20" style={{ minHeight: 'calc(100vh - 80px)' }}>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-black z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
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

        {/* 3. PREMIUM BUTTON (Bottom) */}
        <div ref={buttonRef} className="flex flex-col items-center mt-4 md:mt-5">
          <Button
            href="/venues"
            className="
              group relative overflow-hidden
              text-sm sm:text-base md:text-lg 
              px-8 sm:px-10 md:px-12 
              py-3 sm:py-4 md:py-5
              bg-gradient-to-r from-emerald-400 to-emerald-500 
              text-black font-black tracking-wider uppercase
              rounded-full
              shadow-[0_0_30px_rgba(80,200,120,0.4)]
              hover:shadow-[0_0_50px_rgba(80,200,120,0.6)]
              hover:scale-105
              transition-all duration-300 ease-out
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/30 before:to-white/0
              before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
            "
          >
            <span className="relative z-10 flex items-center gap-2">
              BOOK NOW
              <svg
                className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div ref={scrollIndicatorRef} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-0 z-20">
        <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-zinc-600 flex items-start justify-center p-1">
          <div className="w-1 h-1.5 bg-emerald-400 rounded-full animate-scroll" />
        </div>
      </div>

    </section>
  );
}