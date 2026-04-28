
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fmtTime, fmtMonthAbbr, fmtDayNum } from "@/lib/utils";
import { Calendar, Clock, MapPin, ChevronRight, Filter, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ReviewFormModal from "@/components/reviews/ReviewFormModal";
import { playerService } from "@/services/playerService";
import { Booking, BookingStatus } from "@/types";
import { useRequireAuth, AuthLoadingSpinner } from "@/components/auth/RequireAuth";

export default function BookingsPage() {
    const { user } = useAuth();
    const isAuthPending = useRequireAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filter, setFilter] = useState<"upcoming" | "past" | "cancelled">("upcoming");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

    const fetchBookings = useCallback(async () => {
        const data = await playerService.getBookings();
        setBookings(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user, fetchBookings]);

    // Auto-refresh while there are active payment_pending bookings whose hold hasn't expired yet,
    // so the list updates once the backend cancels them after the 5-minute hold window.
    useEffect(() => {
        const now = Date.now();
        const activePending = bookings.filter(
            (b) =>
                b.status === "payment_pending" &&
                b.hold_expires_at &&
                new Date(b.hold_expires_at).getTime() > now
        );
        if (activePending.length === 0) return;

        // Find the earliest expiry among active pending bookings
        const nextExpiry = Math.min(
            ...activePending.map((b) => new Date(b.hold_expires_at!).getTime())
        );
        const delay = nextExpiry - now + 2000; // 2 seconds grace period after expiry
        const timer = setTimeout(() => fetchBookings(), delay);
        return () => clearTimeout(timer);
    }, [bookings, fetchBookings]);

    const filteredBookings = bookings.filter((b) => {
        if (filter === "cancelled") return b.status === "cancelled" || b.status === "rejected";
        if (filter === "past") return b.status === "completed";
        // Exclude payment_pending bookings whose hold has already expired (backend will cancel them)
        if (b.status === "payment_pending" && b.hold_expires_at && new Date(b.hold_expires_at).getTime() <= Date.now()) {
            return false;
        }
        return ["confirmed", "payment_pending"].includes(b.status);
    });

    if (isAuthPending || !user) return <AuthLoadingSpinner />;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-primary mb-8">My Bookings</h1>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <TabButton active={filter === "upcoming"} onClick={() => setFilter("upcoming")} label="Upcoming" count={bookings.filter(b => ["confirmed", "payment_pending"].includes(b.status) && !(b.status === "payment_pending" && b.hold_expires_at && new Date(b.hold_expires_at).getTime() <= Date.now())).length} />
                    <TabButton active={filter === "past"} onClick={() => setFilter("past")} label="History" />
                    <TabButton active={filter === "cancelled"} onClick={() => setFilter("cancelled")} label="Cancelled" />
                </div>

                {/* List */}
                <div className="space-y-4">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-raised/50 rounded-2xl animate-pulse" />)
                    ) : filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <BookingCard 
                                key={booking.id} 
                                booking={booking} 
                                onReviewClick={() => setSelectedBookingForReview(booking)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-surface-raised/30 rounded-3xl border border-default">
                            <Calendar className="w-12 h-12 text-faint mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-primary mb-2">No bookings found</h3>
                            <p className="text-muted mb-6">You don&apos;t have any {filter} bookings.</p>
                            {filter === "upcoming" && (
                                <Link href="/venues">
                                    <Button className="bg-emerald-500 text-black font-bold">Find a Venue</Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            <Modal
                isOpen={!!selectedBookingForReview}
                onClose={() => setSelectedBookingForReview(null)}
                title="Rate your experience"
            >
                {selectedBookingForReview && (
                    <ReviewFormModal
                        venueId={selectedBookingForReview.court?.venue_id || ""}
                        bookingId={selectedBookingForReview.id}
                        onClose={() => setSelectedBookingForReview(null)}
                        onSuccess={() => {
                            // Refresh bookings to update review status if needed
                            playerService.getBookings().then(setBookings);
                        }}
                    />
                )}
            </Modal>
        </main>
    );
}

function TabButton({ active, onClick, label, count }: any) {
    return (
        <button
            onClick={onClick}
            className={`
        px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2
        ${active ? "bg-primary text-inverted" : "bg-surface-raised text-secondary hover:text-primary hover:bg-surface-overlay"}
      `}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-surface-base text-primary" : "bg-surface-overlay text-secondary"}`}>
                    {count}
                </span>
            )}
        </button>
    );
}

function BookingCard({ booking, onReviewClick }: { booking: Booking, onReviewClick: () => void }) {
    const statusConfig = {
        payment_pending: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Payment Pending" },
        confirmed: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Confirmed" },
        completed: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Completed" },
        cancelled: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Cancelled" },
        rejected: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Rejected" },
        blocked: { color: "text-muted", bg: "bg-zinc-500/10", border: "border-zinc-500/20", label: "Blocked" },
        maintenance: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Maintenance" },
    };

    const status = statusConfig[booking.status];

    return (
        <Link href={`/bookings/${booking.id}`} className="block group">
            <div className="bg-surface-raised/50 hover:bg-surface-overlay/50 border border-default hover:border-subtle rounded-2xl p-6 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">

                {/* Date Box */}
                <div className="flex-shrink-0 w-full md:w-20 bg-surface-sunken rounded-xl p-4 text-center border border-default group-hover:border-subtle transition-colors">
                    <div className="text-xs font-bold text-muted uppercase mb-1">{fmtMonthAbbr(booking.start_time)}</div>
                    <div className="text-2xl font-black text-primary">{fmtDayNum(booking.start_time)}</div>
                </div>

                {/* Info */}
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status.bg} ${status.color} ${status.border}`}>
                            {status.label}
                        </span>
                        <span className="text-xs font-mono text-faint uppercase">
                            REF: {booking.booking_reference}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-emerald-400 transition-colors">
                        {booking.court?.sport_type?.name || 'Sport'} at {booking.court?.venue_name || "Venue"}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-secondary">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {fmtTime(booking.start_time)} - {fmtTime(booking.end_time)}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.court?.name}
                        </div>
                    </div>
                </div>

                {/* Price & Arrow */}
                <div className="flex items-center gap-6 ml-auto">
                    <div className="text-right">
                        <div className="text-sm font-bold text-primary">LKR {booking.total_price.toLocaleString()}</div>
                        {booking.payment_status === "paid" && (
                            <div className="text-[10px] font-bold text-emerald-500 uppercase">Paid</div>
                        )}
                    </div>

                    {/* Leave Review Button */}
                    {booking.status === 'completed' && !booking.review && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onReviewClick();
                            }}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-full transition-colors"
                        >
                            Leave a Review
                        </button>
                    )}

                    <div className="p-2 rounded-full border border-default bg-surface-raised text-secondary group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>

            </div>
        </Link>
    );
}
