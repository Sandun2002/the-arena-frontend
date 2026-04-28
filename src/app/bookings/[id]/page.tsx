
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fmtTime, fmtDateShort, fmtDateTime } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, MapPin, Receipt, AlertCircle, CheckCircle, CreditCard, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CancelBookingModal from "@/components/bookings/CancelBookingModal";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function BookingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        if (user && id) {
            playerService.getBookingById(id as string).then((data) => {
                setBooking(data);
                setLoading(false);
            });
        }
    }, [user, id]);

    if (loading) return <div className="min-h-screen bg-surface-base flex items-center justify-center p-4"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>;
    if (!booking) return <div className="min-h-screen bg-surface-base flex items-center justify-center p-4 text-primary">Booking not found</div>;

    const isUpcoming = ["confirmed", "payment_pending"].includes(booking.status);
    const isCancelled = booking.status === "cancelled" || booking.status === "rejected";

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-3xl">

                <Link href="/bookings" className="inline-flex items-center text-sm text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bookings
                </Link>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Main Content */}
                    <div className="flex-grow space-y-6">

                        {/* Header */}
                        <div className="bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-mono text-muted uppercase tracking-widest">
                                            {booking.booking_reference}
                                        </span>
                                        {isCancelled && <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">CANCELLED</span>}
                                    </div>
                                    <h1 className="text-3xl font-bold text-primary mb-1">
                                        {booking.court?.sport_type?.name || 'Sport'} at {booking.court?.venue_name}
                                    </h1>
                                    <p className="text-secondary font-medium">
                                        {booking.court?.name}
                                    </p>
                                </div>
                                {/* QR Code Placeholder */}
                                <div className="w-16 h-16 bg-white rounded-lg p-1 hidden sm:block">
                                    <div className="w-full h-full bg-surface-base/10 flex items-center justify-center text-[8px] text-center leading-none text-black">
                                        QR CODE
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-default mb-6">
                                <div>
                                    <p className="text-xs font-bold text-muted uppercase mb-1 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Date
                                    </p>
                                    <p className="text-primary font-medium">{fmtDateShort(booking.start_time)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted uppercase mb-1 flex items-center justify-end gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Time
                                    </p>
                                    <p className="text-primary font-medium">
                                        {fmtTime(booking.start_time)} - {fmtTime(booking.end_time)}
                                    </p>
                                </div>
                            </div>

                            {isUpcoming && (
                                <div className="flex gap-3">
                                    <Button className="flex-1 bg-surface-overlay hover:bg-surface-overlay text-primary border-subtle" variant="outline">
                                        <Download className="w-4 h-4 mr-2" /> Ticket
                                    </Button>
                                    <Button
                                        className="flex-1 border-red-900/30 text-red-500 hover:bg-red-900/10 hover:text-red-400"
                                        variant="outline"
                                        onClick={() => setIsCancelModalOpen(true)}
                                    >
                                        Cancel Booking
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Timeline / Status */}
                        <div className="bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-primary mb-6">Booking Timeline</h3>
                            <div className="relative pl-6 space-y-8 border-l border-default ml-3">
                                {/* Created */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-surface-overlay border-2 border-black"></div>
                                    <p className="text-sm font-bold text-primary">Booking Created</p>
                                    <p className="text-xs text-muted">{fmtDateTime(booking.created_at)}</p>
                                </div>

                                {/* Payment */}
                                {booking.paid_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-black"></div>
                                        <p className="text-sm font-bold text-primary">Payment Confirmed</p>
                                        <p className="text-xs text-muted">{fmtDateTime(booking.paid_at)}</p>
                                    </div>
                                )}

                                {/* Cancellation */}
                                {booking.cancelled_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-red-500 border-2 border-black"></div>
                                        <p className="text-sm font-bold text-red-500">Cancelled</p>
                                        <p className="text-xs text-muted">Reason: {booking.cancellation_reason}</p>
                                        <p className="text-xs text-muted">{fmtDateTime(booking.cancelled_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Payment Summary */}
                    <div className="w-full md:w-80 space-y-6">
                        <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm sticky top-24">
                            <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-emerald-500" /> Payment Summary
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-secondary">
                                    <span>Rate ({booking.duration_hours}h)</span>
                                    <span>LKR {(booking.hourly_rate * booking.duration_hours).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-secondary">
                                    <span>Platform Fee</span>
                                    <span>LKR {booking.platform_fee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-default">
                                    <span>Total</span>
                                    <span>LKR {booking.total_price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-surface-base/40 rounded-xl p-4 border border-default/50">
                                {booking.payment_status === "paid" ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-bold text-emerald-500 uppercase">Paid via {booking.payment_method}</span>
                                        </div>
                                        <p className="text-[10px] text-faint">
                                            {/* Synthetic reference derived from booking ID until backend exposes a payment transaction ID */}
                                            Transaction ID: {booking.paid_at ? `TXN-${booking.id.slice(-6).toUpperCase()}` : "Pending"}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4 text-amber-500" />
                                            <span className="text-xs font-bold text-amber-500 uppercase">Payment Pending</span>
                                        </div>
                                        {booking.status === "payment_pending" && (
                                            <button
                                                onClick={() => router.push(`/checkout/${booking.id}`)}
                                                className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors"
                                            >
                                                <CreditCard className="w-3.5 h-3.5" /> Complete Payment
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Booking">
                <CancelBookingModal
                    booking={booking}
                    onClose={() => setIsCancelModalOpen(false)}
                    onSuccess={() => {
                        // Refresh data
                        playerService.getBookingById(id as string).then(setBooking);
                    }}
                />
            </Modal>
        </main>
    );
}
