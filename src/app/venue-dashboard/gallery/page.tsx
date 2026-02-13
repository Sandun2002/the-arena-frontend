"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Image as ImageIcon, Move, Star } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const VENUE_GALLERY_IMAGES = [
    { id: "g1", url: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop", isCover: true },
    { id: "g2", url: "https://images.unsplash.com/photo-1505666287802-9311e90be4c9?q=80&w=2671&auto=format&fit=crop", isCover: false },
    { id: "g3", url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop", isCover: false },
    { id: "g4", url: "https://images.unsplash.com/photo-1626224583764-847890e0e966?q=80&w=2670&auto=format&fit=crop", isCover: false },
    { id: "g5", url: "https://images.unsplash.com/photo-1596728328136-1e0a81122f3d?q=80&w=2670&auto=format&fit=crop", isCover: false },
];

export default function GalleryPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".gallery-item",
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.5)", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                <div className="page-header flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Venue <span className="text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text">Gallery</span>
                        </h1>
                        <p className="text-zinc-400">Showcase your courts and facilities. High-quality images attract more players.</p>
                    </div>
                    <Button className="bg-white text-black hover:bg-zinc-200 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <Plus className="mr-2 h-4 w-4" /> Upload Photos
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Add New Placeholder - Always First */}
                    <div className="gallery-item aspect-square rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-pink-500/50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 group-hover:bg-pink-600/20 text-zinc-500 group-hover:text-pink-500 flex items-center justify-center mb-4 transition-colors">
                            <ImageIcon className="h-8 w-8" />
                        </div>
                        <span className="text-sm font-bold text-zinc-400 group-hover:text-white">Add Photo</span>
                    </div>

                    {VENUE_GALLERY_IMAGES.map((img, idx) => (
                        <div key={img.id} className="gallery-item group relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
                            <Image src={img.url} alt={`Gallery ${idx}`} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            {/* Controls */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                <button className="p-2 rounded-full bg-black/60 text-white hover:bg-red-500/80 backdrop-blur-sm transition-colors" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                {img.isCover ? (
                                    <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-black" /> Cover
                                    </span>
                                ) : (
                                    <button className="text-white text-xs font-bold hover:text-emerald-400 transition-colors">Set as Cover</button>
                                )}
                                <Move className="h-4 w-4 text-zinc-400 cursor-grab active:cursor-grabbing" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-zinc-500">
                        Drag and drop images to reorder. The first image will be used as the venue thumbnail.
                        <br />Supported formats: JPG, PNG, WEBP. Max size: 5MB.
                    </p>
                </div>
            </div>
        </main>
    );
}
