"use client";

import Link from "next/link";
import { ArrowLeft, Filter, Search, MoreHorizontal, CalendarCheck, Clock, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function VenueBookingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
            gsap.fromTo(".bookings-table",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">

                <Link href="/venue-dashboard" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>

                <div className="page-header flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Booking <span className="text-emerald-500">Management</span></h1>
                        <p className="text-zinc-400">Track and manage your upcoming court reservations.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-sm font-bold">
                            <Filter className="h-4 w-4" /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all text-sm shadow-lg shadow-emerald-500/20">
                            <CalendarCheck className="h-4 w-4" /> Add Booking
                        </button>
                    </div>
                </div>

                {/* Dashboard Table Container */}
                <div className="bookings-table rounded-[2rem] border border-zinc-800 bg-zinc-900/40 overflow-hidden backdrop-blur-md">

                    {/* Toolbar */}
                    <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                            />
                        </div>
                        <div className="flex bg-zinc-950/50 p-1 rounded-lg border border-zinc-800">
                            <button className="px-4 py-1.5 rounded-md bg-zinc-800 text-white text-xs font-bold shadow-sm">All</button>
                            <button className="px-4 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 text-xs font-bold">Pending</button>
                            <button className="px-4 py-1.5 rounded-md text-zinc-500 hover:text-zinc-300 text-xs font-bold">Completed</button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900/80 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Booking ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Court</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {/* Mock Rows */}
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-zinc-500">#BK-839{item}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-[10px] font-bold text-white">
                                                    JD
                                                </div>
                                                <div className="text-sm font-bold text-white">John Doe</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-300">Court A - Badmintion</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs text-zinc-400">
                                                <span className="flex items-center gap-1.5 mb-0.5"><CalendarCheck className="h-3 w-3" /> Oct 24, 2024</span>
                                                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 16:00 - 18:00</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                                                <CheckCircle className="h-3 w-3" /> Confirmed
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-white text-right">LKR 4,500</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-between items-center text-xs text-zinc-500">
                        <span>Showing 1-5 of 12 bookings</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50">Prev</button>
                            <button className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all">Next</button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
