
"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Repeat, Calendar, Clock, MoreVertical, Edit2, Play, Pause, Trash2, Layers } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import RecurringFormModal from "@/components/venue/RecurringFormModal";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { RecurringBooking, Court } from "@/types";
import { useVenue } from "@/components/venue/VenueContext";
import { useToast } from "@/components/ui/Toast";

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-64 bg-zinc-900/30 rounded-[2rem] animate-pulse" />)
                    ) : bookings.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 text-center py-16 bg-zinc-900/20 rounded-3xl border border-zinc-800 border-dashed">
                            <Repeat className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Recurring Bookings</h3>
                            <p className="text-zinc-500 mb-6">Set up your first ongoing reservation.</p>
                            <Button onClick={handleCreate}>Create Booking</Button>
                        </div>
                    ) : (
                        bookings.map(booking => (
                            <div key={booking.id} className={`recurring-card bg-zinc-900/40 border ${booking.status === 'paused' ? 'border-amber-500/20 bg-amber-500/5' : 'border-zinc-800'} rounded-[2rem] p-8 backdrop-blur-sm group hover:border-emerald-500/30 transition-all relative`}>

                                <div className="absolute top-6 right-6 flex gap-2 transition-opacity">
                                    <button onClick={() => handleTogglePause(booking)} className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title={booking.status === 'paused' ? "Resume" : "Pause"}>
                                        {booking.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                    </button>
                                    <button onClick={() => handleEdit(booking)} className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Edit">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    {isVenueOwner && (
                                        <button onClick={() => handleDelete(booking.id)} className="p-2 rounded-full bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition-colors" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Repeat className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl">{booking.client_name}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${booking.status === 'active' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                                                booking.status === 'paused' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                                                    'text-red-500 bg-red-500/10 border-red-500/20'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                        <span className="text-zinc-500 text-sm flex items-center gap-2"><Calendar className="h-4 w-4" /> Frequency</span>
                                        <span className="text-white font-medium text-sm">
                                            Every {typeof booking.day_of_week === 'number' ? days[booking.day_of_week] : booking.day_of_week}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                        <span className="text-zinc-500 text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Time</span>
                                        <span className="text-white font-medium text-sm">{booking.start_time} - {booking.end_time}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                        <span className="text-zinc-500 text-sm flex items-center gap-2"><Layers className="h-4 w-4" /> Court</span>
                                        <span className="text-white font-medium text-sm">{booking.court_name}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                        <span className="text-zinc-500 text-sm">Valid Period</span>
                                        <span className="text-white font-medium text-sm text-right">
                                            {booking.start_date} <br /> <span className="text-zinc-500 text-xs">to</span> {booking.end_date}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    {booking.next_booking_date ? (
                                        <span className="text-xs text-zinc-500">
                                            Next Session: <strong className="text-white">{booking.next_booking_date}</strong>
                                        </span>
                                    ) : (
                                        <span className="text-xs text-zinc-500">No upcoming sessions</span>
                                    )}
                                </div>
                            </div>
                        ))
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
