"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    Calendar, Clock, User, Phone, Check, Zap, X, MapPin,
    MoreHorizontal, Filter, Download
} from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Booking Data --
const MOCK_BOOKINGS = [
    { id: "vb1", customer: "John Doe", type: "App", date: "2026-02-14", time: "18:00 - 19:00", court: "Court A - Futsal", status: "confirmed", amount: 1800, payment: "Paid" },
    { id: "vb2", customer: "Walk-in #42", type: "Walk-in", date: "2026-02-14", time: "20:00 - 21:00", court: "Court A - Futsal", status: "confirmed", amount: 1800, payment: "Cash" },
    { id: "vb3", customer: "Sarah Smith", type: "App", date: "2026-02-15", time: "17:00 - 19:00", court: "Court C - Basketball", status: "pending", amount: 4400, payment: "Pending" },
    { id: "vb4", customer: "Mike Ross", type: "App", date: "2026-02-10", time: "10:00 - 11:00", court: "Court B - Badminton", status: "cancelled", amount: 1500, payment: "Refunded" },
];

export default function VenueBookingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".booking-row",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const filteredBookings = filterStatus === 'all'
        ? MOCK_BOOKINGS
        : MOCK_BOOKINGS.filter(b => b.status === filterStatus);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                <div className="page-header flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            All <span className="text-transparent bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text">Bookings</span>
                        </h1>
                        <p className="text-zinc-400">View and manage all reservations across your venue.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'confirmed', 'pending', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${filterStatus === status
                                    ? "bg-white text-black border-white"
                                    : "bg-black/40 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] overflow-hidden backdrop-blur-sm min-h-[400px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-6 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-3">Customer</div>
                        <div className="col-span-3">Date & Time</div>
                        <div className="col-span-2">Court</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1">Amount</div>
                        <div className="col-span-1 text-right"></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-zinc-800/50">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <div key={booking.id} className="booking-row grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors group cursor-pointer">
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                            ${booking.type === 'App' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {booking.type === 'App' ? <User className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{booking.customer}</h3>
                                            <span className="text-[10px] text-zinc-500 uppercase font-bold">{booking.type}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="text-zinc-300 text-sm font-medium flex items-center gap-2"><Calendar className="h-3 w-3" /> {booking.date}</div>
                                        <div className="text-zinc-500 text-xs flex items-center gap-2 mt-1"><Clock className="h-3 w-3" /> {booking.time}</div>
                                    </div>
                                    <div className="col-span-2 text-sm text-zinc-400">
                                        {booking.court}
                                    </div>
                                    <div className="col-span-2">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                                            ${booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-500' :
                                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'}
                                         `}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-sm font-bold text-white">
                                        LKR {booking.amount}
                                    </div>
                                    <div className="col-span-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-zinc-500">
                                No bookings found for this filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
