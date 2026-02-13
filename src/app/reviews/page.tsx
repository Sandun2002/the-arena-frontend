"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Edit2, Trash2, MessageSquare } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Reviews Data --
const MY_REVIEWS = [
    {
        id: "r1",
        venue_name: "Emerald Turf Arena",
        venue_image: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop",
        rating: 5,
        comment: "Excellent facilities and well-maintained turf! The lighting at night is perfect for late games.",
        created_at: "20 Jan 2026"
    },
    {
        id: "r2",
        venue_name: "Neon Sky Court",
        venue_image: "https://images.unsplash.com/photo-1505666287802-9311e90be4c9?q=80&w=2671&auto=format&fit=crop",
        rating: 4,
        comment: "Vibe is amazing but the parking was a bit tight. Court surface is top notch though.",
        created_at: "05 Feb 2026"
    },
];

export default function ReviewsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".review-card",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <Link href="/profile" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                </Link>

                <div className="page-header mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                            My <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">Reviews</span>
                        </h1>
                        <p className="text-zinc-400">Share your experiences and help the community.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {MY_REVIEWS.length > 0 ? (
                        MY_REVIEWS.map((review) => (
                            <div key={review.id} className="review-card group relative p-6 md:p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm hover:border-yellow-500/30 transition-all">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-2xl border border-zinc-700">
                                        <Image src={review.venue_image} alt={review.venue_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white text-xl">{review.venue_name}</h3>
                                            <span className="text-xs text-zinc-500">{review.created_at}</span>
                                        </div>

                                        <div className="flex gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-zinc-300 italic mb-6">"{review.comment}"</p>

                                        <div className="flex gap-3">
                                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-white hover:bg-zinc-700 transition-colors">
                                                <Edit2 className="h-3 w-3" /> Edit
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-colors">
                                                <Trash2 className="h-3 w-3" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 rounded-[2rem] border border-dashed border-zinc-800">
                            <MessageSquare className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                            <p className="text-zinc-500 mb-6">Book a court and share your experience with others!</p>
                            <Link href="/venues"><Button>Find a Court</Button></Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
