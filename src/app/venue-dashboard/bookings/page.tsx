
"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isSameDay, isValid } from "date-fns";
import { Search, CheckCircle, XCircle, DollarSign, UserX, AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Globe, UserPlus, Hammer } from "lucide-react";
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
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
    const [sourceFilter, setSourceFilter] = useState<"all" | "platform" | "walkin" | "blocked">("all");
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

    const getBookingSource = (b: Booking): "platform" | "walkin" | "blocked" => {
        if (b.status === "blocked" || b.status === "maintenance") return "blocked";
        if (b.is_manual) return "walkin";
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
                <AlertCircle className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400">Please select a venue to view bookings.</p>
            </div>
        );
    }

    const firstItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(currentPage * PAGE_SIZE, totalCount);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Bookings</h1>
                    <p className="text-zinc-400">Manage {currentVenue.name} reservations.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-wrap">
                    {/* Date filter (client-side) */}
                    <div className="relative overflow-hidden group hover:bg-zinc-800 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition-colors">
                        <CalendarIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-white text-sm font-medium">
                            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "All Dates"}
                        </span>
                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="ml-1 text-zinc-500 hover:text-white text-xs font-bold leading-none"
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search name or ref..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:border-emerald-500 focus:outline-none w-full sm:w-64"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${statusFilter === s
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Source Filter */}
                    <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        {(["all", "platform", "walkin", "blocked"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setSourceFilter(s)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${sourceFilter === s
                                    ? "bg-zinc-800 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                {s === "walkin" ? "Walk-in" : s === "all" ? "All Sources" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-900/80 border-b border-zinc-800">
                            <tr>
                                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Booking Info</th>
                                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Customer</th>
                                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Court</th>
                                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Source</th>
                                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment</th>
                                <th className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-12 text-center text-zinc-500 animate-pulse">Loading bookings...</td></tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="p-5">
                                            <span className="block font-mono text-[10px] text-zinc-500 mb-1">{booking.booking_reference}</span>
                                            <span className="block text-white font-bold text-sm mb-0.5">{format(new Date(booking.start_time), "MMM dd, yyyy")}</span>
                                            <span className="text-zinc-400 text-xs font-medium">{format(new Date(booking.start_time), "h:mm a")} - {format(new Date(booking.end_time), "h:mm a")}</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                                                    {(booking.user?.full_name || booking.customer_name || "G").charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block text-white font-bold text-sm">{booking.user?.full_name || booking.customer_name || "Guest"}</span>
                                                    <span className="text-zinc-500 text-xs">{booking.user?.phone_number || booking.customer_phone || "—"}</span>
                                                    {booking.is_no_show && <span className="inline-block mt-1 bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 rounded border border-red-500/20">NO SHOW</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-zinc-300 text-sm font-medium">{booking.court?.name || "—"}</span>
                                            <span className="block text-zinc-500 text-xs capitalize">{booking.court?.sport_type?.name || ""}</span>
                                        </td>
                                        <td className="p-5">
                                            <SourceBadge booking={booking} />
                                        </td>
                                        <td className="p-5">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white font-bold text-sm">LKR {booking.total_price.toLocaleString()}</span>
                                                <div className="flex items-center gap-1.5">
                                                    {booking.payment_status === "paid" ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                            <span className="text-[10px] font-bold text-emerald-500">PAID</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            <span className="text-[10px] font-bold text-amber-500">PENDING</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {booking.status === "payment_pending" && (
                                                    <Button size="sm" onClick={() => handleAction("confirm", booking.id)} className="h-8 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold">
                                                        Confirm
                                                    </Button>
                                                )}
                                                {booking.payment_status !== "paid" && booking.status !== "cancelled" && (
                                                    <Button size="sm" variant="outline" onClick={() => handleAction("pay", booking.id)} className="h-8 border-zinc-700 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400" title="Mark as paid">
                                                        <DollarSign className="w-3 h-3" />
                                                    </Button>
                                                )}
                                                {booking.status !== "cancelled" && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => handleAction("noshow", booking.id)} className={`h-8 border-zinc-700 ${booking.is_no_show ? "bg-red-500/20 text-red-500 border-red-500/20" : "text-zinc-400 hover:text-red-400 hover:bg-red-500/10"}`} title="Toggle no-show">
                                                            <UserX className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleAction("cancel", booking.id)} className="h-8 border-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-500/10" title="Cancel booking">
                                                            <XCircle className="w-3 h-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <Search className="w-8 h-8 mb-3 opacity-20" />
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
                    <div className="bg-zinc-900 border-t border-zinc-800 px-5 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <span className="text-xs text-zinc-500">
                            {selectedDate
                                ? `Showing ${bookings.length} of ${allBookings.length} results on this page (${totalCount} total)`
                                : `Showing ${firstItem}–${lastItem} of ${totalCount} bookings`}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
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
                                        <span key={`ellipsis-${idx}`} className="px-2 text-zinc-600 text-xs select-none">…</span>
                                    ) : (
                                        <button
                                            key={item}
                                            onClick={() => setCurrentPage(item as number)}
                                            disabled={isLoading}
                                            className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-bold transition-colors disabled:cursor-wait ${currentPage === item
                                                ? "bg-emerald-500 text-black"
                                                : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
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
        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[status] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
            {status.replace("_", " ")}
        </span>
    );
}

function SourceBadge({ booking }: { booking: Booking }) {
    if (booking.status === "blocked" || booking.status === "maintenance") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-zinc-700/30 text-zinc-400 border-zinc-600/50 text-[10px] font-bold uppercase tracking-wider">
                <Hammer className="w-3 h-3" /> Blocked
            </span>
        );
    }
    if (booking.is_manual) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] font-bold uppercase tracking-wider">
                <UserPlus className="w-3 h-3" /> Walk-in
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
            <Globe className="w-3 h-3" /> Platform
        </span>
    );
}
