
"use client";

import Hero from "@/components/home/Hero";
import SportExplorer from "@/components/home/SportExplorer";
import FeaturedVenues from "@/components/home/FeaturedVenues";
import ReviewsTeaser from "@/components/home/ReviewsTeaser";
import GamificationTeaser from "@/components/home/GamificationTeaser";
import PWAInstallGuide from "@/components/home/PWAInstallGuide";
import PartnerCTA from "@/components/home/PartnerCTA";
import Link from "next/link";
import { ArrowRight, PhoneOff, Lock, Gamepad2, ChevronRight } from "lucide-react";

const STEPS = [
  {
    icon: PhoneOff,
    title: "Skip the Phone Calls",
    desc: "No more calling venues to check availability. Browse real-time court availability in seconds.",
    color: "emerald"
  },
  {
    icon: Lock,
    title: "Lock It In",
    desc: "Found your slot? Secure it instantly before someone else does. Pay securely online.",
    color: "blue"
  },
  {
    icon: Gamepad2,
    title: "Show Up & Play",
    desc: "No surprises. Your court is confirmed and waiting. Just bring your A-game.",
    color: "yellow"
  },
];

export default function Home() {
  return (
    <main className="w-full bg-black overflow-x-hidden relative">
      {/* 1. Hero + Quick Search */}
      <Hero />

      {/* 2. Sport Category Explorer */}
      <SportExplorer />

      {/* 3. Trending Arenas */}
      <FeaturedVenues />

      {/* 4. Reviews Trust Section */}
      <ReviewsTeaser />

      {/* 5. Gamification Teaser */}
      <GamificationTeaser />

      {/* 6. How it Works - Rewritten */}
      <section className="py-24 relative bg-zinc-900/20 border-y border-zinc-800/50">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              How it <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">Works</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">From discovery to game time in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent border-t border-dashed border-zinc-600 z-0" />

            {STEPS.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                <div className={`
                  w-24 h-24 rounded-3xl mb-8 flex items-center justify-center border-2 bg-black transition-all duration-300 relative
                  ${step.color === 'emerald' ? 'border-emerald-500/30 group-hover:border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
                    step.color === 'blue' ? 'border-blue-500/30 group-hover:border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]' :
                      'border-yellow-500/30 group-hover:border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]'}
                `}>
                  <step.icon className={`h-10 w-10 
                    ${step.color === 'emerald' ? 'text-emerald-500' :
                      step.color === 'blue' ? 'text-blue-500' :
                        'text-yellow-500'}
                  `} />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-sm">
                    {idx + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/venues" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Get Started Now <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. PWA Install Guide */}
      <PWAInstallGuide />

      {/* 8. Partner CTA (hidden by default) */}
      <PartnerCTA />
    </main>
  );
}