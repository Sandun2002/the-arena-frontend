"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    LayoutDashboard, Calendar, Settings, Users, ClipboardList,
    TrendingUp, Bell, Search, Plus, MapPin, Grid, Image as ImageIcon,
    Clock, AlertCircle, Zap
} from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const DASHBOARD_STATS = [
    { label: "Today's Bookings", value: "12", trend: "+20%", color: "text-emerald-400" },
    { label: "Today's Revenue", value: "LKR 24.5k", trend: "+15%", color: "text-blue-400" },
    { label: "Active Courts", value: "3/4", trend: "1 Maintenance", color: "text-yellow-400" },
];

export default function VenueDashboard() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Intro Animations
            gsap.fromTo(".dashboard-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".stat-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
            gsap.fromTo(".nav-card",
                { scale: 0.95, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.2)", delay: 0.4 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const menuItems = [
        { title: "Calendar", icon: Calendar, href: "/venue-dashboard/calendar", desc: "Manage Schedule", color: "blue" },
        { title: "Bookings", icon: ClipboardList, href: "/venue-dashboard/bookings", desc: "View All Reservations", color: "emerald" },
        { title: "Courts", icon: Grid, href: "/venue-dashboard/courts", desc: "Manage Courts", color: "purple" },
        { title: "Gallery", icon: ImageIcon, href: "/venue-dashboard/gallery", desc: "Update Photos", color: "pink" },
        { title: "Staff", icon: Users, href: "/venue-dashboard/managers", desc: "Manage Team", color: "orange" },
        { title: "Recurring", icon: Clock, href: "/venue-dashboard/recurring", desc: "Long-term Slots", color: "green" },
        { title: "Closures", icon: AlertCircle, href: "/venue-dashboard/closures", desc: "Holidays/Maintenance", color: "red" },
        { title: "Walk-in", icon: Zap, href: "/venue-dashboard/walk-in", desc: "Quick Booking", color: "cyan" },
        { title: "Analytics", icon: TrendingUp, href: "/venue-dashboard/analytics", desc: "Performance", color: "indigo" },
        { title: "Settings", icon: Settings, href: "/venue-dashboard/settings", desc: "Venue Profile", color: "zinc" },
    ];

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                {/* Header */}
                <div className="dashboard-header flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Venue <span className="text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text">Dashboard</span>
                        </h1>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium">Emerald Turf Arena, Colombo 07</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Bell className="h-6 w-6 text-zinc-400 hover:text-white cursor-pointer transition-colors" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                        <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                            <span className="font-bold text-white">EA</span>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {DASHBOARD_STATS.map((stat, idx) => (
                        <div key={idx} className="stat-card p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                                <span className={`text-xs font-bold ${stat.color} bg-white/5 px-2 py-1 rounded-lg`}>{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Navigation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {menuItems.map((item, idx) => (
                        <Link key={idx} href={item.href}>
                            <div className="nav-card group h-full p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm hover:bg-zinc-800/60 hover:border-white/10 transition-all cursor-pointer relative overflow-hidden">
                                <div className={`
                             w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110
                             ${item.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                                        item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                                            item.color === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                                                item.color === 'pink' ? 'bg-pink-500/10 text-pink-500' :
                                                    item.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                                                        item.color === 'green' ? 'bg-green-500/10 text-green-500' :
                                                            item.color === 'red' ? 'bg-red-500/10 text-red-500' :
                                                                item.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-500' :
                                                                    item.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-500' :
                                                                        'bg-zinc-500/10 text-zinc-400'}
                        `}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                <p className="text-xs text-zinc-500 font-medium group-hover:text-zinc-400">{item.desc}</p>

                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </main>
    );
}
