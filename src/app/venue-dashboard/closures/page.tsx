"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Calendar, AlertTriangle, CloudRain, Hammer } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const VENUE_CLOSURES = [
    {
        id: "cl1",
        title: "Annual Pitch Maintenance",
        start_date: "2026-03-10",
        end_date: "2026-03-12",
        courts: ["All Courts"],
        reason: "Scheduled Maintenance",
        type: "maintenance"
    },
    {
        id: "cl2",
        title: "Poya Day Holiday",
        start_date: "2026-04-14",
        end_date: "2026-04-14",
        courts: ["Court A - Futsal", "Court B - Badminton"],
        reason: "Public Holiday",
        type: "holiday"
    },
];

export default function ClosuresPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".closure-card",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "maintenance": return <Hammer className="h-5 w-5 text-orange-500" />;
            case "weather": return <CloudRain className="h-5 w-5 text-blue-500" />;
            default: return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        }
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                <div className="page-header flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Venue <span className="text-transparent bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text">Closures</span>
                        </h1>
                        <p className="text-zinc-400">Schedule maintenance, holidays, or unexpected closures.</p>
                    </div>
                    <Button className="bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        <Plus className="mr-2 h-4 w-4" /> Add Closure
                    </Button>
                </div>

                <div className="space-y-4">
                    {VENUE_CLOSURES.map(closure => (
                        <div key={closure.id} className="closure-card bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-orange-500/30 transition-all">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 
                                    ${closure.type === 'maintenance' ? 'bg-orange-500/10' : 'bg-yellow-500/10'}`}>
                                    {getIcon(closure.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg mb-1">{closure.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-zinc-600" />
                                            {closure.start_date} <span className="text-zinc-600">→</span> {closure.end_date}
                                        </span>
                                        <span className="hidden md:inline text-zinc-700">|</span>
                                        <span>{closure.reason}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Affected Courts</p>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {closure.courts.map((court, idx) => (
                                            <span key={idx} className="bg-zinc-800 text-white text-xs px-2 py-1 rounded">
                                                {court}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Button variant="outline" className="border-red-900/30 text-red-500 hover:bg-red-900/10 hover:border-red-900/50 p-3 h-auto rounded-xl">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Box */}
                <div className="mt-8 p-6 rounded-2xl bg-zinc-900/20 border border-dashed border-zinc-800 text-center">
                    <p className="text-sm text-zinc-500">
                        Closures will automatically block the calendar preventing any new bookings. <br />
                        Existing bookings during this period will be flagged for cancellation/refund.
                    </p>
                </div>

            </div>
        </main>
    );
}
