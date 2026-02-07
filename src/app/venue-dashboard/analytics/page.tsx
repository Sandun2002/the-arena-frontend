"use client";

import Link from "next/link";
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Users, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Mock analytics data
const ANALYTICS_DATA = {
    kpis: [
        { label: "Total Revenue", value: "LKR 425,000", change: "+12.5%", icon: DollarSign, color: "emerald" },
        { label: "Bookings Today", value: "24", change: "+8", icon: Calendar, color: "blue" },
        { label: "Occupancy Rate", value: "78%", change: "+5.2%", icon: TrendingUp, color: "purple" },
        { label: "Active Customers", value: "156", change: "+23", icon: Users, color: "orange" },
    ],
    revenueByDay: [
        { day: "Mon", amount: 45000 },
        { day: "Tue", amount: 52000 },
        { day: "Wed", amount: 48000 },
        { day: "Thu", amount: 61000 },
        { day: "Fri", amount: 73000 },
        { day: "Sat", amount: 89000 },
        { day: "Sun", amount: 57000 },
    ],
    peakHours: [
        { hour: "6AM", bookings: 2 },
        { hour: "9AM", bookings: 5 },
        { hour: "12PM", bookings: 8 },
        { hour: "3PM", bookings: 12 },
        { hour: "6PM", bookings: 18 },
        { hour: "9PM", bookings: 14 },
    ],
    topCourts: [
        { name: "Court A - Badminton", bookings: 45, revenue: 135000 },
        { name: "Court B - Futsal", bookings: 38, revenue: 118000 },
        { name: "Court C - Basketball", bookings: 32, revenue: 96000 },
        { name: "Court D - Tennis", bookings: 28, revenue: 76000 },
    ],
};

export default function VenueAnalyticsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
            gsap.fromTo(".kpi-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
            gsap.fromTo(".chart-section",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.5 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const maxRevenue = Math.max(...ANALYTICS_DATA.revenueByDay.map(d => d.amount));

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                <Link href="/venue-dashboard" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>

                {/* Header */}
                <div className="page-header mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 uppercase tracking-tight">
                        Analytics <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">Dashboard</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">Track your venue's performance and revenue metrics.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {ANALYTICS_DATA.kpis.map((kpi, index) => (
                        <div
                            key={index}
                            className="kpi-card relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm group hover:border-zinc-700 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.color === "emerald" ? "bg-emerald-500/10 text-emerald-500" :
                                        kpi.color === "blue" ? "bg-blue-500/10 text-blue-400" :
                                            kpi.color === "purple" ? "bg-purple-500/10 text-purple-400" :
                                                "bg-orange-500/10 text-orange-400"
                                    }`}>
                                    <kpi.icon className="h-6 w-6" />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.change.startsWith("+")
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-red-500/10 text-red-400"
                                    }`}>
                                    {kpi.change}
                                </span>
                            </div>
                            <p className="text-3xl font-black text-white mb-1">{kpi.value}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{kpi.label}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

                    {/* Revenue Chart */}
                    <div className="chart-section lg:col-span-2 rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Weekly Revenue</h2>
                                <p className="text-sm text-zinc-500">Last 7 days performance</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-xs font-bold hover:bg-zinc-700 transition-all">
                                This Week
                            </button>
                        </div>

                        {/* Simple Bar Chart */}
                        <div className="flex items-end justify-between gap-4 h-64">
                            {ANALYTICS_DATA.revenueByDay.map((day, index) => {
                                const height = (day.amount / maxRevenue) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="relative w-full group/bar">
                                            {/* Hover Tooltip */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                                                LKR {day.amount.toLocaleString()}
                                            </div>
                                            {/* Bar */}
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl transition-all duration-500 hover:from-emerald-500 hover:to-emerald-400"
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-500">{day.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Peak Hours */}
                    <div className="chart-section rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-white mb-1">Peak Hours</h2>
                            <p className="text-sm text-zinc-500">Today's booking pattern</p>
                        </div>

                        <div className="space-y-4">
                            {ANALYTICS_DATA.peakHours.map((slot, index) => {
                                const maxBookings = Math.max(...ANALYTICS_DATA.peakHours.map(s => s.bookings));
                                const percentage = (slot.bookings / maxBookings) * 100;
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-zinc-600" />
                                                <span className="font-bold text-white">{slot.hour}</span>
                                            </div>
                                            <span className="text-xs font-bold text-zinc-500">{slot.bookings} bookings</span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Top Courts */}
                <div className="chart-section rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-1">Top Performing Courts</h2>
                        <p className="text-sm text-zinc-500">Sorted by total bookings</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {ANALYTICS_DATA.topCourts.map((court, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl bg-black/40 border border-zinc-800 hover:border-emerald-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-sm">
                                        #{index + 1}
                                    </div>
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rank {index + 1}</span>
                                </div>
                                <h3 className="text-white font-bold mb-4 text-sm leading-tight group-hover:text-emerald-400 transition-colors">
                                    {court.name}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Bookings</span>
                                        <span className="text-white font-bold">{court.bookings}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-500">Revenue</span>
                                        <span className="text-emerald-400 font-bold">LKR {court.revenue.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}
