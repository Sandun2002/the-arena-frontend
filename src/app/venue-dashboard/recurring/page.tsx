
"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Repeat, Calendar, Clock, Edit2, Play, Pause, Trash2, Layers, Phone, ArrowRight, CalendarRange } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import RecurringFormModal from "@/components/venue/RecurringFormModal";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { RecurringBooking, Court } from "@/types";
import { useVenue } from "@/components/venue/VenueContext";
import { useToast } from "@/components/ui/Toast";

function formatDateShort(iso: string) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

export default function RecurringPage() {
    const { user, isVenueOwner } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    const [bookings, setBookings] = useState<RecurringBooking[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<RecurringBooking | null>(null);

    useEffect(() => {
        if (currentVenue) {
            loadData();
        }
    }, [currentVenue]);

    const loadData = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const [recurringData, courtsData] = await Promise.all([
                centerService.getRecurringBookings(currentVenue.id),
                centerService.getCourts(currentVenue.id)
            ]);
            setBookings(recurringData);
            setCourts(courtsData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingBooking(null);
        setIsModalOpen(true);
    };

    const handleEdit = (booking: RecurringBooking) => {
        setEditingBooking(booking);
        setIsModalOpen(true);
    };

    const handleTogglePause = async (booking: RecurringBooking) => {
        if (!currentVenue) return;
        try {
            if (booking.status === 'paused') {
                await centerService.resumeRecurringBooking(booking.id, currentVenue.id);
                addToast("Booking resumed", "success");
            } else {
                await centerService.pauseRecurringBooking(booking.id, currentVenue.id);
                addToast("Booking paused", "success");
            }
            loadData();
        } catch (error) {
            addToast("Action failed", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!currentVenue || !confirm("Permanently delete this recurring booking?")) return;
        try {
            await centerService.deleteRecurringBooking(id, currentVenue.id);
            addToast("Booking deleted", "success");
            loadData();
        } catch (error) {
            addToast("Delete failed", "error");
        }
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <Repeat className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400">Please select a venue to manage recurring bookings.</p>
            </div>
        );
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const statusConfig = {
        active: { label: "Active", dot: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-500/20", card: "border-zinc-800 hover:border-emerald-500/30" },
        paused: { label: "Paused", dot: "bg-amber-400", text: "text-amber-400", border: "border-amber-500/20", card: "border-amber-500/20 bg-amber-500/[0.03] hover:border-amber-400/40" },
        expired: { label: "Expired", dot: "bg-zinc-500", text: "text-zinc-500", border: "border-zinc-700/40", card: "border-zinc-800 opacity-60 hover:border-zinc-700" },
        cancelled: { label: "Cancelled", dot: "bg-red-500", text: "text-red-500", border: "border-red-500/20", card: "border-zinc-800 opacity-60 hover:border-zinc-700" },
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">

                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Recurring <span className="text-transparent bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text">Bookings</span>
                        </h1>
                        <p className="text-zinc-400">Manage long-term slot reservations for academies and corporate clients.</p>
                    </div>
                    <Button onClick={handleCreate} className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Plus className="mr-2 h-4 w-4" /> Create Recurring
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-64 bg-zinc-900/30 rounded-2xl animate-pulse" />)
                    ) : bookings.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 text-center py-16 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
                            <Repeat className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Recurring Bookings</h3>
                            <p className="text-zinc-500 mb-6">Set up your first ongoing reservation.</p>
                            <Button onClick={handleCreate}>Create Booking</Button>
                        </div>
                    ) : (
                        bookings.map(booking => {
                            const sc = statusConfig[booking.status] ?? statusConfig.cancelled;
                            const dayLabel = typeof booking.day_of_week === 'number' ? days[booking.day_of_week] : booking.day_of_week;
                            return (
                                <div key={booking.id} className={`recurring-card bg-zinc-900/50 border ${sc.card} rounded-2xl overflow-hidden backdrop-blur-sm transition-all`}>

                                    {/* Card header */}
                                    <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                                                <Repeat className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white text-lg leading-tight truncate">{booking.client_name}</h3>
                                                {booking.client_phone && (
                                                    <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                                                        <Phone className="h-3 w-3" />{booking.client_phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sc.text} ${sc.border} bg-zinc-900`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                {sc.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Key info grid */}
                                    <div className="grid grid-cols-2 gap-px bg-zinc-800/40 border-t border-b border-zinc-800/60">
                                        <div className="bg-zinc-900/80 px-4 py-3">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" /> Day
                                            </p>
                                            <p className="text-white font-semibold text-sm">Every {dayLabel}</p>
                                        </div>
                                        <div className="bg-zinc-900/80 px-4 py-3">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" /> Time
                                            </p>
                                            <p className="text-white font-semibold text-sm">{booking.start_time} – {booking.end_time}</p>
                                        </div>
                                        <div className="bg-zinc-900/80 px-4 py-3">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Layers className="h-3 w-3" /> Court
                                            </p>
                                            <p className="text-white font-semibold text-sm">{booking.court_name || "—"}</p>
                                        </div>
                                        <div className="bg-zinc-900/80 px-4 py-3">
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <CalendarRange className="h-3 w-3" /> Valid Period
                                            </p>
                                            <p className="text-white font-semibold text-sm flex items-center gap-1 flex-wrap">
                                                {formatDateShort(booking.start_date)}
                                                <ArrowRight className="h-3 w-3 text-zinc-500 shrink-0" />
                                                {formatDateShort(booking.end_date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer: next session + actions */}
                                    <div className="px-5 py-3 flex items-center justify-between gap-3">
                                        {booking.next_booking_date ? (
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-xs text-zinc-400">
                                                    Next: <strong className="text-white font-semibold">{formatDateShort(booking.next_booking_date)}</strong>
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-zinc-600 italic">No upcoming sessions</span>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleTogglePause(booking)}
                                                className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                                title={booking.status === 'paused' ? "Resume" : "Pause"}
                                            >
                                                {booking.status === 'paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(booking)}
                                                className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            {isVenueOwner && (
                                                <button
                                                    onClick={() => handleDelete(booking.id)}
                                                    className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBooking ? "Edit Recurring Booking" : "Create Recurring Booking"}>
                <RecurringFormModal
                    venueId={currentVenue.id}
                    courts={courts}
                    existingBooking={editingBooking}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        loadData();
                        setIsModalOpen(false);
                    }}
                />
            </Modal>
        </main>
    );
}
