
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Filter, CheckCircle, XCircle, DollarSign, UserX } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { Booking, Venue } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function OwnerBookingsPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

    useEffect(() => {
        if (user) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) {
                    setSelectedVenueId(data[0].id);
                }
            });
        }
    }, [user]);

    const loadBookings = async () => {
        setIsLoading(true);
        const data = await venueService.getVenueBookings(selectedVenueId);
        setBookings(data.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
        setIsLoading(false);
    };

    useEffect(() => {
        if (selectedVenueId) {
            loadBookings();
        }
    }, [selectedVenueId]);

    const handleStatusUpdate = async (bookingId: string, status: string) => {
        try {
            await venueService.updateBookingStatus(bookingId, status as any);
            addToast(`Booking marked as ${status}`, "success");
            loadBookings();
        } catch (error) {
            addToast("Failed to update status", "error");
        }
    };

    const handleMarkPaid = async (bookingId: string) => {
        try {
            await venueService.markBookingPaid(bookingId);
            addToast("Payment recorded", "success");
            loadBookings();
        } catch (error) {
            addToast("Failed to record payment", "error");
        }
    };

    const handleMarkNoShow = async (bookingId: string) => {
        try {
            await venueService.toggleNoShow(bookingId);
            addToast("No-show status updated", "success");
            loadBookings();
        } catch (error) {
            addToast("Failed to update no-show", "error");
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === "pending") return b.status === "payment_pending";
        if (filter === "confirmed") return b.status === "confirmed";
        return true;
    });

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Booking Management</h1>
                        <p className="text-zinc-400">Track and manage all bookings for your venue.</p>
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
                        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                            <button onClick={() => setFilter("all")} className={`px-3 py-1 text-xs font-bold rounded ${filter === "all" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}>All</button>
                            <button onClick={() => setFilter("pending")} className={`px-3 py-1 text-xs font-bold rounded ${filter === "pending" ? "bg-amber-500/20 text-amber-500" : "text-zinc-400 hover:text-white"}`}>Pending</button>
                            <button onClick={() => setFilter("confirmed")} className={`px-3 py-1 text-xs font-bold rounded ${filter === "confirmed" ? "bg-emerald-500/20 text-emerald-500" : "text-zinc-400 hover:text-white"}`}>Confirmed</button>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 border-b border-zinc-800">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Ref / Date</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Customer</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Court / Details</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase">Payment</th>
                                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Loading...</td></tr>
                                ) : filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-4">
                                                <span className="block font-mono text-xs text-zinc-400 mb-1">{booking.booking_reference}</span>
                                                <span className="block text-white font-bold text-sm">{format(new Date(booking.start_time), "MMM dd")}</span>
                                                <span className="text-zinc-500 text-xs">{format(new Date(booking.start_time), "h:mm a")} - {format(new Date(booking.end_time), "h:mm a")}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="block text-white font-medium text-sm">{booking.user?.full_name || "Walk-in Guest"}</span>
                                                <span className="text-zinc-500 text-xs">{booking.user?.phone_number || "—"}</span>
                                                {booking.is_no_show && <span className="inline-block mt-1 bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 rounded border border-red-500/20">NO SHOW</span>}
                                            </td>
                                            <td className="p-4">
                                                <span className="block text-white text-sm">{booking.court?.name}</span>
                                                <span className="text-zinc-500 text-xs">{booking.sport}</span>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold text-sm">LKR {booking.total_price.toLocaleString()}</span>
                                                    {booking.payment_status === "paid" ? (
                                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">UNPAID</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {booking.status !== "cancelled" && booking.status !== "rejected" && (
                                                    <>
                                                        {booking.payment_status !== "paid" && (
                                                            <Button size="sm" variant="ghost" onClick={() => handleMarkPaid(booking.id)} title="Mark Paid" className="text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400">
                                                                <DollarSign className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="ghost" onClick={() => handleMarkNoShow(booking.id)} title="Toggle No-Show" className={`${booking.is_no_show ? "text-red-500 bg-red-500/10" : "text-zinc-400 hover:text-red-400 hover:bg-red-500/10"}`}>
                                                            <UserX className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No bookings found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        payment_pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
        completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[status] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
            {status.replace("_", " ")}
        </span>
    );
}
