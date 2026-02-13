"use client";

import { useEffect, useRef, useState } from "react";
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter,
    MoreHorizontal, Clock, Plus, Zap
} from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const MOCK_COURTS = [
    { id: "c1", name: "Court A - Futsal" },
    { id: "c2", name: "Court B - Badminton" },
    { id: "c3", name: "Court C - Basketball" },
];

const MOCK_EVENTS = [
    { id: "e1", court_id: "c1", title: "John Doe", start: "18:00", end: "19:00", type: "confirmed" },
    { id: "e2", court_id: "c1", title: "Walk-in #42", start: "20:00", end: "21:00", type: "walk-in" },
    { id: "e3", court_id: "c2", title: "Maintenance", start: "14:00", end: "16:00", type: "blocked" },
    { id: "e4", court_id: "c3", title: "Sarah Smith", start: "17:00", end: "19:00", type: "confirmed" },
];

const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`); // 8:00 to 22:00

export default function SchedulerPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".calendar-grid",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const getEventStyle = (type: string) => {
        switch (type) {
            case "confirmed": return "bg-emerald-500/20 border-emerald-500 text-emerald-400";
            case "walk-in": return "bg-blue-500/20 border-blue-500 text-blue-400";
            case "blocked": return "bg-zinc-800/80 border-zinc-600 text-zinc-400 striped-bg";
            default: return "bg-zinc-800 border-zinc-700 text-zinc-300";
        }
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects (Blue Accent for Manager) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                {/* Header */}
                <div className="page-header flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Court <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">Scheduler</span>
                        </h1>
                        <p className="text-zinc-400">Manage bookings, block slots, and oversee daily operations.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                        <Button className="bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                            <Plus className="mr-2 h-4 w-4" /> New Booking
                        </Button>
                    </div>
                </div>

                {/* Calendar Toolbar */}
                <div className="calendar-grid bg-zinc-900/40 border border-zinc-800 rounded-t-[2rem] p-4 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2 text-white font-bold text-lg">
                            <CalendarIcon className="h-5 w-5 text-blue-500" />
                            <span>Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm font-bold">Day</button>
                        <button className="px-4 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white text-sm font-bold transition-colors">Week</button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid bg-black/40 border-x border-b border-zinc-800 rounded-b-[2rem] overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Row (Courts) */}
                        <div className="grid grid-cols-[80px_1fr_1fr_1fr] border-b border-zinc-800/50 sticky top-0 bg-zinc-900/90 backdrop-blur z-20">
                            <div className="p-4 border-r border-zinc-800/50"></div>
                            {MOCK_COURTS.map(court => (
                                <div key={court.id} className="p-4 border-r border-zinc-800/50 text-center">
                                    <h3 className="text-white font-bold text-sm truncate">{court.name}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Time Slots */}
                        <div className="relative">
                            {TIME_SLOTS.map(time => (
                                <div key={time} className="grid grid-cols-[80px_1fr_1fr_1fr] border-b border-zinc-800/30 h-20">
                                    <div className="p-2 border-r border-zinc-800/50 text-right text-xs text-zinc-500 font-medium -mt-2.5">
                                        {time}
                                    </div>
                                    {MOCK_COURTS.map(court => (
                                        <div key={`${court.id}-${time}`} className="border-r border-zinc-800/50 relative group hover:bg-white/5 transition-colors cursor-pointer">
                                            {/* Hover "+" button */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <Plus className="h-6 w-6 text-zinc-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Events Overlay */}
                            {MOCK_EVENTS.map(event => {
                                // Simple positioning logic for demo (assuming full hour slots)
                                const startHour = parseInt(event.start.split(':')[0]);
                                const endHour = parseInt(event.end.split(':')[0]);
                                const duration = endHour - startHour;
                                const top = (startHour - 8) * 80; // 80px per hour, starting at 8:00
                                const height = duration * 80;

                                // Determine column index
                                const courtIndex = MOCK_COURTS.findIndex(c => c.id === event.court_id);
                                if (courtIndex === -1) return null;

                                const colCheck = `calc(100% - 80px)`; // Remaining width
                                // This positioning is simplified for the grid layout CSS

                                return (
                                    <div
                                        key={event.id}
                                        className={`absolute z-10 m-1 rounded-lg border p-2 text-xs font-bold shadow-lg flex flex-col justify-center
                                            ${getEventStyle(event.type)}
                                            hover:brightness-110 cursor-pointer transition-all
                                        `}
                                        style={{
                                            top: `${top}px`,
                                            height: `${height - 8}px`, // -8 for margin
                                            left: `calc(80px + ${courtIndex} * ((100% - 80px) / 3))`,
                                            width: `calc(((100% - 80px) / 3) - 8px)` // -8 for margin
                                        }}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="truncate">{event.title}</span>
                                            {event.type === 'walk-in' && <Zap className="h-3 w-3" />}
                                        </div>
                                        <div className="opacity-70 text-[10px]">{event.start} - {event.end}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-zinc-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></div> Confirmed
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500"></div> Walk-in
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-zinc-800/80 border border-zinc-600"></div> Blocked / Maintenance
                    </div>
                </div>

            </div>
        </main>
    );
}

// Add simplistic striped background via CSS in a global file or style tag if needed,
// for now using solid colors for simplicity.
