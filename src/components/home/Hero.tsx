"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Venue } from "@/types";
import HeroCarousel from "./HeroCarousel";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

export default function Hero() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getTrendingVenues();
      setVenues(data);
    };
    loadData();

    // Animate elements from bottom up
    gsap.fromTo(".hero-animate", 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  return (
    <section className="relative min-h-[85vh] w-full flex flex-col justify-start md:justify-center items-center overflow-hidden pb-12">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center w-full pt-5">
        
        {/* 1. CAROUSEL (Now at the top) */}
        <div className="hero-animate w-full mb-6 md:mb-8">
          {venues.length > 0 ? (
            <HeroCarousel venues={venues} />
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center text-zinc-600">
              Loading Arenas...
            </div>
          )}
        </div>

        {/* 2. BUTTON (Center Stage) */}
        <div className="hero-animate flex flex-col items-center gap-4 mb-12">
          {/* Animated Arrow pointing to button */}
          <div className="animate-bounce text-emerald-500">
             <ArrowRight className="h-5 w-5 rotate-90" />
          </div>
          
          <Button 
            href="/venues" 
            className="text-base md:text-lg px-10 py-5 bg-emerald-500 text-black font-black tracking-wide hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(80,200,120,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:scale-105"
          >
            BOOK NOW
          </Button>
        </div>

        {/* 3. TEXT (Bottom Footer) */}
        <div className="hero-animate text-center max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-3">
            WHERE <span className="text-emerald-500">CHAMPIONS</span> PLAY
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Discover and book Sri Lanka's most premium sports venues instantly.
          </p>
        </div>

      </div>
    </section>
  );
}