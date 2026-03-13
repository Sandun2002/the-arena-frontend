"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, MapPin, Clock, FileText, Share2, Download, Home } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";
import { format, parseISO } from "date-fns";
// Removing confetti import to avoid build errors if not installed.

export default function BookingConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && params.id) {
            playerService.getBookings().then(bookings => {
                const found = bookings.find(b => b.id === params.id);
                if (found) {
                    setBooking(found);
                } else {
                    // Handle not found
                    // router.push("/bookings");
                }
                setLoading(false);
            });
        }
    }, [user, params.id]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500">Loading...</div>;
    if (!booking) return <div className="min-h-screen bg-black pt-24 text-white text-center">Booking not found</div>;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-2xl text-center">

                <div className="mb-8 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                        <CheckCircle className="w-12 h-12 text-black" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Booking Confirmed!</h1>
                    <p className="text-zinc-400">Your court is reserved. Get ready to play.</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-md mb-8 text-left animate-in slide-in-from-bottom-8 duration-700">
                    <div className="p-6 md:p-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-800">
                            <div>
                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Booking Reference</p>
                                <p className="text-white text-2xl font-mono mobile:text-xl">{booking.booking_reference}</p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold uppercase">
                                Paid • Confirmed
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-500" /> Venue
                                </h3>
                                <p className="text-zinc-300 font-medium">{booking.court?.venue_name}</p>
                                <p className="text-zinc-500 text-sm">{booking.court?.name}</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-500" /> Date & Time
                                </h3>
                                <p className="text-zinc-300 font-medium">
                                    {format(parseISO(booking.start_time), "EEE, MMM d, yyyy")}
                                </p>
                                <p className="text-zinc-500 text-sm">
                                    {format(parseISO(booking.start_time), "h:mm a")} - {format(parseISO(booking.end_time), "h:mm a")}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-800">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-500" /> Payment Details
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Hourly Rate</span>
                                    <span className="text-zinc-300">LKR {booking.hourly_rate} x {booking.duration_hours} hrs</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Platform Fee</span>
                                    <span className="text-zinc-300">LKR {booking.platform_fee}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2">
                                    <span className="text-white">Total Amount</span>
                                    <span className="text-emerald-500">LKR {booking.total_price}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="bg-black/40 p-4 flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-800">
                        <span>Paid with {booking.payment_method === 'card' ? 'Credit Card' : 'Cash'}</span>
                        <span>{format(parseISO(booking.created_at), "MMM d, h:mm a")}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="/bookings" className="w-full md:w-auto">
                        <Button variant="outline" className="w-full text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500">
                            View My Bookings
                        </Button>
                    </Link>
                    <Link href="/" className="w-full md:w-auto">
                        <Button className="w-full bg-zinc-100 text-black hover:bg-white font-bold">
                            <Home className="w-4 h-4 mr-2" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
