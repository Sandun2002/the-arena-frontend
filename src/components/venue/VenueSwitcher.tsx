
"use client";

import { useState } from "react";
import { ChevronDown, Check, Building2, Plus } from "lucide-react";
import { useVenue } from "./VenueContext";
import Link from "next/link";

export default function VenueSwitcher({ hideCreateAction = false }: { hideCreateAction?: boolean }) {
    const { venues, currentVenue, selectVenue, isLoading } = useVenue();
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) return <div className="h-10 w-full bg-zinc-800/50 animate-pulse rounded-lg" />;

    // If no venues found (new user), show add button (unless hidden)
    if (!venues || venues.length === 0) {
        if (hideCreateAction) return null;

        return (
            <Link href="/venue-dashboard/create" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800 bg-zinc-900/50 w-full group">
                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    <Plus className="w-4 h-4" />
                </div>
                <div className="text-left hidden md:block">
                    <div className="text-xs text-zinc-500 font-bold uppercase">Get Started</div>
                    <div className="text-sm font-bold text-white leading-none">Create Venue</div>
                </div>
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors border border-zinc-800 bg-black/40 group"
            >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-500 group-hover:border-emerald-500/50 transition-colors">
                    <Building2 className="w-5 h-5" />
                </div>
                <div className="text-left hidden md:block flex-1 overflow-hidden">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Current Venue</div>
                    <div className="text-sm font-bold text-white leading-tight truncate">
                        {currentVenue?.name || "Select Venue"}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {venues.map((venue) => (
                                <button
                                    key={venue.id}
                                    onClick={() => {
                                        selectVenue(venue.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentVenue?.id === venue.id
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent"
                                        }`}
                                >
                                    <span className="truncate">{venue.name}</span>
                                    {currentVenue?.id === venue.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                        {!hideCreateAction && (
                            <div className="border-t border-zinc-800 p-2 bg-zinc-900/50">
                                <Link
                                    href="/venue-dashboard/create"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full text-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 py-2 rounded-lg transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> Add New Venue
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
