"use client";

import { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import { MapPin, Zap, Target } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hero Text Animation
        gsap.fromTo(".about-hero-anim",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.2 }
        );

        // Section Reveals
        const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
        sections.forEach((section) => {
            gsap.fromTo(section,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });
    }, []);

    return (
        <main ref={containerRef} className="min-h-screen bg-surface-base text-primary selection:bg-emerald-500/30">

            {/* 1. ORIGIN STORY - Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="about-hero-anim inline-block mb-4 px-4 py-1.5 rounded-full bg-surface-raised/80 border border-default text-emerald-400 text-xs font-bold tracking-widest uppercase">
                            Our Story
                        </div>
                        <h1 className="about-hero-anim text-5xl md:text-7xl font-black text-primary mb-8 tracking-tighter leading-[0.9]">
                            IT STARTED WITH A <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">MISSED MATCH</span>
                        </h1>
                        <div className="about-hero-anim space-y-6 text-lg md:text-xl text-secondary leading-relaxed max-w-2xl mx-auto">
                            <p>
                                Ever spent hours calling sports centers one by one, just hoping to find a single free slot? We have. And we know exactly how frustrating it is.
                            </p>
                            <p>
                                After weeks of busy schedules, when you and your friends finally align on a time to play, the last thing you want is to discover that every venue is booked.
                            </p>
                            <p className="text-primary font-bold text-2xl pt-4">
                                It was this exact frustration—the difficulty of finding a place for that one precious window of free time—that sparked the idea for TheArena.lk.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. DIFFERENTIATION SECTION */}
            <section className="py-24 bg-surface-raised/30 reveal-section">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">Why Us</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-primary mb-6">What Makes Us Different</h3>
                        <p className="text-xl text-secondary">We built a platform that works for everyone in the game.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Card 1 */}
                        <div className="bg-surface-base border border-default p-10 rounded-3xl hover:border-emerald-500/30 transition-colors group">
                            <div className="w-14 h-14 bg-surface-raised rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-primary mb-4">Island-Wide Access</h4>
                            <p className="text-secondary leading-relaxed">
                                We don&apos;t limit ourselves to the city limits. Whether you are in Colombo or outstation, we help you find a venue near you instantly.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-surface-base border border-default p-10 rounded-3xl hover:border-emerald-500/30 transition-colors group">
                            <div className="w-14 h-14 bg-surface-raised rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h4 className="text-2xl font-bold text-primary mb-4">Empowering Centers</h4>
                            <p className="text-secondary leading-relaxed">
                                We noticed many centers were struggling with manual logs. We provide venue owners with smart management tools to streamline operations and boost visibility.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. VISION SECTION */}
            <section className="py-32 md:py-48 relative overflow-hidden reveal-section">
                <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none" />
                <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
                    <Target className="w-16 h-16 text-emerald-500 mx-auto mb-8 animate-pulse" />

                    <h2 className="text-4xl md:text-6xl font-black text-primary mb-10 leading-tight">
                        &ldquo;We are building the <span className="text-emerald-500">largest sports community</span> in Sri Lanka.&rdquo;
                    </h2>

                    <div className="prose prose-lg prose-invert mx-auto text-secondary leading-relaxed">
                        <p className="mb-8 text-xl">
                            Our goal is to bring sports back into the lives of everyday Sri Lankans. Whether you're a casual player, a pro athlete, or a facility owner, TheArena.lk is here to make the experience seamless.
                        </p>
                        <p className="text-primary font-medium text-2xl">
                            Join us in making every game easier to play and every match a chance to connect.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. CTA SECTION */}
            <section className="pb-32 pt-10 reveal-section">
                <div className="container mx-auto px-4">
                    <div className="rounded-3xl bg-gradient-to-br from-surface-raised to-surface-base border border-default p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />

                        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-8">Ready to Get in the Game?</h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button href="/venues" className="w-full sm:w-auto px-10 py-4 text-lg font-bold">
                                Explore Venues
                            </Button>
                            <Button href="/partner" className="w-full sm:w-auto px-10 py-4 text-lg font-bold bg-transparent border border-subtle hover:bg-surface-overlay text-primary">
                                List Your Venue
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}