"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const MOCK_COURTS = [
    {
        id: "c1",
        name: "Court A - Futsal",
        sport: "Futsal",
        rate: 1800,
        status: "active",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: "c2",
        name: "Court B - Badminton",
        sport: "Badminton",
        rate: 1500,
        status: "active",
        image: "https://images.unsplash.com/photo-1626224583764-847890e0e966?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: "c3",
        name: "Court C - Basketball",
        sport: "Basketball",
        rate: 2200,
        status: "maintenance",
        image: "https://images.unsplash.com/photo-1505666287802-9311e90be4c9?q=80&w=2671&auto=format&fit=crop"
    },
];

export default function CourtsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".court-card",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                <div className="page-header flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Manage <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">Courts</span>
                        </h1>
                        <p className="text-zinc-400">Add, edit, or disable courts at your venue.</p>
                    </div>
                    <Button className="bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        <Plus className="mr-2 h-4 w-4" /> Add New Court
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_COURTS.map(court => (
                        <div key={court.id} className="court-card group rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-blue-500/30 transition-all">
                            {/* Image Header */}
                            <div className="relative h-48 w-full">
                                <Image src={court.image} alt={court.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 right-4">
                                    <button className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-colors">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10
                                        ${court.status === 'active' ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}
                                    `}>
                                        {court.status === 'active' ? 'Active' : 'Maintenance'}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{court.name}</h3>
                                        <p className="text-sm text-zinc-400">{court.sport}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-400">LKR {court.rate}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase">Per Hour</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-zinc-800/50">
                                    <Button variant="outline" className="flex-1 border-zinc-700 text-white hover:bg-zinc-800 text-xs">
                                        <Edit2 className="mr-2 h-3 w-3" /> Edit
                                    </Button>
                                    <Button variant="outline" className="flex-1 border-red-900/30 text-red-500 hover:bg-red-900/10 hover:border-red-900/50 text-xs">
                                        <Trash2 className="mr-2 h-3 w-3" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Placeholder */}
                    <div className="court-card rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center p-8 cursor-pointer group h-full min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 group-hover:bg-blue-600/20 text-zinc-500 group-hover:text-blue-500 flex items-center justify-center mb-4 transition-colors">
                            <Plus className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-400 group-hover:text-white transition-colors">Add Court</h3>
                    </div>
                </div>
            </div>
        </main>
    );
}
