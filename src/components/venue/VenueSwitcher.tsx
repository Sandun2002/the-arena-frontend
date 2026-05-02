
"use client";

import { useState } from "react";
import { CaretDown, Check, Buildings, Plus } from "@phosphor-icons/react";
import { useVenue } from "./VenueContext";
import Link from "next/link";

export default function VenueSwitcher({ hideCreateAction = false }: { hideCreateAction?: boolean }) {
    const { venues, currentVenue, selectVenue, isLoading } = useVenue();
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) return <div className="h-10 w-full bg-surface-overlay/50 animate-pulse rounded-lg" />;

    // If no venues found (new user), show add button (unless hidden)
    if (!venues || venues.length === 0) {
        if (hideCreateAction) return null;

        return (
            <Link href="/venue-dashboard/create" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors border border-default bg-surface-raised/50 w-full group">
                <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    <Plus size={16} weight="bold" />
                </div>
                <div className="text-left hidden md:block">
                    <div className="text-xs text-muted font-bold uppercase">Get Started</div>
                    <div className="text-sm font-bold text-primary leading-none">Create Venue</div>
                </div>
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-overlay transition-colors border border-default bg-surface-base/40 group"
            >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-surface-overlay to-surface-raised border border-subtle flex items-center justify-center text-emerald-500 group-hover:border-emerald-500/50 transition-colors">
                    <Buildings size={20} weight="fill" />
                </div>
                <div className="text-left flex-1 overflow-hidden">
                    <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Current Venue</div>
                    <div className="text-sm font-bold text-primary leading-tight truncate">
                        {currentVenue?.name || "Select Venue"}
                    </div>
                </div>
                <CaretDown size={16} weight="bold" className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-surface-raised border border-default rounded-xl shadow-2xl shadow-[var(--shadow-elevation)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                                        : "text-secondary hover:text-primary hover:bg-surface-overlay border border-transparent"
                                        }`}
                                >
                                    <span className="truncate">{venue.name}</span>
                                    {currentVenue?.id === venue.id && <Check size={16} weight="bold" />}
                                </button>
                            ))}
                        </div>
                        {!hideCreateAction && (
                            <div className="border-t border-default p-2 bg-surface-raised/50">
                                <Link
                                    href="/venue-dashboard/create"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full text-center text-xs font-bold text-secondary hover:text-primary hover:bg-surface-overlay py-2 rounded-lg transition-colors"
                                >
                                    <Plus size={12} weight="bold" /> Add New Venue
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
