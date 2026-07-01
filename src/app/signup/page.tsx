
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { User, Buildings, ArrowRight } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";

export default function SignupSelectionPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".role-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-surface-base flex flex-col items-center justify-start pt-24 pb-12 px-4 relative overflow-hidden" ref={containerRef}>

      {/* Background Glower */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <Link href="/" className="inline-block mb-8 group">
          <img src={resolvedTheme === "dark" ? "/logo-full.png" : "/logo-full-for-light-mode.png"} alt="The Arena" className="h-20 w-auto mx-auto object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105" />
        </Link>
        <h1 className="text-3xl md:text-5xl font-black text-primary mb-4 uppercase tracking-tight">
          Join The <span className="text-emerald-500">Revolution</span>
        </h1>
        <p className="text-secondary max-w-md mx-auto">
          Choose how you want to use TheArena.lk. Are you here to play, or here to host?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10 px-4">

        {/* Player Card */}
        <Link href="/signup/player" className="role-card group">
          <div className="h-full bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm hover:bg-surface-raised hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <User size={128} weight="duotone" className="text-emerald-500 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User size={28} weight="duotone" className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">I&apos;m a Player</h2>
              <p className="text-secondary text-sm mb-8 flex-grow">
                Book courts, join open games, track your stats, and compete in leagues.
              </p>
              <div className="flex items-center text-emerald-500 font-bold group-hover:translate-x-2 transition-transform">
                Create Player Account <ArrowRight size={16} weight="bold" className="ml-2" />
              </div>
            </div>
          </div>
        </Link>

        {/* Venue Card */}
        <a href={`https://${process.env.NEXT_PUBLIC_VENUE_DOMAIN || 'centers.thearena.lk'}/signup`} className="role-card group">
          <div className="h-full bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm hover:bg-surface-raised hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Buildings size={128} weight="duotone" className="text-blue-500 transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Buildings size={28} weight="duotone" className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">I&apos;m a Venue Owner</h2>
              <p className="text-secondary text-sm mb-8 flex-grow">
                Manage bookings, optimize revenue, and grow your sports business.
              </p>
              <div className="flex items-center text-blue-500 font-bold group-hover:translate-x-2 transition-transform">
                Register Venue <ArrowRight size={16} weight="bold" className="ml-2" />
              </div>
            </div>
          </div>
        </a>

      </div>

      <div className="mt-12 text-muted text-sm">
        Already have an account? {" "}
        <Link href="/login" className="text-primary font-bold hover:text-emerald-500 transition-colors">
          Log In
        </Link>
      </div>
    </main>
  );
}