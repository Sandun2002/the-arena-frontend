
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmtTime, fmtMonthAbbr, fmtDayNum } from "@/lib/utils";
import { CalendarBlank, Clock, MapPin, CaretRight, Faders, MagnifyingGlass, Money, HandCoins } from "@phosphor-icons/react";
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
    const [filter, setFilter] = useState<"upcoming" | "past" | "cancelled" | "cash_pending">("upcoming");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchBookings = () => {
            playerService.getBookings().then((data) => {
                setBookings(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                setIsLoading(false);
            });
        };

        fetchBookings();

        // Re-fetch when the user returns to this tab/window (e.g. after completing payment).
        const handleVisibility = () => { if (document.visibilityState === "visible") fetchBookings(); };
        const handleFocus = () => fetchBookings();

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleFocus);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleFocus);
        };
    }, [user]);

    const isLiveUpcoming = (b: Booking): boolean => {
        if (b.status === "confirmed") return true;
        if (b.status !== "payment_pending") return false;
        if (!b.hold_expires_at) return true;
        return new Date(b.hold_expires_at) > new Date();
    };

    const filteredBookings = bookings.filter((b) => {
        if (filter === "cancelled") return b.status === "cancelled" || b.status === "rejected";
        if (filter === "past") return b.status === "completed";
        if (filter === "cash_pending") return !!b.is_cash_booking && !!b.is_cash_unpaid && b.status === "confirmed";
        return isLiveUpcoming(b);
    });

    if (isAuthPending || !user) return <AuthLoadingSpinner />;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-primary mb-8">My Bookings</h1>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <TabButton active={filter === "upcoming"} onClick={() => setFilter("upcoming")} label="Upcoming" count={bookings.filter(isLiveUpcoming).length} />
                    <TabButton active={filter === "cash_pending"} onClick={() => setFilter("cash_pending")} label="💵 Pay at Venue" count={bookings.filter(b => !!b.is_cash_booking && !!b.is_cash_unpaid && b.status === "confirmed").length} />
                    <TabButton active={filter === "past"} onClick={() => setFilter("past")} label="History" />
                    <TabButton active={filter === "cancelled"} onClick={() => setFilter("cancelled")} label="Cancelled / Rejected" />
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
                            <CalendarBlank size={48} weight="bold" className="text-faint mx-auto mb-4" />
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
    const statusConfig: Record<BookingStatus, { color: string; bg: string; border: string; label: string }> = {
        payment_pending: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Payment Pending" },
        confirmed: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Confirmed" },
        completed: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Completed" },
        cancelled: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Cancelled" },
        rejected: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Rejected by Venue" },
        expired: { color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", label: "Expired" },
        pending_approval: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Pending Approval" },
    };

    const status = statusConfig[booking.status] ?? statusConfig.cancelled;

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
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status.bg} ${status.color} ${status.border}`}>
                            {status.label}
                        </span>
                        {booking.is_cash_booking && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                                <Money size={9} weight="fill" /> Cash
                            </span>
                        )}
                        {booking.is_cash_unpaid && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                                <HandCoins size={9} weight="fill" /> Awaiting Collection
                            </span>
                        )}
                        <span className="text-xs font-mono text-faint uppercase">
                            REF: {booking.booking_reference}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-emerald-400 transition-colors">
                        {booking.court?.sport_type?.name || 'Sport'} at {booking.court?.venue_name || "Venue"}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-secondary">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} weight="bold" />
                            {fmtTime(booking.start_time)} - {fmtTime(booking.end_time)}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} weight="fill" />
                            {booking.court?.name}
                        </div>
                    </div>
                </div>

                {/* Price & Arrow */}
                <div className="flex items-center gap-6 ml-auto">
                    <div className="text-right">
                        <div className="text-sm font-bold text-primary">LKR {booking.total_price.toLocaleString()}</div>
                        {booking.is_cash_booking && booking.is_cash_unpaid ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 uppercase mt-0.5">
                                <Money size={10} weight="fill" /> Pay at Venue
                            </div>
                        ) : booking.payment_status === "paid" ? (
                            <div className="text-[10px] font-bold text-emerald-500 uppercase">Paid</div>
                        ) : null}
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
                        <CaretRight size={16} weight="bold" />
                    </div>
                </div>

            </div>
        </Link>
    );
}
