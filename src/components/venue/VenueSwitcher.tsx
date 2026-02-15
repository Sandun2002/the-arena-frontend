
"use client";

import { useState } from "react";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { Venue } from "@/types";

interface VenueSwitcherProps {
    venues: Venue[]; // In real implementation this comes from service
    currentVenueId: string;
    onVenueChange: (venueId: string) => void;
}

export default function VenueSwitcher({ venues, currentVenueId, onVenueChange }: VenueSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentVenue = venues.find(v => v.id === currentVenueId) || venues[0];

    if (!venues || venues.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800 bg-zinc-900/50"
            >
                <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left hidden md:block">
                    <div className="text-xs text-zinc-500 font-bold uppercase">Current Venue</div>
                    <div className="text-sm font-bold text-white leading-none truncate max-w-[150px]">
                        {currentVenue?.name || "Select Venue"}
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2">
                            <div className="text-xs font-bold text-zinc-500 px-2 py-2 uppercase">Switch Venue</div>
                            {venues.map((venue) => (
                                <button
                                    key={venue.id}
                                    onClick={() => {
                                        onVenueChange(venue.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentVenueId === venue.id
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                        }`}
                                >
                                    <span className="truncate">{venue.name}</span>
                                    {currentVenueId === venue.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-zinc-800 p-2">
                            <button className="w-full text-center text-xs font-bold text-zinc-500 hover:text-white py-2">
                                + Add New Venue
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
