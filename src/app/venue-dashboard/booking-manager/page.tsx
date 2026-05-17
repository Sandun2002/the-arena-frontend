"use client";

import { useEffect, useState, useRef } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { CaretLeft, CaretRight, CircleNotch, Calendar as CalendarIcon, Clock, CurrencyDollar, CheckCircle, XCircle, MapPin, Hammer, Globe, UserPlus, UserCheck, ArrowsClockwise, Lightning, ArrowsCounterClockwise } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { Booking, Court, RecurringBlock } from "@/types";
import { useVenue } from "@/components/venue/VenueContext";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

function getBookingType(booking: Booking): "platform" | "walkin" | "maintenance" {
    if (booking.is_blocked) return "maintenance";
    if (booking.is_manual) return "walkin";
    return "platform";
}

export default function BookingManagerPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [recurringBlocks, setRecurringBlocks] = useState<RecurringBlock[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeCourtId, setActiveCourtId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState<Date>(new Date());
    
    const [operatingSchedule, setOperatingSchedule] = useState<any[]>([]);
    const [isVenueClosed, setIsVenueClosed] = useState(false);
    const [closureReason, setClosureReason] = useState<string | null>(null);

    const prevBookingIdsRef = useRef<Set<string>>(new Set());

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

    const venueAcceptance = currentVenue?.accepted_payment_methods || "both";
    const allowCard = venueAcceptance === "card_only" || venueAcceptance === "both";
    const allowCash = venueAcceptance === "cash_only" || venueAcceptance === "both";

    useEffect(() => {
        if (paymentMethod === "cash" && !allowCash) setValue("payment_method", "card");
        else if (paymentMethod === "card" && !allowCard) setValue("payment_method", "cash");
    }, [allowCard, allowCash, paymentMethod, setValue]);

    useEffect(() => {
        if (currentVenue) {
            loadSchedule();
            const isToday = isSameDay(selectedDate, new Date());
            const pollMs = isToday ? 15000 : 30000;
            const intervalId = setInterval(loadSchedule, pollMs);
            return () => clearInterval(intervalId);
        }
    }, [currentVenue, selectedDate]);

    useEffect(() => {
        if (courts.length > 0 && !activeCourtId) {
            setActiveCourtId(courts[0].id);
        }
    }, [courts]);

    const loadSchedule = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const [courtsData, scheduleData, profileData, closuresData] = await Promise.all([
                centerService.getCourts(currentVenue.id),
                centerService.getBookingsByDate(dateStr, currentVenue.id),
                centerService.getProfile(currentVenue.id),
                centerService.getClosures(currentVenue.id, false)
            ]);
            setCourts(courtsData);
            setBookings(scheduleData.bookings);
            setRecurringBlocks(scheduleData.recurringBlocks);
            setOperatingSchedule(profileData?.operating_schedule || []);
            setLastSynced(new Date());

            // Detect new bookings for toast
            const currentIds = new Set(scheduleData.bookings.map(b => b.id));
            if (prevBookingIdsRef.current.size > 0) {
                const newCount = [...currentIds].filter(id => !prevBookingIdsRef.current.has(id)).length;
                if (newCount > 0) {
                    addToast(`${newCount} new booking${newCount > 1 ? 's' : ''} arrived!`, "success");
                }
            }
            prevBookingIdsRef.current = currentIds;

            // Check closure from schedule data or manual closure list
            const isClosedFromSchedule = scheduleData.isClosed;
            const matchedClosure = closuresData.find((c: any) => {
                const start = new Date(c.start_date ?? c.closure_date);
                start.setHours(0, 0, 0, 0);
                const end = c.end_date ? new Date(c.end_date) : new Date(start);
                end.setHours(23, 59, 59, 999);
                return selectedDate >= start && selectedDate <= end;
            });
            setIsVenueClosed(isClosedFromSchedule || !!matchedClosure);
            setClosureReason(scheduleData.closureReason || matchedClosure?.reason || null);

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
        if (isVenueClosed) return;
        setSelectedHour(hour);
        reset({ customer_name: "", customer_phone: "", duration: 1, payment_method: "cash" });
        setIsModalOpen(true);
    };

    const onSubmitWalkIn = async (data: any) => {
        if (!currentVenue || !activeCourtId) return;
        setIsSubmitting(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const timeStr = `${selectedHour.toString().padStart(2, '0')}:00`;
            const startDateTime = new Date(`${dateStr}T${timeStr}`);
            const endDateTime = new Date(startDateTime);
            endDateTime.setHours(startDateTime.getHours() + data.duration);

            const finalStartDateTime = startDateTime;

            await centerService.createManualBooking({
                court_id: activeCourtId,
                start_time: finalStartDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                customer_name: data.customer_name || "Walk-in Guest",
                customer_phone: data.customer_phone,
                total_price: totalPrice,
                is_manual: true,
                payment_status: data.payment_method === "card" ? "paid" : "pending",
                payment_method: data.payment_method
            }, currentVenue.id);

            addToast("Walk-in booking recorded successfully", "success");
            setIsModalOpen(false);
            loadSchedule();
        } catch (error: any) {
            console.error(error);
            addToast(error.response?.data?.detail || error.response?.data?.message || "Failed to record booking. Slot might be taken.", "error");
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

    const getOperatingHoursForDate = () => {
        if (!operatingSchedule.length) return Array.from({ length: 24 }, (_, i) => i);
        
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = dayNames[selectedDate.getDay()];
        const daySchedule = operatingSchedule.find(s => s.day.toLowerCase() === currentDayName);
        
        if (!daySchedule || daySchedule.is_closed || !daySchedule.open || !daySchedule.close) {
            return [];
        }
        
        const openHour = parseInt(daySchedule.open.split(':')[0], 10);
        let closeHour = parseInt(daySchedule.close.split(':')[0], 10);
        if (closeHour === 0 || closeHour < openHour) closeHour = 24;
        
        const hoursList = [];
        for (let i = Math.max(0, openHour); i < Math.min(24, closeHour); i++) {
            hoursList.push(i);
        }
        return hoursList;
    };

    const hours = getOperatingHoursForDate();

    const getBookingForSlot = (courtId: string, hour: number) => {
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1);

        return bookings.find(b => {
            const bStart = new Date(b.start_time);
            const bEnd = new Date(b.end_time);
            return (
                b.court_id === courtId &&
                bStart < slotEnd &&
                bEnd > slotStart &&
                // Real backend BookingStatus values that occupy the slot.
                // Maintenance/blocked is encoded via the is_blocked flag, not status.
                (b.status === "confirmed" || b.status === "payment_pending" || b.status === "completed" || b.is_blocked === true)
            );
        });
    };

    const getRecurringForSlot = (courtId: string, hour: number) => {
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1);

        return recurringBlocks.find(rb => {
            const bStart = new Date(rb.start_time);
            const bEnd = new Date(rb.end_time);
            return rb.court_id === courtId && bStart < slotEnd && bEnd > slotStart;
        });
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <CalendarIcon className="w-12 h-12 text-faint mb-4" />
                <h2 className="text-xl font-bold text-primary mb-2">No Venue Selected</h2>
                <p className="text-secondary">Please select a venue to manage bookings.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-surface-raised/50 border border-default rounded-3xl backdrop-blur-sm gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tight mb-1">Booking Manager</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-secondary">Manage slots for <span className="text-emerald-500 font-bold">{activeCourt?.name || "the venue"}</span></p>
                        <span className="flex items-center gap-1.5 text-[10px] text-faint font-medium">
                            <ArrowsCounterClockwise size={12} weight="bold" />
                            {format(lastSynced, "HH:mm:ss")}
                        </span>
                    </div>
                </div>

                {/* Date Picker (Top Right) */}
                <div className="flex items-center bg-surface-raised border border-default rounded-xl p-1 shadow-lg shadow-[var(--shadow-elevation)]">
                    <button onClick={handlePrevDay} className="p-3 hover:bg-surface-overlay rounded-lg text-secondary hover:text-primary transition-colors active:scale-95">
                        <CaretLeft size={20} weight="bold" />
                    </button>

                    <div className="px-2 relative cursor-pointer group hover:bg-surface-overlay rounded-lg transition-colors py-2 flex items-center gap-2" onClick={() => (document.getElementById('date-picker') as HTMLInputElement)?.showPicker()}>
                        <CalendarIcon size={16} weight="duotone" className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-primary font-bold text-sm tracking-wide">{format(selectedDate, "MM/dd/yyyy")}</span>
                        {isSameDay(selectedDate, new Date()) && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">TODAY</span>
                        )}
                        <input
                            id="date-picker"
                            type="date"
                            value={format(selectedDate, "yyyy-MM-dd")}
                            onChange={(e) => {
                                if (e.target.value) {
                                    const parts = e.target.value.split('-');
                                    if (parts.length === 3) {
                                        setSelectedDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                                    }
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    <button onClick={handleNextDay} className="p-3 hover:bg-surface-overlay rounded-lg text-secondary hover:text-primary transition-colors active:scale-95">
                        <CaretRight size={20} weight="bold" />
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
                                    ? "bg-surface-overlay text-primary border-subtle shadow-lg"
                                    : "bg-surface-base/40 text-secondary border-default hover:border-subtle hover:text-primary"
                                }
                            `}
                        >
                            <MapPin size={16} weight={activeCourtId === court.id ? "fill" : "bold"} className={activeCourtId === court.id ? "text-emerald-500" : "text-muted"} />
                            {court.name}
                        </button>
                    ))}
                </div>
            )}

            {/* 24-Hour Slots Grid */}
            <div className="bg-surface-raised/40 border border-default rounded-3xl p-6 md:p-8 backdrop-blur-sm min-h-[60vh]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted py-20">
                        <CircleNotch size={32} weight="bold" className="animate-spin mb-4 text-emerald-500" />
                        <p>Loading slots...</p>
                    </div>
                ) : isVenueClosed || hours.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-500/80 py-20 border border-red-500/10 rounded-2xl bg-red-500/5">
                        <CalendarIcon size={48} weight="duotone" className="mb-4 text-red-500/60" />
                        <h2 className="text-xl font-bold mb-2 text-red-400">Venue Closed</h2>
                        <p className="text-red-400/80">{closureReason || `The venue is not operating on ${format(selectedDate, "MMM dd, yyyy")}.`}</p>
                    </div>
                ) : !activeCourtId ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted py-20">
                        <p>No courts available. Please add courts first.</p>
                    </div>
                ) : (
                    <>
                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-default/60">
                            <span className="text-[10px] font-bold text-faint uppercase tracking-widest">Legend</span>
                            <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                                <Globe size={12} weight="bold" className="text-blue-400" />
                                <span>Platform</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                                <UserPlus size={12} weight="bold" className="text-orange-400" />
                                <span>Walk-in</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                                <ArrowsClockwise size={12} weight="bold" className="text-indigo-400" />
                                <span>Recurring</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                                <Hammer size={12} weight="bold" className="text-muted" />
                                <span>Maintenance</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-secondary">
                                <Lightning size={12} weight="bold" className="text-green-400" />
                                <span>Live Now</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                            {hours.map(hour => {
                                const slotStart = new Date(selectedDate);
                                slotStart.setHours(hour, 0, 0, 0);
                                const slotEnd = new Date(slotStart);
                                slotEnd.setHours(hour + 1);

                                const booking = getBookingForSlot(activeCourtId, hour);
                                const recurring = !booking ? getRecurringForSlot(activeCourtId, hour) : undefined;
                                const isPast = slotEnd <= new Date();
                                const isLive = slotStart <= new Date() && new Date() < slotEnd;

                                return (
                                    <div key={hour} className={`flex gap-4 ${isPast && !booking && !recurring ? 'opacity-50' : ''}`}>
                                        {/* Time Indicator */}
                                        <div className="w-24 flex-shrink-0 text-right pt-4">
                                            <p className={`text-sm font-bold ${isLive ? 'text-green-400' : 'text-secondary'}`}>{format(slotStart, "h:mm a")}</p>
                                            <p className="text-xs text-faint font-medium">to {format(slotEnd, "h:mm a")}</p>
                                        </div>

                                        {/* Slot Card */}
                                        <div className="flex-1 min-h-[85px]">
                                            {booking ? (
                                                <BookingSlotCard
                                                    booking={booking}
                                                    isLive={isLive}
                                                    activeCourt={activeCourt}
                                                    onConfirm={confirmBookingState}
                                                    onCancel={cancelBookingState}
                                                />
                                            ) : recurring ? (
                                                <RecurringSlotCard recurring={recurring} isLive={isLive} />
                                            ) : (
                                                <div
                                                    onClick={() => !isPast && !isVenueClosed ? openBookingModal(hour) : null}
                                                    className={`h-full rounded-2xl p-4 border transition-all flex items-center justify-between group
                                                        ${isPast || isVenueClosed
                                                            ? "bg-surface-base/20 border-default/50 cursor-not-allowed"
                                                            : "bg-surface-base/40 border-default hover:border-emerald-500/40 hover:bg-emerald-500/5 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                                        }
                                                    `}
                                                >
                                                    <span className={`font-bold ${isPast || isVenueClosed ? "text-faint" : "text-emerald-500"}`}>
                                                        {isVenueClosed ? "Closed" : "Available"}
                                                    </span>
                                                    {!isPast && !isVenueClosed && (
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
                    </>
                )}
            </div>

            {/* Walk-in Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Booking">
                <div className="mb-6">
                    <p className="text-secondary">Record a manual booking for {currentVenue.name}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmitWalkIn)} className="space-y-6">
                    {/* Court Info (Read-only since it's pre-selected) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Selected Court</label>
                        <div className="w-full bg-surface-raised border border-default rounded-xl px-4 py-3.5 text-primary flex justify-between items-center opacity-70">
                            <span>{activeCourt?.name}</span>
                            <span className="text-sm font-bold text-emerald-500">LKR {activeCourt?.hourly_rate}/hr</span>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Date</label>
                            <div className="w-full bg-surface-raised border border-default rounded-xl px-4 py-3 text-primary opacity-70 flex items-center gap-2">
                                <CalendarIcon size={16} weight="duotone" className="text-emerald-500" />
                                {format(selectedDate, "MMM dd, yyyy")}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Start Time</label>
                            <div className="w-full bg-surface-raised border border-default rounded-xl px-4 py-3 text-primary opacity-70 flex items-center gap-2">
                                <Clock size={16} weight="duotone" className="text-emerald-500" />
                                {format(new Date().setHours(selectedHour, 0, 0, 0), "h:mm a")}
                            </div>
                        </div>
                    </div>

                    {/* Duration Selectors */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Duration</label>
                        <div className="flex bg-surface-base/40 border border-subtle/50 rounded-xl p-1 gap-1">
                            {[1, 2, 3, 4].map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => setValue("duration", h)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${duration === h ? "bg-emerald-500 text-black shadow-lg scale-100" : "text-secondary hover:text-primary hover:bg-surface-overlay"}`}
                                >
                                    {h}h
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Customer details */}
                    <div className="space-y-4 pt-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Customer Details</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                {...register("customer_name", { required: true })}
                                placeholder="Name (Required)"
                                className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3.5 text-primary focus:border-emerald-500 focus:outline-none transition-all placeholder:text-faint focus:bg-surface-base"
                            />
                            <input
                                {...register("customer_phone", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Phone must be exactly 10 digits"
                                    }
                                })}
                                type="tel"
                                maxLength={10}
                                placeholder="Phone — 10 digits (Required)"
                                className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3.5 text-primary focus:border-emerald-500 focus:outline-none transition-all placeholder:text-faint focus:bg-surface-base"
                            />
                        </div>
                        {errors.customer_name && <p className="text-red-500 text-xs font-bold mt-1">Name is required.</p>}
                        {errors.customer_phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.customer_phone.message as string}</p>}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`
                                border rounded-xl p-4 flex items-center gap-3 transition-all
                                ${!allowCash
                                    ? "bg-surface-base/20 border-default/30 cursor-not-allowed opacity-40"
                                    : paymentMethod === "cash"
                                        ? "bg-emerald-500/10 border-emerald-500 cursor-pointer"
                                        : "bg-surface-base/40 border-default hover:border-subtle cursor-pointer"}
                            `}>
                                <input type="radio" value="cash" {...register("payment_method")} className="hidden" disabled={!allowCash} />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cash" ? "border-emerald-500" : "border-subtle"}`}>
                                    {paymentMethod === "cash" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                </div>
                                <span className="font-bold text-primary text-sm">{allowCash ? "Cash" : "Cash — not accepted"}</span>
                            </label>
                            <label className={`
                                border rounded-xl p-4 flex items-center gap-3 transition-all
                                ${!allowCard
                                    ? "bg-surface-base/20 border-default/30 cursor-not-allowed opacity-40"
                                    : paymentMethod === "card"
                                        ? "bg-emerald-500/10 border-emerald-500 cursor-pointer"
                                        : "bg-surface-base/40 border-default hover:border-subtle cursor-pointer"}
                            `}>
                                <input type="radio" value="card" {...register("payment_method")} className="hidden" disabled={!allowCard} />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "card" ? "border-emerald-500" : "border-subtle"}`}>
                                    {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                </div>
                                <span className="font-bold text-primary text-sm">{allowCard ? "Card" : "Card — not accepted"}</span>
                            </label>
                        </div>
                    </div>

                    <div className="h-px bg-surface-overlay/50 my-6" />

                    {/* Summary & Submit */}
                    <div className="pt-2">
                        <div className="bg-surface-raised border border-default rounded-2xl p-4 mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <CurrencyDollar size={20} weight="bold" className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted font-bold uppercase tracking-wider">Total Due</p>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-primary tracking-tight">LKR {totalPrice.toLocaleString()}</span>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                        >
                            {isSubmitting ? <CircleNotch size={20} weight="bold" className="animate-spin mx-auto" /> : "Confirm Receipt & Book"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function BookingSlotCard({
    booking,
    isLive,
    activeCourt,
    onConfirm,
    onCancel,
}: {
    booking: Booking;
    isLive: boolean;
    activeCourt: Court | undefined;
    onConfirm: (id: string) => void;
    onCancel: (id: string) => void;
}) {
    const type = getBookingType(booking);
    const isCompleted = booking.status === "completed";
    const isConfirmed = booking.status === "confirmed";
    const isPending = booking.status === "payment_pending";
    const isMaintenance = type === "maintenance";

    const borderColor = isMaintenance
        ? "shadow-[inset_4px_0_0_0_rgba(161,161,170,0.8)]"
        : isCompleted
        ? "shadow-[inset_4px_0_0_0_rgba(96,165,250,1)]"
        : isConfirmed
        ? "shadow-[inset_4px_0_0_0_rgba(16,185,129,1)]"
        : "shadow-[inset_4px_0_0_0_rgba(245,158,11,1)]";

    const bgColor = isMaintenance
        ? "bg-surface-overlay/50 border-subtle/50 hover:bg-surface-overlay/70"
        : isCompleted
        ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15"
        : isConfirmed
        ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15"
        : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15";

    return (
        <div className={`h-full rounded-2xl p-4 border transition-all flex justify-between items-center group relative overflow-hidden backdrop-blur-sm ${bgColor} ${borderColor}`}>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-primary text-base truncate">{booking.user?.full_name || booking.customer_name || "Guest"}</p>
                    {isLive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            LIVE
                        </span>
                    )}
                </div>
                <p className={`text-xs mt-0.5 font-medium truncate ${isMaintenance ? "text-muted" : isCompleted ? "text-blue-400/70" : isConfirmed ? "text-emerald-500/70" : "text-amber-500/70"}`}>
                    {activeCourt?.name}
                    {booking.customer_phone && <span className="text-faint ml-2">{booking.customer_phone}</span>}
                </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                {/* Source badge */}
                {isMaintenance ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-surface-overlay/30 text-secondary border-subtle/50 uppercase tracking-wider">
                        <Hammer size={10} weight="bold" /> Maintenance
                    </span>
                ) : type === "walkin" ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/30 uppercase tracking-wider">
                        {isConfirmed ? <UserCheck size={10} weight="bold" /> : <UserPlus size={10} weight="bold" />} Walk-in
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/30 uppercase tracking-wider">
                        <Globe size={10} weight="bold" /> Platform
                    </span>
                )}

                {/* Status badge */}
                {!isMaintenance && (
                    isPending ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-amber-500/20 text-amber-500 border-amber-500/30 uppercase tracking-wider">
                            Pending
                        </span>
                    ) : isCompleted ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase tracking-wider">
                            <CheckCircle size={10} weight="bold" /> Completed
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-emerald-500/20 text-emerald-500 border-emerald-500/30 uppercase tracking-wider">
                            <CheckCircle size={10} weight="bold" /> Confirmed
                        </span>
                    )
                )}

                {/* Pending actions — hover-reveal on desktop */}
                {isPending && (
                    <div className="flex items-center gap-1 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:px-3 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-all lg:duration-300 lg:translate-x-4 lg:group-hover:translate-x-0 lg:bg-gradient-to-l lg:from-amber-500/20 lg:via-amber-500/10 lg:to-transparent">
                        <button
                            onClick={() => onConfirm(booking.id)}
                            title="Mark as Paid"
                            className="p-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            <CheckCircle size={16} weight="bold" />
                        </button>
                        <button
                            onClick={() => onCancel(booking.id)}
                            title="Cancel Booking"
                            className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-primary rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            <XCircle size={16} weight="bold" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function RecurringSlotCard({ recurring, isLive }: { recurring: RecurringBlock; isLive: boolean }) {
    return (
        <div className="h-full rounded-2xl p-4 border transition-all flex justify-between items-center backdrop-blur-sm bg-indigo-500/10 border-indigo-500/20 shadow-[inset_4px_0_0_0_rgba(99,102,241,1)] hover:bg-indigo-500/15">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-primary text-base truncate">{recurring.customer_name}</p>
                    {isLive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            LIVE
                        </span>
                    )}
                </div>
                <p className="text-xs mt-0.5 font-medium text-indigo-400/70 truncate">{recurring.court_name}</p>
            </div>
            <div className="flex-shrink-0 ml-3">
                <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/30 uppercase tracking-wider">
                    <ArrowsClockwise size={10} weight="bold" /> Recurring
                </span>
            </div>
        </div>
    );
}
