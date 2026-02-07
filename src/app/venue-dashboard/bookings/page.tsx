"use client";

import Link from "next/link";
import { ArrowLeft, Filter, Search, MoreHorizontal, CalendarCheck, Clock, CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { VENUE_BOOKINGS, VenueBooking } from "@/services/userData";

type StatusFilter = "all" | "pending" | "confirmed" | "completed";

export default function VenueBookingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    // Filter bookings based on search and status
    const filteredBookings = VENUE_BOOKINGS.filter(booking => {
        const matchesSearch =
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.courtName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const getStatusBadge = (status: VenueBooking["status"]) => {
        const styles = {
            confirmed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            pending: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
            completed: "bg-blue-500/10 border-blue-500/20 text-blue-400",
            cancelled: "bg-red-500/10 border-red-500/20 text-red-400",
        };
        return styles[status];
    };

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-600"
                            />
                        </div>
                        <div className="flex bg-zinc-950/50 p-1 rounded-lg border border-zinc-800">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === "all" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter("pending")}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === "pending" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setStatusFilter("completed")}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === "completed" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Completed
                            </button>
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
                                {paginatedBookings.length > 0 ? (
                                    paginatedBookings.map((booking) => (
                                        <tr key={booking.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-zinc-500">#{booking.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-[10px] font-bold text-white">
                                                        {getInitials(booking.customerName)}
                                                    </div>
                                                    <div className="text-sm font-bold text-white">{booking.customerName}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-300">{booking.courtName}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-xs text-zinc-400">
                                                    <span className="flex items-center gap-1.5 mb-0.5"><CalendarCheck className="h-3 w-3" /> {booking.date}</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {booking.timeSlot}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(booking.status)}`}>
                                                    {booking.status === "confirmed" && <CheckCircle className="h-3 w-3" />}
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-white text-right">LKR {booking.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <p className="text-zinc-500 mb-2">No bookings found</p>
                                            <p className="text-zinc-600 text-sm">Try adjusting your search or filters</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-between items-center text-xs text-zinc-500">
                        <span>
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1.5 text-white font-bold">
                                {currentPage} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
