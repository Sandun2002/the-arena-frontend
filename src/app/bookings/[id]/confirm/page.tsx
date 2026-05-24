"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, CalendarBlank, MapPin, FileText, House, CreditCard, Timer } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";
import { fmtTime, fmtDateShort, fmtDateTime } from "@/lib/utils";

export default function BookingConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;
        playerService.getBookingById(params.id as string)
            .then(b => {
                if (b.status === "payment_pending") {
                    router.replace(`/checkout/${b.id}`);
                    return;
                }
                setBooking(b);
            })
            .catch(() => setBooking(null))
            .finally(() => setLoading(false));
    }, [params.id, router]);

    if (loading) return <div className="min-h-screen bg-surface-base flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" /></div>;
    if (!booking) return <div className="min-h-screen bg-surface-base pt-24 text-primary text-center">Booking not found</div>;

    const isCancelled = booking.status === "cancelled" || booking.status === "rejected";
    const isConfirmed = booking.status === "confirmed" || booking.status === "completed";
    const isPendingApproval = booking.status === "pending_approval";

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-2xl text-center">

                <div className="mb-8 animate-in zoom-in duration-500">
                    {isCancelled ? (
                        <>
                            <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle size={48} weight="fill" className="text-red-500" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">Booking Cancelled</h1>
                            <p className="text-secondary">This booking has been cancelled or rejected.</p>
                        </>
                    ) : isPendingApproval ? (
                        <>
                            <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/25 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(245,158,11,0.2)] animate-pulse">
                                <Timer size={48} weight="fill" className="text-amber-500" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">Hold Requested</h1>
                            <p className="text-secondary">Awaiting manager approval. We will notify you once confirmed.</p>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                                <CheckCircle size={48} weight="fill" className="text-black" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">Booking Confirmed!</h1>
                            <p className="text-secondary">Your court is reserved. Get ready to play.</p>
                        </>
                    )}
                </div>

                <div className="bg-surface-raised/50 border border-default rounded-3xl overflow-hidden backdrop-blur-md mb-8 text-left animate-in slide-in-from-bottom-8 duration-700">
                    <div className="p-6 md:p-8 space-y-6">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-default">
                            <div>
                                <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1">Booking Reference</p>
                                <p className="text-primary text-2xl font-mono mobile:text-xl">{booking.booking_reference}</p>
                            </div>
                            {isCancelled ? (
                                <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-bold uppercase">
                                    {booking.status === "rejected" ? "Rejected" : "Cancelled"}
                                </div>
                            ) : isPendingApproval ? (
                                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold uppercase">
                                    Awaiting Approval
                                </div>
                            ) : (
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold uppercase">
                                    {booking.payment_status === "paid" ? "Paid • Confirmed" : "Confirmed"}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                                    <MapPin size={16} weight="fill" className="text-emerald-500" /> Venue
                                </h3>
                                <p className="text-secondary font-medium">{booking.court?.venue_name}</p>
                                <p className="text-muted text-sm">{booking.court?.name}</p>
                            </div>
                            <div>
                                <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                                    <CalendarBlank size={16} weight="bold" className="text-emerald-500" /> Date & Time
                                </h3>
                                <p className="text-secondary font-medium">
                                    {fmtDateShort(booking.start_time)}
                                </p>
                                <p className="text-muted text-sm">
                                    {fmtTime(booking.start_time)} - {fmtTime(booking.end_time)}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-default">
                            <h3 className="text-primary font-bold mb-4 flex items-center gap-2">
                                <FileText size={16} weight="fill" className="text-emerald-500" /> Payment Details
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Hourly Rate</span>
                                    <span className="text-secondary">LKR {booking.hourly_rate} x {booking.duration_hours} hrs</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Platform Fee</span>
                                    <span className="text-secondary">LKR {booking.platform_fee}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2">
                                    <span className="text-primary">Total Amount</span>
                                    <span className="text-emerald-500">LKR {booking.total_price}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="bg-surface-base/40 p-4 flex justify-between items-center text-xs text-muted border-t border-default">
                        <span>
                            {isConfirmed 
                                ? `Paid with ${booking.payment_method === 'card' ? 'Credit Card' : booking.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}` 
                                : isPendingApproval 
                                    ? `Payment Pending via ${booking.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}`
                                    : `Status: ${booking.status}`
                            }
                        </span>
                        <span>{fmtDateTime(booking.created_at)}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href={isPendingApproval ? `/bookings/${booking.id}` : "/bookings"} className="w-full md:w-auto">
                        <Button variant={isPendingApproval ? "primary" : "outline"} className={`w-full font-bold ${isPendingApproval ? "bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400" : "text-secondary border-subtle hover:text-primary hover:border-subtle"}`}>
                            {isPendingApproval ? "View Booking details & Upload slip" : "View My Bookings"}
                        </Button>
                    </Link>
                    {isCancelled ? (
                        <Link href="/venues" className="w-full md:w-auto">
                            <Button className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold">
                                <CreditCard size={16} weight="bold" className="mr-2" /> Book Again
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/" className="w-full md:w-auto">
                            <Button variant={isPendingApproval ? "outline" : "primary"} className={`w-full font-bold ${isPendingApproval ? "text-secondary border-subtle hover:text-primary hover:border-subtle" : "bg-primary text-inverted hover:opacity-90"}`}>
                                <House size={16} weight="bold" className="mr-2" /> Back to Home
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}
