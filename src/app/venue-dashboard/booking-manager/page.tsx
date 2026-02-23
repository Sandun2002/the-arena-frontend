"use client";

import { useEffect, useState } from "react";
import { format, addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Clock, User, DollarSign, Wallet, CheckCircle, XCircle, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { Booking, Court } from "@/types";
import { useVenue } from "@/components/venue/VenueContext";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function BookingManagerPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeCourtId, setActiveCourtId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState<number>(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            customer_name: "",
            customer_phone: "",
            duration: 1,
            payment_method: "cash"
        }
    });

    const duration = watch("duration");
    const paymentMethod = watch("payment_method");
    const activeCourt = courts.find(c => c.id === activeCourtId);
    const totalPrice = activeCourt ? activeCourt.hourly_rate * duration : 0;

    useEffect(() => {
        if (currentVenue) {
            loadSchedule();
        }
    }, [currentVenue, selectedDate]);

    useEffect(() => {
        // Set first court active by default if not set
        if (courts.length > 0 && !activeCourtId) {
            setActiveCourtId(courts[0].id);
        }
    }, [courts]);

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
            addToast("Failed to load schedule", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevDay = () => setSelectedDate(prev => addDays(prev, -1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    const openBookingModal = (hour: number) => {
        setSelectedHour(hour);
        reset({ customer_name: "", customer_phone: "", duration: 1, payment_method: "cash" });
        setIsModalOpen(true);
    };

    const onSubmitWalkIn = async (data: any) => {
        if (!currentVenue || !activeCourtId) return;
        setIsSubmitting(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            // Format time correctly (e.g. "08:00")
            const timeStr = `${selectedHour.toString().padStart(2, '0')}:00`;
            const startDateTime = new Date(`${dateStr}T${timeStr}`);

            // Calculate end time
            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(startDateTime.getHours() + data.duration);

            await centerService.createManualBooking({
                venue_id: currentVenue.id,
                court_id: activeCourtId,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                customer_name: data.customer_name || "Walk-in Guest",
                customer_phone: data.customer_phone,
                total_price: totalPrice,
                is_manual: true,
                payment_status: data.payment_method === "card" ? "paid" : "pending",
                payment_method: data.payment_method
            });

            addToast("Walk-in booking recorded successfully", "success");
            setIsModalOpen(false);
            loadSchedule();
        } catch (error: any) {
            console.error(error);
            addToast(error.response?.data?.message || "Failed to record booking. Slot might be taken.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmBookingState = async (id: string) => {
        if (!confirm("Mark this booking as paid and confirmed?")) return;
        try {
            await centerService.markBookingPaid(id);
            addToast("Booking confirmed and marked paid", "success");
            loadSchedule();
        } catch (error) {
            addToast("Failed to update booking", "error");
        }
    };

    const cancelBookingState = async (id: string) => {
        if (!confirm("Cancel this walk-in booking?")) return;
        try {
            await centerService.cancelBooking(id, "Cancelled by manager");
            addToast("Booking cancelled", "success");
            loadSchedule();
        } catch (error) {
            addToast("Failed to cancel booking", "error");
        }
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getBookingForSlot = (courtId: string, hour: number) => {
        return bookings.find(b => {
            // Basic timezone-agnostic check per standard ISO strings (assuming UTC format is matching server or local correctly in previous implementation)
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
                <p className="text-zinc-400">Please select a venue to manage bookings.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">Booking Manager</h1>
                    <p className="text-zinc-400">Manage slots for <span className="text-emerald-500 font-bold">{activeCourt?.name || "the venue"}</span></p>
                </div>

                {/* Date Picker (Top Right) */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-lg shadow-black/50">
                    <button onClick={handlePrevDay} className="p-3 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors active:scale-95">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="px-2 relative cursor-pointer group hover:bg-zinc-800 rounded-lg transition-colors py-2 flex items-center gap-2" onClick={() => (document.getElementById('date-picker') as HTMLInputElement)?.showPicker()}>
                        <CalendarIcon className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-bold text-sm tracking-wide">{format(selectedDate, "MM/dd/yyyy")}</span>
                        <CalendarIcon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />

                        {/* Hidden Native Date Picker overlay */}
                        <input
                            id="date-picker"
                            type="date"
                            value={format(selectedDate, "yyyy-MM-dd")}
                            onChange={(e) => {
                                if (e.target.value) {
                                    // Make sure to parse it safely into local time avoiding timezone shift issues
                                    const parts = e.target.value.split('-');
                                    if (parts.length === 3) {
                                        setSelectedDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                                    }
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    <button onClick={handleNextDay} className="p-3 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors active:scale-95">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Court Selector Buttons */}
            {courts.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-2">
                    {courts.map(court => (
                        <button
                            key={court.id}
                            onClick={() => setActiveCourtId(court.id)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold whitespace-nowrap transition-all border
                                ${activeCourtId === court.id
                                    ? "bg-zinc-800 text-white border-zinc-700 shadow-lg"
                                    : "bg-black/40 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                                }
                            `}
                        >
                            <MapPin className={`w-4 h-4 ${activeCourtId === court.id ? "text-emerald-500" : "text-zinc-500"}`} />
                            {court.name}
                        </button>
                    ))}
                </div>
            )}

            {/* 24-Hour Slots Grid */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm min-h-[60vh]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-20">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                        <p>Loading slots...</p>
                    </div>
                ) : !activeCourtId ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-20">
                        <p>No courts available. Please add courts first.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                        {hours.map(hour => {
                            const slotStart = new Date(selectedDate);
                            slotStart.setHours(hour, 0, 0, 0);
                            const slotEnd = new Date(slotStart);
                            slotEnd.setHours(hour + 1);

                            const booking = getBookingForSlot(activeCourtId, hour);
                            const isPast = slotEnd < new Date();

                            return (
                                <div key={hour} className={`flex gap-4 ${isPast && !booking ? 'opacity-50' : ''}`}>
                                    {/* Time Indicator */}
                                    <div className="w-24 flex-shrink-0 text-right pt-4">
                                        <p className="text-sm font-bold text-zinc-300">{format(slotStart, "h:mm a")}</p>
                                        <p className="text-xs text-zinc-600 font-medium">to {format(slotEnd, "h:mm a")}</p>
                                    </div>

                                    {/* Slot Card */}
                                    <div className="flex-1 min-h-[85px]">
                                        {booking ? (
                                            <div className={`
                                                h-full rounded-2xl p-4 border transition-all flex justify-between items-center group relative overflow-hidden backdrop-blur-sm
                                                ${booking.status === "confirmed" || booking.payment_status === "paid"
                                                    ? "bg-emerald-500/10 border-emerald-500/20 shadow-[inset_4px_0_0_0_rgba(16,185,129,1)] hover:bg-emerald-500/15"
                                                    : "bg-amber-500/10 border-amber-500/20 shadow-[inset_4px_0_0_0_rgba(245,158,11,1)] hover:bg-amber-500/15"
                                                }
                                            `}>
                                                {/* Details */}
                                                <div>
                                                    <p className="font-bold text-white text-base">{booking.user?.full_name || booking.customer_name || "Guest"}</p>
                                                    <p className={`text-xs mt-1 font-medium ${booking.status === "confirmed" || booking.payment_status === "paid" ? "text-emerald-500/70" : "text-amber-500/70"}`}>
                                                        {activeCourt?.name}
                                                    </p>
                                                </div>

                                                {/* Badges/Actions */}
                                                <div className="flex flex-col items-end gap-2">
                                                    {booking.status === "payment_pending" ? (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-500 uppercase tracking-widest border border-amber-500/30">
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-500 uppercase tracking-widest border border-emerald-500/30">
                                                            <CheckCircle className="w-3 h-3" /> Paid
                                                        </span>
                                                    )}

                                                    {/* Manager actions for pending walk-ins */}
                                                    {booking.status === "payment_pending" && (
                                                        <div className="absolute top-0 right-0 h-full flex items-center gap-1.5 px-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent">
                                                            <button
                                                                onClick={() => confirmBookingState(booking.id)}
                                                                title="Mark as Paid"
                                                                className="p-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-xl transition-all shadow-lg active:scale-95"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => cancelBookingState(booking.id)}
                                                                title="Cancel Booking"
                                                                className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => !isPast ? openBookingModal(hour) : null}
                                                className={`h-full rounded-2xl p-4 border transition-all flex items-center justify-between group
                                                    ${isPast
                                                        ? "bg-black/20 border-zinc-800/50 cursor-not-allowed"
                                                        : "bg-black/40 border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                                    }
                                                `}
                                            >
                                                <span className={`font-bold ${isPast ? "text-zinc-600" : "text-emerald-500"}`}>
                                                    Available
                                                </span>
                                                {!isPast && (
                                                    <span className="text-sm font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                                                        + Book
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Walk-in Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Booking">
                <div className="mb-6">
                    <p className="text-zinc-400">Record a manual booking for {currentVenue.name}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmitWalkIn)} className="space-y-6">
                    {/* Court Info (Read-only since it's pre-selected) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Selected Court</label>
                        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white flex justify-between items-center opacity-70">
                            <span>{activeCourt?.name}</span>
                            <span className="text-sm font-bold text-emerald-500">LKR {activeCourt?.hourly_rate}/hr</span>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</label>
                            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white opacity-70 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                                {format(selectedDate, "MMM dd, yyyy")}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Start Time</label>
                            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white opacity-70 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                {format(new Date().setHours(selectedHour, 0, 0, 0), "h:mm a")}
                            </div>
                        </div>
                    </div>

                    {/* Duration Selectors */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration</label>
                        <div className="flex bg-black/40 border border-zinc-700/50 rounded-xl p-1 gap-1">
                            {[1, 2, 3, 4].map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => setValue("duration", h)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${duration === h ? "bg-emerald-500 text-black shadow-lg scale-100" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                                >
                                    {h}h
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Customer details */}
                    <div className="space-y-4 pt-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Customer Details</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                {...register("customer_name", { required: true })}
                                placeholder="Name (Required)"
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600 focus:bg-black"
                            />
                            <input
                                {...register("customer_phone", { required: true })}
                                placeholder="Phone (Required)"
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600 focus:bg-black"
                            />
                        </div>
                        {(errors.customer_name || errors.customer_phone) && <p className="text-red-500 text-xs font-bold">Name and Phone are required.</p>}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`
                                border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all
                                ${paymentMethod === "cash" ? "bg-emerald-500/10 border-emerald-500" : "bg-black/40 border-zinc-800 hover:border-zinc-700"}
                            `}>
                                <input type="radio" value="cash" {...register("payment_method")} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cash" ? "border-emerald-500" : "border-zinc-600"}`}>
                                    {paymentMethod === "cash" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                </div>
                                <span className="font-bold text-white text-sm">Cash</span>
                            </label>
                            <label className={`
                                border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all
                                ${paymentMethod === "card" ? "bg-emerald-500/10 border-emerald-500" : "bg-black/40 border-zinc-800 hover:border-zinc-700"}
                            `}>
                                <input type="radio" value="card" {...register("payment_method")} className="hidden" />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "card" ? "border-emerald-500" : "border-zinc-600"}`}>
                                    {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                </div>
                                <span className="font-bold text-white text-sm">Card</span>
                            </label>
                        </div>
                    </div>

                    <div className="h-px bg-zinc-800/50 my-6" />

                    {/* Summary & Submit */}
                    <div className="pt-2">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Due</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">LKR {totalPrice.toLocaleString()}</span>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Receipt & Book"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
