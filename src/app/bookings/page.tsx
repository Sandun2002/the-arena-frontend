"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
    Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle
} from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import CancelBookingModal from "@/components/bookings/CancelBookingModal";


// -- Mock Booking Data --
const MY_BOOKINGS = [
    { id: "b1", venue: "Royal College Sports Complex", sport: "Futsal", date: "2026-02-15", time: "18:00 - 19:00", status: "upcoming", price: 1800, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop" },
    { id: "b2", venue: "CR & FC Grounds", sport: "Cricket", date: "2026-02-10", time: "16:00 - 18:00", status: "completed", price: 3500, image: "https://images.unsplash.com/photo-1531415074968-0dad6d8d5477?q=80&w=2669&auto=format&fit=crop" },
    { id: "b3", venue: "Colombo City Center", sport: "Bowling", date: "2026-01-20", time: "19:00 - 20:00", status: "cancelled", price: 2000, image: "https://images.unsplash.com/photo-1542880023-dfc37f446dbd?q=80&w=2670&auto=format&fit=crop" },
];

export default function MyBookingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [filter, setFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate List
            gsap.fromTo(".booking-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [filter]); // Re-animate on filter change

    const filteredBookings = filter === 'all'
        ? MY_BOOKINGS
        : MY_BOOKINGS.filter(b => b.status === filter);

    const handleCancelClick = (booking: any) => {
        setSelectedBooking(booking);
        setIsCancelModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            My <span className="text-transparent bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text">Bookings</span>
                        </h1>
                        <p className="text-zinc-400">View and manage all your upcoming games.</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-zinc-800">
                    {[
                        { id: 'all', label: 'All Bookings' },
                        { id: 'upcoming', label: 'Upcoming' },
                        { id: 'completed', label: 'History' },
                        { id: 'cancelled', label: 'Cancelled' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap
                                ${filter === tab.id
                                    ? "border-emerald-500 text-white"
                                    : "border-transparent text-zinc-500 hover:text-zinc-300"}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map(booking => (
                            <div key={booking.id} className="booking-card group bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-4 flex flex-col md:flex-row gap-6 hover:border-emerald-500/30 transition-all backdrop-blur-sm">
                                {/* Image Info */}
                                <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                    <Image src={booking.image} alt={booking.venue} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10
                                            ${booking.status === 'upcoming' ? 'bg-emerald-500/80 text-white' :
                                                booking.status === 'completed' ? 'bg-blue-500/80 text-white' :
                                                    'bg-red-500/80 text-white'}
                                        `}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 py-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{booking.venue}</h3>
                                        <p className="font-bold text-white">LKR {booking.price}</p>
                                    </div>
                                    <p className="text-zinc-400 text-sm mb-4">{booking.sport}</p>

                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-zinc-600" /> {booking.date}</span>
                                        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-zinc-600" /> {booking.time}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                    <Link href={`/bookings/${booking.id}`} className="w-full">
                                        <Button className="w-full text-xs bg-white text-black hover:bg-zinc-200">View Ticket</Button>
                                    </Link>

                                    {booking.status === 'upcoming' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleCancelClick(booking)}
                                            className="w-full text-xs border-red-900/30 text-red-500 hover:bg-red-900/10 hover:border-red-900/50"
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                    {booking.status === 'completed' && (
                                        <Button variant="outline" className="w-full text-xs border-zinc-700 hover:bg-zinc-800">
                                            Rebook
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/20">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
                            <p className="text-zinc-500 mb-6">You don't have any bookings in this category yet.</p>
                            <Link href="/venues">
                                <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold">Find a Court</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Modal */}
            <CancelBookingModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                booking={selectedBooking}
            />

        </main>
    );
}
