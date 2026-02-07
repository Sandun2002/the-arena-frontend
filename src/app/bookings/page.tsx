"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MY_BOOKINGS } from "@/services/userData";
import { Calendar, Clock, MapPin, ArrowRight, X } from "lucide-react";
import gsap from "gsap";

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter data based on tab (Mock logic)
    const bookings = activeTab === "upcoming"
        ? MY_BOOKINGS.filter(b => b.status === "upcoming")
        : MY_BOOKINGS.filter(b => b.status !== "upcoming");

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );

            gsap.fromTo(".booking-card",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.3 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [activeTab]);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                {/* Header */}
                <div className="page-header flex flex-col md:flex-row items-end justify-between mb-12 gap-6 border-b border-zinc-800/50 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight uppercase">
                            My <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">Bookings</span>
                        </h1>
                        <p className="text-zinc-400 text-lg">Manage your court sessions and match history.</p>
                    </div>

                    {/* Custom Tabs */}
                    <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("upcoming")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 ${activeTab === "upcoming" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"
                                }`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 ${activeTab === "history" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-6">
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="booking-card group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500 hover:bg-zinc-900/60"
                            >
                                <div className="flex flex-col md:flex-row h-full">

                                    {/* Image Thumb with Gradient */}
                                    <div className="relative h-48 md:h-auto md:w-72 shrink-0 overflow-hidden">
                                        <Image
                                            src={booking.image}
                                            alt={booking.venueName}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r" />

                                        {/* Mobile Price Badge */}
                                        <div className="absolute top-4 right-4 md:hidden bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                            <span className="text-emerald-400 font-bold text-sm">LKR {booking.price.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative">

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight mb-1">
                                                    {booking.venueName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                    <MapPin className="h-4 w-4 text-zinc-600" />
                                                    <span>Sports Complex, Colombo 07</span>
                                                </div>
                                            </div>

                                            {/* Desktop Price */}
                                            <div className="hidden md:block text-right">
                                                <span className="block text-2xl font-black text-white">LKR {booking.price.toLocaleString()}</span>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${booking.status === "upcoming" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 md:gap-8 mb-8">
                                            <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/5 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    <Calendar className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Date</p>
                                                    <p className="text-white font-bold">{booking.date}</p>
                                                </div>
                                            </div>
                                            <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/5 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    <Clock className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Time</p>
                                                    <p className="text-white font-bold">{booking.time}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 mt-auto pt-6 border-t border-white/5">
                                            {booking.status === "upcoming" ? (
                                                <>
                                                    <button className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2">
                                                        <X className="h-4 w-4" /> Cancel
                                                    </button>
                                                    <button className="px-6 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                                        Get Directions
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="px-6 py-2.5 rounded-xl bg-zinc-800 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-500 hover:text-black hover:scale-105 transition-all flex items-center gap-2">
                                                    Book Again <ArrowRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 booking-card">
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                                <Calendar className="h-10 w-10 text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No bookings found</h3>
                            <p className="text-zinc-500 mb-8">You don&apos;t have any {activeTab} bookings.</p>
                            <Link href="/venues">
                                <button className="px-8 py-3 rounded-full bg-emerald-500 text-black font-black uppercase tracking-wider hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                                    Find a Court
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
