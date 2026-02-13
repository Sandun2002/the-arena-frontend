"use client";

import Hero from "@/components/home/Hero";
import FeaturedVenues from "@/components/home/FeaturedVenues";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Search, Calendar, Trophy, ChevronRight } from "lucide-react";

const POPULAR_CITIES = [
  { name: "Colombo", image: "https://images.unsplash.com/photo-1584883447385-2e6b7d5f0e9b?q=80&w=2670&auto=format&fit=crop", venues: 42 },
  { name: "Kandy", image: "https://images.unsplash.com/photo-1590422744385-5c1cfc9f9f5a?q=80&w=2670&auto=format&fit=crop", venues: 15 },
  { name: "Galle", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2673&auto=format&fit=crop", venues: 12 },
  { name: "Negombo", image: "https://images.unsplash.com/photo-1588665046270-349071b7643b?q=80&w=2574&auto=format&fit=crop", venues: 8 },
];

const STEPS = [
  {
    icon: Search,
    title: "Find a Court",
    desc: "Browse top-rated venues near you. Filter by sport, date, and amenities.",
    color: "emerald"
  },
  {
    icon: Calendar,
    title: "Book Your Slot",
    desc: "Real-time availability. Secure your spot instantly with online payment.",
    color: "blue"
  },
  {
    icon: Trophy,
    title: "Play & Compete",
    desc: "Show up, play your game, and track your stats to level up.",
    color: "yellow"
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      <Hero />

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-zinc-500 hidden md:block z-20">
        <div className="w-6 h-10 border-2 border-zinc-500 rounded-full flex justify-center p-1">
          <div className="w-1 h-3 bg-zinc-500 rounded-full animate-scroll"></div>
        </div>
      </div>

      <FeaturedVenues />

      {/* -- Browse by City Section -- */}
      <section className="py-24 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                Explore <span className="text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text">Cities</span>
              </h2>
              <p className="text-zinc-400">Find the best courts in your area.</p>
            </div>
            <Link href="/venues" className="hidden md:flex items-center text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors group">
              View All Locations <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_CITIES.map((city) => (
              <Link key={city.name} href={`/search?city=${city.name}`} className="group relative h-80 rounded-[2rem] overflow-hidden border border-zinc-800">
                <Image src={city.image} alt={city.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl font-black text-white mb-1">{city.name}</h3>
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <MapPin className="h-4 w-4 text-blue-500" /> {city.venues} Venues
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/venues" className="inline-flex items-center text-sm font-bold text-blue-500 hover:text-blue-400">
              View All Locations <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* -- How it Works Section -- */}
      <section className="py-24 relative bg-zinc-900/20 border-y border-zinc-800/50">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              How it <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">Works</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">From discovery to game time in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent border-t border-dashed border-zinc-600 z-0"></div>

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

                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-sm`}>
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

      {/* Trusted By Section (Enhanced) */}
      <section className="py-20 border-t border-zinc-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-bold text-zinc-600 tracking-[0.2em] uppercase mb-12">Trusted by Leading Sports Brands</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Text Placeholders for Logos */}
            <span className="text-2xl font-black text-white hover:text-emerald-500 transition-colors cursor-default">NIKE</span>
            <span className="text-2xl font-black text-white hover:text-emerald-500 transition-colors cursor-default">ADIDAS</span>
            <span className="text-2xl font-black text-white hover:text-emerald-500 transition-colors cursor-default">PUMA</span>
            <span className="text-2xl font-black text-white hover:text-emerald-500 transition-colors cursor-default">UNDER ARMOUR</span>
            <span className="text-2xl font-black text-white hover:text-emerald-500 transition-colors cursor-default">DECATHLON</span>
          </div>
        </div>
      </section>
    </main>
  );
}