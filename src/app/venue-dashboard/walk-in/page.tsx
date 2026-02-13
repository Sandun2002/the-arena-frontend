"use client";

import { useEffect, useRef, useState } from "react";
import {
    Calendar, Clock, User, Phone, Check, Zap, CreditCard
} from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Courts --
const COURTS = ["Court A - Futsal", "Court B - Badminton", "Court C - Basketball"];

export default function WalkInPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedCourt, setSelectedCourt] = useState(COURTS[0]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".form-card",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">

                <div className="page-header mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                        Walk-in <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text">Booking</span>
                    </h1>
                    <p className="text-zinc-400">Quickly record a manual booking for walk-in customers.</p>
                </div>

                <div className="form-card bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-sm relative overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 relative z-10">

                        {/* Left Column: Details */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Court</label>
                                <div className="space-y-2">
                                    {COURTS.map(court => (
                                        <button
                                            key={court}
                                            onClick={() => setSelectedCourt(court)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${selectedCourt === court
                                                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                                                    : "bg-black/20 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                                                }`}
                                        >
                                            <span className="font-bold">{court}</span>
                                            {selectedCourt === court && <Check className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Date</label>
                                    <div className="relative">
                                        <input type="date" className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Time</label>
                                    <div className="relative">
                                        <input type="time" className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" defaultValue="18:00" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Customer & Payment */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Customer Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input type="text" placeholder="John Doe" className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none placeholder:text-zinc-600" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                                    <input type="tel" placeholder="+94 77 123 4567" className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-cyan-500 focus:outline-none placeholder:text-zinc-600" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-800">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-zinc-400">Total Amount</span>
                                    <span className="text-2xl font-bold text-white">LKR 1,800</span>
                                </div>
                                <div className="flex gap-4">
                                    <button className="flex-1 py-3 rounded-xl border border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-colors">
                                        <Zap className="h-4 w-4" /> Cash
                                    </button>
                                    <button className="flex-1 py-3 rounded-xl border border-zinc-700 bg-black/20 text-zinc-400 font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-colors">
                                        <CreditCard className="h-4 w-4" /> Card
                                    </button>
                                </div>
                            </div>

                            <Button className="w-full py-4 bg-cyan-500 text-black font-bold hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2">
                                Confirm Booking
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
