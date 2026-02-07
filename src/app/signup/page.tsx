"use client";

import Link from "next/link";
import { User, Store, ArrowRight } from "lucide-react";

export default function SignupSelectionPage() {
  return (
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4">
      
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Join <span className="text-emerald-500">ARENA.LK</span>
        </h1>
        <p className="text-zinc-400 text-lg">Choose your account type to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        
        {/* PLAYER CARD */}
        <Link href="/signup/player" className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-10 hover:border-emerald-500 hover:bg-zinc-900 transition-all duration-300">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-emerald-500 group-hover:scale-110 transition-transform">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Player</h2>
          <p className="text-zinc-400 mb-8">Book courts, join open games, and track your stats.</p>
          <div className="flex items-center text-emerald-500 font-bold group-hover:translate-x-2 transition-transform">
            Create Player Account <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

        {/* VENUE OWNER CARD */}
        <Link href="/signup/venue" className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-10 hover:border-emerald-500 hover:bg-zinc-900 transition-all duration-300">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-blue-400 group-hover:scale-110 transition-transform">
            <Store className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Venue Owner</h2>
          <p className="text-zinc-400 mb-8">List your sports center, manage bookings, and grow revenue.</p>
          <div className="flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
            Create Venue Account <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>

      </div>

      <div className="mt-12 text-zinc-500">
        Already have an account? <Link href="/login" className="text-white hover:underline">Sign In</Link>
      </div>
    </main>
  );
}