"use client";

import Link from "next/link";
import { useAuth } from "@/services/authContext";
import { Building2, Calendar, Settings, BarChart3, ArrowLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function VenueDashboardPage() {
    const { isLoggedIn, userType, login } = useAuth();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // For demo: auto-login as venue if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            // Show login prompt instead of auto-login
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".dashboard-header",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );

            gsap.fromTo(".dashboard-card",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.3 }
            );

            gsap.fromTo(".login-prompt",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, delay: 0.8 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const dashboardCards = [
        {
            title: "Manage Bookings",
            desc: "View and manage all incoming venue reservations",
            icon: Calendar,
            href: "/venue-dashboard/bookings",
            color: "emerald",
            gradient: "from-emerald-500/20 to-emerald-900/5"
        },
        {
            title: "Analytics",
            desc: "Track your venue's performance and revenue",
            icon: BarChart3,
            href: "/venue-dashboard/analytics",
            color: "blue",
            gradient: "from-blue-500/20 to-blue-900/5"
        },
        {
            title: "Venue Settings",
            desc: "Update venue details, pricing, and availability",
            icon: Settings,
            href: "/venue-dashboard/settings",
            color: "purple",
            gradient: "from-purple-500/20 to-purple-900/5"
        },
    ];

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">

                {/* Back Link */}
                <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>

                {/* Header */}
                <div className="dashboard-header text-center mb-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Building2 className="h-10 w-10 text-blue-400" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase">Venue <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">Dashboard</span></h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Manage your venue, track bookings, and grow your business with our premium partner tools.
                    </p>
                </div>

                {/* Dashboard Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {dashboardCards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="dashboard-card group relative overflow-hidden p-8 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-500 hover:bg-zinc-900/60"
                        >
                            {/* Card Gradient Bg */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:shadow-lg ${card.color === "emerald" ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10" :
                                        card.color === "blue" ? "bg-blue-500/10 text-blue-400 shadow-blue-500/10" :
                                            "bg-purple-500/10 text-purple-400 shadow-purple-500/10"
                                    }`}>
                                    <card.icon className="h-8 w-8" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6 group-hover:text-zinc-400 transition-colors">
                                    {card.desc}
                                </p>

                                <div className={`mt-auto flex items-center text-sm font-bold uppercase tracking-wider transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${card.color === "emerald" ? "text-emerald-500" :
                                        card.color === "blue" ? "text-blue-400" :
                                            "text-purple-400"
                                    }`}>
                                    Open {card.title} <ChevronRight className="h-4 w-4 ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Demo Login Button (if not logged in as venue) */}
                {(!isLoggedIn || userType !== "venue") && (
                    <div className="login-prompt text-center p-12 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-white mb-2">Partner Access Demo</h3>
                        <p className="text-zinc-400 mb-8">Not logged in as a venue owner? Simulate the experience below.</p>
                        <Button
                            onClick={() => login("venue")}
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 transition-all"
                        >
                            Demo: Login as Venue Owner
                        </Button>
                    </div>
                )}

            </div>
        </main>
    );
}
