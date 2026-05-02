"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

interface FilterBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedSport: string;
    setSelectedSport: (value: string) => void;
}

const SPORTS = ["All", "Football", "Basketball", "Tennis", "Badminton", "Gym", "Swimming"];

export default function FilterBar({
    searchTerm,
    setSearchTerm,
    selectedSport,
    setSelectedSport
}: FilterBarProps) {
    return (
        <div className="sticky top-16 z-40 w-full border-b border-default bg-surface-base/80 backdrop-blur-md py-4">
            <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* 1. Search Input */}
                <div className="relative w-full md:w-1/3">
                    <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        placeholder="Search venues, locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-raised border border-default rounded-full py-2.5 pl-10 pr-4 text-sm text-primary focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-faint"
                    />
                </div>

                {/* 2. Sport Categories (Horizontal Scroll) */}
                <div className="w-full md:w-2/3 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 min-w-max px-1">
                        {SPORTS.map((sport) => (
                            <button
                                key={sport}
                                onClick={() => setSelectedSport(sport)}
                                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                  ${selectedSport === sport
                                        ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(80,200,120,0.3)]"
                                        : "bg-surface-raised text-secondary border-default hover:border-subtle hover:text-primary"
                                    }
                `}
                            >
                                {sport}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}