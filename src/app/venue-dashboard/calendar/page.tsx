
"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { Booking, Court } from "@/types";
import { useVenue } from "@/components/venue/VenueContext";

export default function CalendarPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentVenue) {
            loadSchedule();
        }
    }, [currentVenue, selectedDate]);

    const loadSchedule = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const [courtsData, bookingsData] = await Promise.all([
                centerService.getCourts(currentVenue.id),
                centerService.getBookingsByDate(dateStr, currentVenue.id)
            ]);
            setCourts(courtsData);
            setBookings(bookingsData);
        } catch (error) {
            console.error("Failed to load calendar data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevDay = () => setSelectedDate(prev => addDays(prev, -1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
    const handleToday = () => setSelectedDate(new Date());

    const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

    const getBookingForSlot = (courtId: string, hour: number) => {
        return bookings.find(b => {
            // Assuming API returns timezone-aware ISO strings. 
            // We need to parse safely.
            const bookingStart = new Date(b.start_time);
            return (
                b.court_id === courtId &&
                bookingStart.getHours() === hour &&
                (b.status === "confirmed" || b.status === "payment_pending" || b.status === "completed")
            );
        });
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <CalendarIcon className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400">Please select a venue to view the schedule.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">Calendar</h1>
                    <p className="text-zinc-400">Daily schedule for {currentVenue.name}</p>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 text-center min-w-[140px]">
                        <span className="block text-white font-bold text-sm">{format(selectedDate, "EEE, MMM do")}</span>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{isSameDay(selectedDate, new Date()) ? "Today" : format(selectedDate, "yyyy")}</span>
                    </div>
                    <button onClick={handleNextDay} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <button onClick={handleToday} className="hidden md:block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors">
                    Jump to Today
                </button>
            </div>

            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col min-h-0">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                        <p>Loading schedule...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar relative">
                        <div className="min-w-[800px] h-full flex flex-col">
                            {/* Header Row (Courts) */}
                            <div className="flex sticky top-0 z-20 bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-md">
                                <div className="w-16 flex-shrink-0 p-3 bg-zinc-900/50 border-r border-zinc-800 sticky left-0 z-30">
                                    <Clock className="w-5 h-5 text-zinc-600 mx-auto" />
                                </div>
                                {courts.map(court => (
                                    <div key={court.id} className="flex-1 p-4 text-center border-r border-zinc-800 min-w-[180px]">
                                        <p className="text-white font-bold text-sm truncate">{court.name}</p>
                                        <div className="flex justify-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">{court.sport_type}</span>
                                            {court.is_indoor && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 uppercase">Indoor</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Time Grid */}
                            <div className="flex-1">
                                {hours.map(hour => (
                                    <div key={hour} className="flex border-b border-zinc-800/50 h-20">
                                        {/* Time Column */}
                                        <div className="w-16 flex-shrink-0 p-2 text-center text-xs text-zinc-500 border-r border-zinc-800 bg-zinc-900/30 sticky left-0 font-mono font-medium z-10 flex items-start justify-center pt-3">
                                            {format(new Date().setHours(hour, 0), "h a")}
                                        </div>

                                        {/* Court Slots */}
                                        {courts.map(court => {
                                            const booking = getBookingForSlot(court.id, hour);
                                            return (
                                                <div key={court.id} className="flex-1 min-w-[180px] border-r border-zinc-800/50 relative group p-1">
                                                    {booking ? (
                                                        <div className={`
                                                            w-full h-full rounded-xl p-2.5 text-xs font-bold overflow-hidden shadow-lg transition-transform hover:scale-[1.02] cursor-pointer border
                                                            ${booking.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" :
                                                                booking.status === "payment_pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20" :
                                                                    "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                                                            }
                                                        `}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <User className="w-3 h-3 opacity-70" />
                                                                <p className="truncate">{booking.user?.full_name || booking.customer_name || "Guest"}</p>
                                                            </div>
                                                            <p className="text-[10px] opacity-70 truncate mb-1">
                                                                {format(new Date(booking.start_time), "h:mm")} - {format(new Date(booking.end_time), "h:mm a")}
                                                            </p>
                                                            <div className="flex gap-1 mt-auto">
                                                                {booking.status === "payment_pending" && <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded uppercase">Unpaid</span>}
                                                                {booking.is_manual && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded uppercase">Manual</span>}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full rounded-xl hover:bg-emerald-500/5 hover:border hover:border-emerald-500/20 transition-all cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <span className="text-emerald-500 font-bold text-xs">+ Book</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
