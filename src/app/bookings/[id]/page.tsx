"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Calendar, Check, Clock, MapPin, Share2, Printer,
    MessageCircle, AlertTriangle, Download
} from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock My Bookings (Copied for demo context) --
const MY_BOOKINGS = [
    {
        id: "b-123",
        venue_name: "Emerald Turf Arena",
        date: "2026-02-10",
        time: "18:00 - 19:00",
        court: "Court A - Futsal",
        price: 1500,
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop",
        address: "123 Bauddhaloka Mawatha, Colombo 07",
        payment_status: "Paid",
        qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ARENA-B-123"
    }
];

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const booking = MY_BOOKINGS.find(b => b.id === params.id) || MY_BOOKINGS[0]; // Fallback to first for demo

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".booking-card",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    if (!booking) return <div>Booking not found</div>;

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                <Link href="/bookings" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to My Bookings
                </Link>

                <div className="booking-card grid lg:grid-cols-3 gap-8">

                    {/* -- Left: Booking Details -- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Header Card */}
                        <div className="relative rounded-[2rem] overflow-hidden border border-zinc-800 group">
                            <div className="relative h-64 w-full">
                                <Image src={booking.image} alt={booking.venue_name} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tight">{booking.venue_name}</h1>
                                    <div className="flex flex-wrap gap-4 text-zinc-300">
                                        <span className="flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                                            <MapPin className="h-4 w-4 text-emerald-500" /> {booking.address}
                                        </span>
                                        <span className="flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                                            <Trophy className="h-4 w-4 text-emerald-500" /> {booking.court}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">Date</p>
                                        <p className="text-xl font-bold text-white">{booking.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">Time</p>
                                        <p className="text-xl font-bold text-white">{booking.time}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-zinc-400">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${booking.status === 'upcoming' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-300'}
                                    `}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-zinc-400">Payment</span>
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                                        <Check className="h-4 w-4" /> {booking.payment_status}
                                    </span>
                                </div>
                                <div className="h-px bg-zinc-800 w-full mb-4" />
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold text-lg">Total Paid</span>
                                    <span className="text-white font-bold text-xl">LKR {booking.price.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Map Preview (Static Image for now) */}
                        <div className="h-64 rounded-[2rem] overflow-hidden border border-zinc-800 relative grayscale hover:grayscale-0 transition-all duration-500">
                            <Image
                                src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2662&auto=format&fit=crop"
                                alt="Map Location"
                                fill
                                className="object-cover opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button variant="outline" className="bg-black/80 backdrop-blur text-white border-white/20">
                                    Get Directions <MapPin className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* -- Right: Actions & QR -- */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* QR Code Ticket */}
                        <div className="bg-white text-black p-8 rounded-[2rem] shadow-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                            <h3 className="font-black text-2xl mb-1 uppercase">Entry Pass</h3>
                            <p className="text-zinc-500 text-xs mb-6 uppercase tracking-widest font-bold">Scan at gate</p>

                            <div className="w-48 h-48 mx-auto bg-white p-2 border-4 border-black rounded-xl mb-6">
                                {/* Using a placeholder QR image service */}
                                <img src={booking.qr_code} alt="Booking QR" className="w-full h-full" />
                            </div>

                            <p className="font-mono text-lg font-bold tracking-widest">#{booking.id.toUpperCase()}</p>

                            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-black rounded-full" />
                            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-black rounded-full" />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button className="w-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 flex justify-between group">
                                <span>Download Ticket</span>
                                <Download className="h-5 w-5 text-zinc-500 group-hover:text-white" />
                            </Button>
                            <Button className="w-full bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 flex justify-between group">
                                <span>Contact Venue</span>
                                <MessageCircle className="h-5 w-5 text-zinc-500 group-hover:text-white" />
                            </Button>
                            <Button className="w-full bg-red-900/10 border border-red-900/30 text-red-500 hover:bg-red-900/20 flex justify-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> Cancel Booking
                            </Button>
                        </div>

                        <p className="text-xs text-zinc-600 text-center leading-relaxed">
                            Cancellations are allowed up to 24 hours before the slot time.
                            Refunds will be processed to your original payment method.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
