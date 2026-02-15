
"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { Booking, Venue, Court } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function CalendarPage() {
    const { user } = useAuth();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) setSelectedVenueId(data[0].id);
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedVenueId) {
            setIsLoading(true);
            Promise.all([
                venueService.getCourts(selectedVenueId),
                venueService.getVenueBookings(selectedVenueId)
            ]).then(([courtsData, bookingsData]) => {
                setCourts(courtsData);
                setBookings(bookingsData);
                setIsLoading(false);
            });
        }
    }, [selectedVenueId]);

    const handlePrevDay = () => setSelectedDate(prev => addDays(prev, -1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

    const getBookingForSlot = (courtId: string, hour: number) => {
        return bookings.find(b => {
            const bookingStart = new Date(b.start_time);
            return (
                b.court_id === courtId &&
                isSameDay(bookingStart, selectedDate) &&
                bookingStart.getHours() === hour &&
                (b.status === "confirmed" || b.status === "payment_pending" || b.status === "completed")
            );
        });
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
                        <p className="text-zinc-400">View schedule and availability.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {venues.length > 1 && (
                            <select
                                value={selectedVenueId}
                                onChange={(e) => setSelectedVenueId(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                            >
                                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    {/* Date Control */}
                    <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900">
                        <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                            <h2 className="text-white font-bold">{format(selectedDate, "EEEE, MMMM do")}</h2>
                            <p className="text-zinc-500 text-xs">Daily View</p>
                        </div>
                        <button onClick={handleNextDay} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-12 text-center text-zinc-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Loading schedule...</div>
                        ) : (
                            <div className="min-w-[800px]">
                                {/* Header Row (Courts) */}
                                <div className="flex border-b border-zinc-800">
                                    <div className="w-20 flex-shrink-0 p-3 bg-zinc-900/50 border-r border-zinc-800 sticky left-0 z-10"></div>
                                    {courts.map(court => (
                                        <div key={court.id} className="flex-1 p-3 text-center border-r border-zinc-800 min-w-[150px]">
                                            <p className="text-white font-bold text-sm truncate">{court.name}</p>
                                            <p className="text-zinc-500 text-xs">{court.sport_type}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Time Slots */}
                                {hours.map(hour => (
                                    <div key={hour} className="flex border-b border-zinc-800/50">
                                        <div className="w-20 flex-shrink-0 p-3 text-right text-xs text-zinc-500 border-r border-zinc-800 bg-zinc-900/30 sticky left-0 font-mono">
                                            {format(new Date().setHours(hour, 0), "h a")}
                                        </div>
                                        {courts.map(court => {
                                            const booking = getBookingForSlot(court.id, hour);
                                            return (
                                                <div key={court.id} className="flex-1 min-w-[150px] border-r border-zinc-800/50 relative h-16 group">
                                                    {booking ? (
                                                        <div className={`absolute inset-1 rounded-lg p-2 text-xs font-bold overflow-hidden ${booking.status === "confirmed" ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" :
                                                                booking.status === "payment_pending" ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                                                                    "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                                                            }`}>
                                                            <p className="truncate">{booking.user?.full_name || "Guest"}</p>
                                                            <p className="text-[10px] opacity-70 truncate">{booking.status === "payment_pending" ? "Unpaid" : "Paid"}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full hover:bg-white/5 transition-colors cursor-pointer" title="Available"></div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
