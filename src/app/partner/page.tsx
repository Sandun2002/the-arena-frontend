"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import {
    TrendUp,
    Users,
    Shield,
    CalendarBlank,
    ChartBar,
    Clock,
    Gear
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

export default function PartnerPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hero Animations
        gsap.fromTo(".hero-text-anim",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.2 }
        );

        // Section Animations
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

    const features = [
        {
            title: "Increase Sales & Outreach",
            desc: "Get access to the largest active sports community to boost your sales and increase outreach instantly.",
            icon: TrendUp
        },
        {
            title: "Enable Advance Reservations",
            desc: "Empower your users and members to reserve in advance or pay online to increase court utilization and reduce no-shows.",
            icon: CalendarBlank
        },
        {
            title: "Court Scheduling & Inventory",
            desc: "Manage court availability in real time and reduce your operational overheads via seamless online & offline integration.",
            icon: Clock
        },
        {
            title: "Financial & Transaction Reports",
            desc: "Track your sales, utilization and users with ease with easily downloadable tabular data and customized graphs.",
            icon: ChartBar
        },
        {
            title: "Flexible Pricing & Policies",
            desc: "Happy hour pricing? No problemo! Set your own cancellation and rescheduling policies based on sports and activities.",
            icon: Gear
        },
        {
            title: "Seamless Registration Management",
            desc: "Seamlessly manage online and offline registrations and view payment status by participant.",
            icon: Users
        },
        {
            title: "Build Credibility",
            desc: "Get reviews and ratings and build followership to get relevant feedback and build visibility amongst prospective customers.",
            icon: Shield
        }
    ];

    return (
        <main ref={containerRef} className="min-h-screen bg-surface-base text-primary">

            {/* 1. HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
                {/* Ambient Background */}
                <div className="absolute inset-0 bg-surface-base z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Video Background Placeholder */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="w-full h-full bg-surface-raised border border-default flex items-center justify-center">
                        <div className="text-faint font-bold text-2xl uppercase tracking-widest animate-pulse">
                            Background Video Placeholder
                        </div>
                    </div>
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-surface-base/80 via-surface-base/20 to-surface-base" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
                    <div className="hero-text-anim inline-block mb-4 px-4 py-1.5 rounded-full bg-surface-raised/80 border border-default text-emerald-400 text-sm font-medium tracking-wide uppercase">
                        For Venue Owners
                    </div>
                    <h1 className="hero-text-anim text-5xl md:text-8xl font-black text-primary mb-8 tracking-tighter leading-[0.9]">
                        TURN EMPTY SLOTS <br />
                        INTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">REVENUE</span>
                    </h1>
                    <p className="hero-text-anim text-lg md:text-2xl text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
                        The all-in-one platform to manage bookings, track earnings, and get discovered by thousands of sports enthusiasts in Sri Lanka.
                    </p>
                    <div className="hero-text-anim flex flex-col md:flex-row items-center justify-center gap-4">
                        <Button href="#register" className="w-full md:w-auto px-8 py-4 text-lg font-bold">
                            List Your Venue
                        </Button>
                        <Button href="#features" className="w-full md:w-auto px-8 py-4 text-lg font-bold bg-transparent border border-subtle hover:bg-surface-raised text-primary">
                            Explore Features
                        </Button>
                    </div>
                </div>
            </section>

            {/* 2. OPERATIONS SECTION - ZigZag Layout */}
            <section id="features" className="py-24 md:py-32 relative reveal-section">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content */}
                        <div className="order-2 lg:order-1">
                            <div className="text-emerald-500 text-sm font-bold uppercase tracking-widest mb-4">Operations</div>
                            <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                                Effortless Venue <br /> Management.
                            </h2>
                            <p className="text-xl text-secondary leading-relaxed mb-8">
                                Streamline your daily operations with our comprehensive booking and inventory system. Enable seamless online reservations, manage court availability in real-time, and handle offline walk-ins from a single dashboard.
                                <br /><br />
                                Say goodbye to double bookings and operational headaches.
                            </p>
                            <div className="flex items-center gap-2 text-primary font-medium">
                                See operational features below <span className="text-emerald-500">↓</span>
                            </div>
                        </div>

                        {/* Visual/Video Placeholder */}
                        <div className="order-1 lg:order-2">
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-default bg-surface-raised shadow-2xl shadow-emerald-900/20 group">
                                <div className="absolute inset-0 flex items-center justify-center text-faint font-bold text-lg uppercase group-hover:text-emerald-500 transition-colors">
                                    Operations Dashboard Video
                                </div>
                                {/* Play Button Icon Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 backdrop-blur-sm flex items-center justify-center border border-emerald-500/40 group-hover:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-emerald-400 border-b-[10px] border-b-transparent ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. GROWTH SECTION - ZigZag Layout Reversed */}
            <section className="py-24 md:py-32 relative bg-surface-raised/30 reveal-section">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Visual/Video Placeholder */}
                        <div>
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-default bg-surface-raised shadow-2xl shadow-emerald-900/20 group">
                                <div className="absolute inset-0 flex items-center justify-center text-faint font-bold text-lg uppercase group-hover:text-emerald-500 transition-colors">
                                    Growth & Analytics Video
                                </div>
                                {/* Play Button Icon Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 backdrop-blur-sm flex items-center justify-center border border-emerald-500/40 group-hover:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-emerald-400 border-b-[10px] border-b-transparent ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div>
                            <div className="text-emerald-500 text-sm font-bold uppercase tracking-widest mb-4">Growth</div>
                            <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                                Maximize Revenue <br /> & Reach.
                            </h2>
                            <p className="text-xl text-secondary leading-relaxed mb-8">
                                Unlock your venue&apos;s potential with powerful financial tools. Track detailed transaction reports, implement flexible pricing strategies like peak/off-peak rates, and boost your visibility to thousands of active players in the ARENA network.
                            </p>
                            <div className="flex items-center gap-2 text-primary font-medium">
                                See growth features below <span className="text-emerald-500">↓</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. COMPLETE FEATURE SET GRID */}
            <section className="py-24 md:py-32 reveal-section">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">Complete Feature Set</h2>
                        <p className="text-xl text-secondary">Everything you need to run your sports business efficiently.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="group p-8 rounded-2xl bg-surface-raised/40 border border-default/50 hover:bg-surface-raised hover:border-emerald-500/30 transition-all duration-300">
                                <div className="h-12 w-12 rounded-xl bg-surface-overlay flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                                    <feature.icon size={24} weight="bold" className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                                <p className="text-secondary leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. STEPS SECTION */}
            <section className="py-24 md:py-32 bg-surface-raised/30 reveal-section">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">Get Started in 3 Steps</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-surface-overlay via-emerald-500/50 to-surface-overlay z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-surface-base rounded-full border-4 border-default flex items-center justify-center text-3xl font-black text-primary mb-8 shadow-xl">
                                1
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-4">Register</h3>
                            <p className="text-secondary px-4">Create your account and verify your business details.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-surface-base rounded-full border-4 border-emerald-500 flex items-center justify-center text-3xl font-black text-emerald-500 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                2
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-4">Setup Venue</h3>
                            <p className="text-secondary px-4">Add your sports, pricing, photos, and operating hours.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-surface-base rounded-full border-4 border-default flex items-center justify-center text-3xl font-black text-primary mb-8 shadow-xl">
                                3
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-4">Go Live</h3>
                            <p className="text-secondary px-4">Publish your page and start accepting bookings instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. CTA / FORM SECTION */}
            <section id="register" className="py-24 md:py-32 relative overflow-hidden reveal-section">
                <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto rounded-3xl bg-surface-raised/80 border border-default p-8 md:p-16 text-center backdrop-blur-xl">
                        <h2 className="text-4xl md:text-6xl font-black text-primary mb-6 uppercase tracking-tight">
                            Ready to <span className="text-emerald-500">Grow?</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-secondary mb-10 max-w-2xl mx-auto">
                            Join the fastest-growing sports network in Sri Lanka. It takes less than 5 minutes to setup.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button href="/signup" className="w-full sm:w-auto px-12 py-5 text-xl font-bold rounded-full">
                                Create Partner Account
                            </Button>
                            <p className="text-muted text-sm mt-4 sm:mt-0 font-medium">
                                No credit card required for signup
                            </p>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}