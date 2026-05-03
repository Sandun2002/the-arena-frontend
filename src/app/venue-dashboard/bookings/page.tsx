
"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isSameDay, isValid } from "date-fns";
import { fmtTime, fmtDateShort } from "@/lib/utils";
import { MagnifyingGlass, CheckCircle, XCircle, CurrencyDollar, UserMinus, WarningCircle, Calendar as CalendarIcon, CaretLeft, CaretRight, Globe, UserPlus, Hammer, ArrowsClockwise, Money, HandCoins, Prohibit, CreditCard } from "@phosphor-icons/react";
import { PaymentStatus } from "@/types";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { Booking } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";

const PAGE_SIZE = 20;

export default function BookingsPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    // All loaded bookings from current page (possibly filtered client-side by date)
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination state — driven by backend total
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [statusFilter, setStatusFilter] = useState<
        "all" | "payment_pending" | "confirmed" | "completed" | "cancelled" | "rejected"
    >("all");
    const [sourceFilter, setSourceFilter] = useState<"all" | "platform" | "walkin" | "blocked" | "cash">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, sourceFilter, debouncedSearch, selectedDate, currentVenue]);

    const loadBookings = useCallback(async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const result = await centerService.getBookingsList({
                venue_id: currentVenue.id,
                status: statusFilter !== "all" ? statusFilter : undefined,
                search: debouncedSearch || undefined,
                skip: (currentPage - 1) * PAGE_SIZE,
                limit: PAGE_SIZE,
            });
            setAllBookings(result.data);
            setTotalCount(result.total);
        } catch (error) {
            console.error(error);
            setAllBookings([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentVenue, statusFilter, debouncedSearch, currentPage]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const getBookingSource = (b: Booking): "platform" | "walkin" | "blocked" | "cash" => {
        if (b.is_blocked) return "blocked";
        if (b.is_manual) return "walkin";
        if (b.is_cash_booking) return "cash";
        return "platform";
    };

    // Client-side date + source filtering (backend doesn't support these params)
    const bookings = allBookings
        .filter((b) => {
            if (selectedDate) {
                try {
                    const startDate = new Date(b.start_time);
                    if (!isValid(startDate) || !isSameDay(startDate, selectedDate)) return false;
                } catch { return false; }
            }
            if (sourceFilter !== "all" && getBookingSource(b) !== sourceFilter) return false;
            return true;
        });

    const handleAction = async (action: string, id: string) => {
        if (!confirm(`Are you sure you want to ${action} this booking?`)) return;
        try {
            if (action === "confirm") await centerService.confirmBooking(id);
            if (action === "cancel") await centerService.cancelBooking(id, "Cancelled by venue");
            if (action === "pay") await centerService.markBookingPaid(id);
            if (action === "noshow") await centerService.toggleNoShow(id);
            if (action === "collect") await centerService.markCashCollected(id);
            if (action === "cash-noshow") await centerService.markCashNoShow(id);
            addToast("Status updated successfully", "success");
            loadBookings();
        } catch (error) {
            addToast("Failed to update booking", "error");
        }
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <WarningCircle size={48} weight="duotone" className="text-faint mb-4" />
                <h2 className="text-xl font-bold text-primary mb-2">No Venue Selected</h2>
                <p className="text-secondary">Please select a venue to view bookings.</p>
            </div>
        );
    }

    const firstItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(currentPage * PAGE_SIZE, totalCount);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tight mb-2">Bookings</h1>
                    <p className="text-secondary">Manage {currentVenue.name} reservations.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap">
                    {/* Date filter (client-side) */}
                    <div className="relative overflow-hidden group hover:bg-surface-overlay bg-surface-raised border border-default rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition-colors">
                        <CalendarIcon size={16} weight="duotone" className="text-emerald-500 flex-shrink-0" />
                        <span className="text-primary text-sm font-medium">
                            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "All Dates"}
                        </span>
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="ml-1 text-muted hover:text-primary text-xs font-bold leading-none"
                                title="Clear date filter"
                            >
                                ✕
                            </button>
                        )}
                        <input
                            type="date"
                            title="Filter by date"
                            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                                if (e.target.value) {
                                    const parts = e.target.value.split("-");
                                    if (parts.length === 3) {
                                        setSelectedDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                                    }
                                }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search name or ref..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-surface-raised border border-default rounded-xl text-sm text-primary focus:border-emerald-500 focus:outline-none w-full sm:w-64"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-surface-raised p-1 rounded-xl border border-default flex-wrap">
                        {(
                            [
                                { v: "all", label: "All" },
                                { v: "payment_pending", label: "Pending" },
                                { v: "confirmed", label: "Confirmed" },
                                { v: "completed", label: "Completed" },
                                { v: "cancelled", label: "Cancelled" },
                                { v: "rejected", label: "Rejected" },
                            ] as const
                        ).map(({ v, label }) => (
                            <button
                                key={v}
                                onClick={() => setStatusFilter(v)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${statusFilter === v
                                    ? "bg-surface-overlay text-primary shadow-sm"
                                    : "text-muted hover:text-secondary"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Source Filter */}
                    <div className="flex bg-surface-raised p-1 rounded-xl border border-default">
                        {(["all", "platform", "cash", "walkin", "blocked"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSourceFilter(s)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${sourceFilter === s
                                    ? "bg-surface-overlay text-primary shadow-sm"
                                    : "text-muted hover:text-secondary"
                                    }`}
                            >
                                {s === "walkin" ? "Walk-in" : s === "all" ? "All Sources" : s === "blocked" ? "Maintenance" : s === "cash" ? "💵 Cash" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-surface-raised/50 border border-default rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-raised/80 border-b border-default">
                            <tr>
                                <th className="p-5 text-xs font-bold text-muted uppercase tracking-wider">Booking Info</th>
                                <th className="p-5 text-xs font-bold text-muted uppercase tracking-wider">Customer</th>
                                <th className="p-5 text-xs font-bold text-muted uppercase tracking-wider">Court</th>
                                <th className="p-5 text-xs font-bold text-muted uppercase tracking-wider">Source</th>
                                <th className="p-5 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                                <th className="p-5 text-xs font-bold text-muted uppercase tracking-wider">Payment</th>
                                <th className="p-5 text-xs font-bold text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-default/50">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-12 text-center text-muted animate-pulse">Loading bookings...</td></tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-surface-overlay/30 transition-colors group">
                                        <td className="p-5">
                                            <span className="block font-mono text-[10px] text-muted mb-1">{booking.booking_reference}</span>
                                            <span className="block text-primary font-bold text-sm mb-0.5">{fmtDateShort(booking.start_time)}</span>
                                            <span className="text-secondary text-xs font-medium">{fmtTime(booking.start_time)} - {fmtTime(booking.end_time)}</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center text-xs font-bold text-muted">
                                                    {(booking.user?.full_name || booking.customer_name || "G").charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block text-primary font-bold text-sm">{booking.user?.full_name || booking.customer_name || "Guest"}</span>
                                                    <span className="text-muted text-xs">{booking.user?.phone_number || booking.customer_phone || "—"}</span>
                                                    {booking.is_no_show && <span className="inline-block mt-1 bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 rounded border border-red-500/20">NO SHOW</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-secondary text-sm font-medium">{booking.court?.name || "—"}</span>
                                            <span className="block text-muted text-xs capitalize">{booking.court?.sport_type?.name || ""}</span>
                                        </td>
                                        <td className="p-5">
                                            <SourceBadge booking={booking} />
                                        </td>
                                        <td className="p-5">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-primary font-bold text-sm">LKR {booking.total_price.toLocaleString()}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <PaymentStatusInline status={booking.payment_status} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Cash booking reconciliation actions */}
                                                {booking.is_cash_booking && booking.is_cash_unpaid && booking.status !== "cancelled" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAction("collect", booking.id)}
                                                            className="h-8 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1"
                                                            title="Mark cash collected"
                                                        >
                                                            <HandCoins size={13} weight="fill" /> Collected
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAction("cash-noshow", booking.id)}
                                                            className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center gap-1"
                                                            title="Mark as no-show"
                                                        >
                                                            <Prohibit size={13} weight="bold" /> No-Show
                                                        </Button>
                                                    </>
                                                )}
                                                {/* Standard actions (non-cash) */}
                                                {!booking.is_cash_booking && (
                                                    <>
                                                        {/* Walk-in PAYMENT_PENDING: Confirm (sets CONFIRMED+PAID in one step) */}
                                                        {booking.is_manual && booking.status === "payment_pending" && (
                                                            <Button size="sm" onClick={() => handleAction("confirm", booking.id)} className="h-8 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold">
                                                                Confirm
                                                            </Button>
                                                        )}
                                                        {/* Walk-in already CONFIRMED but unpaid: Mark as Paid only */}
                                                        {booking.is_manual && booking.status === "confirmed" && booking.payment_status !== "paid" && (
                                                            <Button size="sm" variant="outline" onClick={() => handleAction("pay", booking.id)} className="h-8 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 text-xs font-bold flex items-center gap-1" title="Mark as paid">
                                                                <CurrencyDollar size={12} weight="bold" /> Paid
                                                            </Button>
                                                        )}
                                                        {/* Platform card booking PAYMENT_PENDING (hold not yet confirmed by webhook): allow manual confirm */}
                                                        {!booking.is_manual && booking.status === "payment_pending" && (
                                                            <Button size="sm" onClick={() => handleAction("confirm", booking.id)} className="h-8 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold">
                                                                Confirm
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                                {/* No-show toggle: only for non-cash, non-cancelled bookings that have ended */}
                                                {booking.status !== "cancelled" && !booking.is_cash_booking && new Date(booking.end_time) <= new Date() && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => handleAction("noshow", booking.id)} className={`h-8 border-subtle ${booking.is_no_show ? "bg-red-500/20 text-red-500 border-red-500/20" : "text-secondary hover:text-red-400 hover:bg-red-500/10"}`} title="Toggle no-show">
                                                            <UserMinus size={12} weight="bold" />
                                                        </Button>
                                                    </>
                                                )}
                                                {/* Cancel: non-cash */}
                                                {booking.status !== "cancelled" && !booking.is_cash_booking && (
                                                    <Button size="sm" variant="outline" onClick={() => handleAction("cancel", booking.id)} className="h-8 border-subtle text-secondary hover:text-red-400 hover:bg-red-500/10" title="Cancel booking">
                                                        <XCircle size={12} weight="bold" />
                                                    </Button>
                                                )}
                                                {/* Allow cancel for unpaid cash (results in no-show if after start) */}
                                                {booking.is_cash_booking && booking.status !== "cancelled" && (
                                                    <Button size="sm" variant="outline" onClick={() => handleAction("cancel", booking.id)} className="h-8 border-subtle text-secondary hover:text-red-400 hover:bg-red-500/10" title="Cancel booking">
                                                        <XCircle size={12} weight="bold" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted">
                                            <MagnifyingGlass size={32} weight="duotone" className="mb-3 opacity-20" />
                                            <p className="font-medium">No bookings found</p>
                                            <p className="text-xs mt-1">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > 0 && (
                    <div className="bg-surface-raised border-t border-default px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-xs text-muted">
                            {selectedDate
                                ? `Showing ${bookings.length} of ${allBookings.length} results on this page (${totalCount} total)`
                                : `Showing ${firstItem}–${lastItem} of ${totalCount} bookings`}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2 rounded-lg bg-surface-overlay text-secondary hover:text-primary hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Previous page"
                            >
                                <CaretLeft size={16} weight="bold" />
                            </button>

                            {/* Page number pills */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((item, idx) =>
                                    item === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-faint text-xs select-none">…</span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setCurrentPage(item as number)}
                                            disabled={isLoading}
                                            className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-bold transition-colors disabled:cursor-wait ${currentPage === item
                                                ? "bg-emerald-500 text-black"
                                                : "bg-surface-overlay text-secondary hover:text-primary hover:bg-surface-overlay"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="p-2 rounded-lg bg-surface-overlay text-secondary hover:text-primary hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Next page"
                            >
                                <CaretRight size={16} weight="bold" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        payment_pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
        completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[status] || "bg-surface-overlay text-secondary border-subtle"}`}>
            {status.replace("_", " ")}
        </span>
    );
}

function PaymentStatusInline({ status }: { status: PaymentStatus | string }) {
    switch (status) {
        case "paid":
            return (
                <>
                    <CheckCircle size={12} weight="fill" className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500">PAID</span>
                </>
            );
        case "refunded":
            return (
                <>
                    <ArrowsClockwise size={12} weight="bold" className="text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400">REFUNDED</span>
                </>
            );
        case "failed":
            return (
                <>
                    <XCircle size={12} weight="fill" className="text-red-500" />
                    <span className="text-[10px] font-bold text-red-500">FAILED</span>
                </>
            );
        case "pending":
        default:
            return (
                <>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500">PENDING</span>
                </>
            );
    }
}

function SourceBadge({ booking }: { booking: Booking }) {
    if (booking.is_blocked) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-surface-overlay/30 text-secondary border-subtle/50 text-[10px] font-bold uppercase tracking-wider">
                <Hammer size={12} weight="fill" /> Maintenance
            </span>
        );
    }
    if (booking.is_manual) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] font-bold uppercase tracking-wider">
                <UserPlus size={12} weight="fill" /> Walk-in
            </span>
        );
    }
    if (booking.is_cash_booking) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px] font-bold uppercase tracking-wider">
                <Money size={12} weight="fill" /> Cash
            </span>
        );
    }
    // Platform booking — show card or cash-on-arrival payment method indicator
    const isCashOnArrival = booking.payment_method === "cash";
    return (
        <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                <Globe size={12} weight="fill" /> Platform
            </span>
            {isCashOnArrival ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] font-medium">
                    <Money size={10} weight="fill" /> Cash on Arrival
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-medium">
                    <CreditCard size={10} weight="fill" /> Card
                </span>
            )}
        </div>
    );
}
