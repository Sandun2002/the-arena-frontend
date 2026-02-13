"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Repeat, Calendar, Clock, MoreVertical, Edit2 } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Recurring Bookings --
const RECURRING_BOOKINGS = [
    {
        id: "rb1",
        client_name: "Colombo FC Academy",
        court: "Court A - Futsal",
        day: "Every Saturday",
        time: "08:00 - 10:00",
        period: "Jan 2026 - Dec 2026",
        status: "Active",
        next_booking: "2026-02-14"
    },
    {
        id: "rb2",
        client_name: "Corporate Badminton League",
        court: "Court B - Badminton",
        day: "Every Tuesday & Thursday",
        time: "18:00 - 20:00",
        period: "Feb 2026 - May 2026",
        status: "Active",
        next_booking: "2026-02-12"
    },
];

export default function RecurringPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".recurring-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">

                <div className="page-header flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Recurring <span className="text-transparent bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text">Bookings</span>
                        </h1>
                        <p className="text-zinc-400">Manage long-term slot reservations for academies and corporate clients.</p>
                    </div>
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Plus className="mr-2 h-4 w-4" /> Create Recurring
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {RECURRING_BOOKINGS.map(booking => (
                        <div key={booking.id} className="recurring-card bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-sm group hover:border-emerald-500/30 transition-all relative">
                            <div className="absolute top-6 right-6">
                                <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Repeat className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-xl">{booking.client_name}</h3>
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                        ● {booking.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500 text-sm flex items-center gap-2"><Calendar className="h-4 w-4" /> Frequency</span>
                                    <span className="text-white font-medium text-sm">{booking.day}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500 text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Time</span>
                                    <span className="text-white font-medium text-sm">{booking.time}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500 text-sm">Court</span>
                                    <span className="text-white font-medium text-sm">{booking.court}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500 text-sm">Valid Period</span>
                                    <span className="text-white font-medium text-sm">{booking.period}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-zinc-500">
                                    Next Session: <strong className="text-white">{booking.next_booking}</strong>
                                </span>
                                <Button variant="outline" className="text-xs bg-black/20 border-zinc-800 hover:bg-zinc-800">
                                    <Edit2 className="mr-2 h-3 w-3" /> Manage Dates
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
