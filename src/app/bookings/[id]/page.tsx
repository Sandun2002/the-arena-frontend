"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fmtTime, fmtDateShort, fmtDateTime } from "@/lib/utils";
import { ArrowLeft, CalendarBlank, Clock, MapPin, Receipt, WarningCircle, CheckCircle, DownloadSimple, CreditCard, ArrowsClockwise, XCircle, Timer, Image as ImageIcon, CircleNotch } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CancelBookingModal from "@/components/bookings/CancelBookingModal";
import BankTransferUpload from "@/components/booking/BankTransferUpload";
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

    const loadBooking = () => {
        if (user && id) {
            playerService.getBookingById(id as string)
                .then((data) => {
                    setBooking(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        loadBooking();
    }, [user, id]);

    // Poll while awaiting manager approval / bank-slip verification so the
    // player UI flips to confirmed (or rejected) without a manual refresh.
    useEffect(() => {
        if (!user || !id || !booking) return;
        const shouldPoll =
            booking.status === "pending_approval" ||
            booking.payment_status === "awaiting_verification";
        if (!shouldPoll) return;

        const intervalId = setInterval(() => {
            playerService.getBookingById(id as string)
                .then((data) => setBooking(data))
                .catch(() => { /* keep last known state */ });
        }, 8000);

        return () => clearInterval(intervalId);
    }, [user, id, booking?.status, booking?.payment_status]);

    if (loading) return <div className="min-h-screen bg-surface-base flex items-center justify-center p-4"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>;
    if (!booking) return <div className="min-h-screen bg-surface-base flex items-center justify-center p-4 text-primary">Booking not found</div>;

    const isPendingApproval = booking.status === "pending_approval";
    const isUpcoming = ["confirmed", "payment_pending", "pending_approval"].includes(booking.status);
    const isCancelled = booking.status === "cancelled";
    const isRejected = booking.status === "rejected";
    const isExpired = booking.status === "expired";
    const isPaymentPending = booking.status === "payment_pending";
    const isCompleted = booking.status === "completed";

    // Bank transfer variables
    const isBankTransfer = booking.payment_method === "bank_transfer";
    const needsSlipUpload = isBankTransfer && booking.payment_status === "pending" && isPendingApproval;
    const isSlipAwaitingVerification = isBankTransfer && booking.payment_status === "awaiting_verification";

    const handleDownloadTicket = () => {
        const ticketHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Ticket - ${booking.booking_reference}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e4e4e7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .ticket { background: #141414; border: 2px dashed #10b981; border-radius: 24px; padding: 40px; width: 360px; text-align: center; }
    .logo { font-size: 24px; font-weight: 900; color: #10b981; margin-bottom: 8px; }
    .ref { font-family: monospace; font-size: 12px; color: #71717a; margin-bottom: 24px; }
    .divider { border-top: 1px dashed #27272a; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
    .label { color: #71717a; }
    .value { color: #ffffff; font-weight: 600; }
    .total { font-size: 20px; font-weight: 900; color: #10b981; margin-top: 8px; }
    .checkin { background: #064e3b; color: #34d399; padding: 12px; border-radius: 12px; font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: 4px; margin-top: 16px; }
    .qr-note { font-size: 11px; color: #52525b; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="logo">THE ARENA</div>
    <div class="ref">${booking.booking_reference}</div>
    <div class="divider"></div>
    <div class="row"><span class="label">Venue</span><span class="value">${booking.court?.venue_name || "Arena Venue"}</span></div>
    <div class="row"><span class="label">Court</span><span class="value">${booking.court?.name || "Court"}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${fmtDateShort(booking.start_time)}</span></div>
    <div class="row"><span class="label">Time</span><span class="value">${fmtTime(booking.start_time)} - ${fmtTime(booking.end_time)}</span></div>
    <div class="row"><span class="label">Sport</span><span class="value">${booking.court?.sport_type?.name || "Sport"}</span></div>
    <div class="divider"></div>
    <div class="row total"><span>Total Paid</span><span>LKR ${booking.total_price.toLocaleString()}</span></div>
    ${booking.check_in_code ? `<div class="checkin">${booking.check_in_code}</div><div class="qr-note">Show this code at the venue</div>` : ""}
  </div>
</body>
</html>`;
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(ticketHtml);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 300);
        }
    };

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-3xl">

                <Link href="/bookings" className="inline-flex items-center text-sm text-muted hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={16} weight="bold" className="mr-2" /> Back to Bookings
                </Link>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Main Content */}
                    <div className="flex-grow space-y-6">

                        {/* Header card */}
                        <div className="bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <span className="text-xs font-mono text-muted uppercase tracking-widest bg-surface-sunken px-2.5 py-1 rounded-md border border-default">
                                            {booking.booking_reference}
                                        </span>
                                        {isCancelled && <span className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded">CANCELLED</span>}
                                        {isRejected && <span className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded">REJECTED BY VENUE</span>}
                                        {isExpired && <span className="text-xs font-bold text-zinc-400 bg-zinc-500/10 border border-zinc-500/25 px-2.5 py-1 rounded">EXPIRED</span>}
                                        {isPaymentPending && <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded animate-pulse">PAYMENT PENDING</span>}
                                        {isPendingApproval && <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded animate-pulse">AWAITING APPROVAL</span>}
                                        {booking.status === "confirmed" && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded">CONFIRMED</span>}
                                        {booking.status === "completed" && <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded">COMPLETED</span>}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
                                        {booking.court?.sport_type?.name || 'Sport'} at {booking.court?.venue_name}
                                    </h1>
                                    <p className="text-secondary font-medium">
                                        {booking.court?.name}
                                    </p>
                                </div>

                                {/* Check-in code only after venue has approved / confirmed */}
                                {(booking.status === "confirmed" || booking.status === "completed") && booking.check_in_code ? (
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center min-w-[140px] select-all shadow-inner animate-in fade-in slide-in-from-right-4 duration-300">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Check-in Code</p>
                                        <p className="text-2xl font-mono font-black text-emerald-400 tracking-[0.2em]">{booking.check_in_code}</p>
                                        <p className="text-[8px] text-muted mt-1 leading-tight">Show code to venue</p>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-surface-sunken border border-default rounded-2xl flex items-center justify-center text-xs text-muted text-center font-bold">
                                        🎫 Arena
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-default mb-6">
                                <div>
                                    <p className="text-xs font-bold text-muted uppercase mb-1 flex items-center gap-1.5">
                                        <CalendarBlank size={14} weight="bold" /> Date
                                    </p>
                                    <p className="text-primary font-medium">{fmtDateShort(booking.start_time)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted uppercase mb-1 flex items-center justify-end gap-1.5">
                                        <Clock size={14} weight="bold" /> Time
                                    </p>
                                    <p className="text-primary font-medium">
                                        {fmtTime(booking.start_time)} - {fmtTime(booking.end_time)}
                                    </p>
                                </div>
                            </div>

                            {/* Countdown Timers */}
                            {isPaymentPending && booking.hold_expires_at && (
                                <div className="mb-6">
                                    <HoldTimer
                                        expiresAt={booking.hold_expires_at}
                                        onExpire={loadBooking}
                                        label="Secure booking before timeout"
                                    />
                                </div>
                            )}

                            {isPendingApproval && booking.approval_expires_at && (
                                <div className="mb-6">
                                    <HoldTimer
                                        expiresAt={booking.approval_expires_at}
                                        onExpire={loadBooking}
                                        label={isBankTransfer ? "Bank slip upload hold window" : "Cash approval hold window"}
                                    />
                                </div>
                            )}

                            {/* Booking page action buttons */}
                            {(isUpcoming || isCompleted) && (
                                <div className="flex gap-3">
                                    {isPaymentPending ? (
                                        <Button
                                            className="flex-grow bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                                            onClick={() => router.push(`/checkout/${booking.id}`)}
                                        >
                                            <CreditCard size={16} weight="bold" className="mr-2" /> Complete Payment
                                        </Button>
                                    ) : (booking.status === "confirmed" || isCompleted) ? (
                                        <Button
                                            className="flex-grow bg-surface-overlay hover:bg-surface-overlay text-primary border-subtle"
                                            variant="outline"
                                            onClick={handleDownloadTicket}
                                        >
                                            <DownloadSimple size={16} weight="bold" className="mr-2" /> Ticket
                                        </Button>
                                    ) : isPendingApproval ? (
                                        <div className="flex-grow flex items-center justify-center px-4 py-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 text-xs font-bold text-amber-400 text-center">
                                            Ticket available after venue approval
                                        </div>
                                    ) : null}

                                    {isUpcoming && (
                                        <Button
                                            className="flex-grow border-red-900/30 text-red-500 hover:bg-red-900/10 hover:text-red-400 font-bold"
                                            variant="outline"
                                            onClick={() => setIsCancelModalOpen(true)}
                                        >
                                            Cancel Booking
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Slip Uploader and Slip Detail Views */}
                        {needsSlipUpload && (
                            <BankTransferUpload
                                booking={booking}
                                onUploadSuccess={(updated) => setBooking(updated)}
                            />
                        )}

                        {isSlipAwaitingVerification && (
                            <div className="bg-surface-raised/50 border border-blue-500/25 rounded-3xl p-6 md:p-8 backdrop-blur-sm space-y-4 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                                        <CircleNotch size={24} className="text-blue-400 animate-spin" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-primary">Receipt Awaiting Verification</h3>
                                        <p className="text-xs text-secondary leading-relaxed">
                                            Your transfer slip is being reviewed by the venue staff. Keep this page open to check status.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="bg-surface-sunken rounded-2xl p-4 space-y-2.5 border border-default text-xs">
                                    <div className="flex justify-between text-secondary"><span className="text-muted">Uploaded Time</span><span className="font-semibold text-primary">{booking.bank_transfer_slip_uploaded_at ? fmtDateTime(booking.bank_transfer_slip_uploaded_at) : "N/A"}</span></div>
                                    <div className="flex justify-between text-secondary"><span className="text-muted">Transaction Reference</span><span className="font-mono font-bold text-blue-400">{booking.bank_transfer_reference}</span></div>
                                </div>
                                
                                {booking.bank_transfer_slip_url && (
                                    <div className="pt-2 space-y-3">
                                        {!/\.pdf($|\?)/i.test(booking.bank_transfer_slip_url) && (
                                            <div className="rounded-2xl border border-default bg-surface-sunken overflow-hidden max-h-64 flex items-center justify-center">
                                                <img
                                                    src={booking.bank_transfer_slip_url}
                                                    alt="Uploaded bank transfer receipt"
                                                    className="max-h-64 max-w-full object-contain"
                                                />
                                            </div>
                                        )}
                                        <a 
                                            href={booking.bank_transfer_slip_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline"
                                        >
                                            <ImageIcon size={16} /> View Uploaded Receipt
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timeline / Status */}
                        <div className="bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm shadow-xl">
                            <h3 className="text-lg font-bold text-primary mb-6">Booking Timeline</h3>
                            <div className="relative pl-6 space-y-8 border-l border-default ml-3">
                                {/* Created */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-surface-overlay border-2 border-black"></div>
                                    <p className="text-sm font-bold text-primary">Booking Created</p>
                                    <p className="text-xs text-muted">{fmtDateTime(booking.created_at)}</p>
                                </div>

                                {/* Slip uploaded */}
                                {booking.bank_transfer_slip_uploaded_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500"></div>
                                        <p className="text-sm font-bold text-primary">Payment Receipt Uploaded</p>
                                        <p className="text-xs text-muted">Reference: {booking.bank_transfer_reference}</p>
                                        <p className="text-xs text-muted">{fmtDateTime(booking.bank_transfer_slip_uploaded_at)}</p>
                                    </div>
                                )}

                                {/* Venue approved */}
                                {booking.approved_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500"></div>
                                        <p className="text-sm font-bold text-primary">Approved by Venue</p>
                                        <p className="text-xs text-muted">{fmtDateTime(booking.approved_at)}</p>
                                    </div>
                                )}

                                {/* Confirmed status (when no separate paid_at / approved_at) */}
                                {booking.status === "confirmed" && !booking.approved_at && !booking.paid_at && (
                                    <div className="relative">
                                        <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-black"></div>
                                        <p className="text-sm font-bold text-primary">Booking Confirmed</p>
                                    </div>
                                )}

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
                                        {booking.cancellation_reason && <p className="text-xs text-muted">Reason: {booking.cancellation_reason}</p>}
                                        <p className="text-xs text-muted">{fmtDateTime(booking.cancelled_at)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Payment Summary or Unconfirmed Message */}
                    <div className="w-full md:w-80 space-y-6 shrink-0">
                        {(isExpired || isRejected || isCancelled) ? (
                            <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm sticky top-24 shadow-xl text-center">
                                <XCircle size={48} weight="fill" className="text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-primary mb-2">Sorry, your booking wasn't confirmed.</h3>
                                <p className="text-sm text-secondary mb-4">This time slot has been released and is now available for others to book.</p>
                                <Link href="/venues">
                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                                        Find Another Slot
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm sticky top-24 shadow-xl">
                                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <Receipt size={20} weight="fill" className="text-emerald-500" /> Payment Summary
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-secondary">
                                        <span>Court fee ({booking.duration_hours}h{booking.hourly_rate ? ` · base LKR ${booking.hourly_rate.toLocaleString()}/hr` : ""})</span>
                                        <span>LKR {(booking.subtotal ?? booking.hourly_rate * booking.duration_hours).toLocaleString()}</span>
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

                                <PaymentStatusPanel booking={booking} />
                            </div>
                        )}
                    </div>

                </div>

            </div>

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Booking">
                <CancelBookingModal
                    booking={booking}
                    onClose={() => setIsCancelModalOpen(false)}
                    onSuccess={() => {
                        loadBooking();
                    }}
                />
            </Modal>
        </main>
    );
}

// ===== Helpers =====

function HoldTimer({
    expiresAt,
    onExpire,
    label = "Complete payment within",
}: {
    expiresAt: string;
    onExpire: () => void;
    label?: string;
}) {
    const router = useRouter();
    const [remainingMs, setRemainingMs] = useState<number>(() =>
        Math.max(0, new Date(expiresAt).getTime() - Date.now())
    );
    const [hasFiredExpire, setHasFiredExpire] = useState(false);

    useEffect(() => {
        const id = setInterval(() => {
            const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
            setRemainingMs(ms);
            if (ms === 0 && !hasFiredExpire) {
                setHasFiredExpire(true);
                onExpire();
            }
        }, 1000);
        return () => clearInterval(id);
    }, [expiresAt, hasFiredExpire, onExpire]);

    const isExpired = remainingMs === 0;
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    const isUrgent = remainingMs > 0 && remainingMs < 60_000;

    if (isExpired) {
        return (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
                <XCircle size={20} weight="fill" className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-red-400">Booking hold expired</p>
                    <p className="text-xs text-red-400/80 mt-0.5">
                        Your slot hold has expired and the court has been released.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/bookings")}
                    className="text-xs font-bold text-red-300 hover:text-red-200 flex items-center gap-1 flex-shrink-0"
                >
                    <ArrowsClockwise size={14} weight="bold" /> View Bookings
                </button>
            </div>
        );
    }

    return (
        <div
            className={`rounded-2xl border p-4 flex items-center gap-3 ${
                isUrgent
                    ? "border-red-500/40 bg-red-500/10 animate-pulse"
                    : "border-amber-500/30 bg-amber-500/10"
            }`}
        >
            <Timer size={20} weight="fill" className={`flex-shrink-0 ${isUrgent ? "text-red-400" : "text-amber-400"}`} />
            <div className="flex-1">
                <p className={`text-sm font-bold ${isUrgent ? "text-red-300" : "text-amber-300"}`}>
                    {label}:{" "}
                    <span className="font-mono tabular-nums">{formatted}</span>
                </p>
                <p className="text-[11px] text-secondary mt-0.5">
                    Finish payment or upload your receipt before this timer reaches zero to secure your slot.
                </p>
            </div>
        </div>
    );
}

function PaymentStatusPanel({ booking }: { booking: Booking }) {
    const ps = booking.payment_status;
    const status = booking.status;
    const method = booking.payment_method || "card";
    const methodLabel = method === "card" ? "Card" : method === "bank_transfer" ? "Bank Transfer" : "Cash";

    if (ps === "paid") {
        return (
            <div className="bg-surface-base/40 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 uppercase">
                        Paid via {methodLabel}
                    </span>
                </div>
                {booking.paid_at && (
                    <p className="text-[10px] text-faint">
                        Paid on {fmtDateTime(booking.paid_at)}
                    </p>
                )}
            </div>
        );
    }

    if (ps === "awaiting_verification") {
        return (
            <div className="bg-surface-base/40 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                    <CircleNotch size={16} className="text-blue-400 animate-spin" />
                    <span className="text-xs font-bold text-blue-400 uppercase">
                        Awaiting Verification
                    </span>
                </div>
                <p className="text-[10px] text-faint">
                    Receipt uploaded. Waiting for review.
                </p>
            </div>
        );
    }

    if (ps === "refunded") {
        return (
            <div className="bg-surface-base/40 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                    <ArrowsClockwise size={16} weight="bold" className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-400 uppercase">Refunded</span>
                </div>
                <p className="text-[10px] text-faint">
                    Original payment method: {methodLabel}
                </p>
            </div>
        );
    }

    if (ps === "failed") {
        return (
            <div className="bg-surface-base/40 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center gap-2 mb-1">
                    <XCircle size={16} weight="fill" className="text-red-500" />
                    <span className="text-xs font-bold text-red-500 uppercase">Payment Failed</span>
                </div>
                <p className="text-[10px] text-faint">
                    The payment via {methodLabel} did not go through.
                </p>
            </div>
        );
    }

    // Pending status checks
    if (status === "payment_pending") {
        return (
            <div className="bg-surface-base/40 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1">
                    <Timer size={16} weight="fill" className="text-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-amber-400 uppercase">Awaiting Payment</span>
                </div>
                <p className="text-[10px] text-faint">
                    Slot is held. Complete checkout to confirm.
                </p>
            </div>
        );
    }

    if (status === "pending_approval") {
        return (
            <div className="bg-surface-base/40 rounded-xl p-4 border border-yellow-500/25">
                <div className="flex items-center gap-2 mb-1">
                    <Timer size={16} weight="fill" className="text-yellow-400 animate-pulse" />
                    <span className="text-xs font-bold text-yellow-400 uppercase">Pending Approval</span>
                </div>
                <p className="text-[10px] text-faint">
                    {method === "bank_transfer" 
                        ? "Held. Upload transaction slip to secure slot."
                        : "Held. Waiting for manager confirmation."}
                </p>
            </div>
        );
    }
    if (status === "confirmed" && ps === "pending") {
        return (
            <div className="bg-surface-base/40 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 uppercase">Pay at Venue</span>
                </div>
                <p className="text-[10px] text-faint">
                    {method === "bank_transfer" ? "Upload receipt to confirm." : "Bring cash on arrival."}
                </p>
            </div>
        );
    }
    return (
        <div className="bg-surface-base/40 rounded-xl p-4 border border-default/50">
            <div className="flex items-center gap-2 mb-1">
                <WarningCircle size={16} weight="fill" className="text-muted" />
                <span className="text-xs font-bold text-muted uppercase">No Payment Recorded</span>
            </div>
            <p className="text-[10px] text-faint">
                {status === "cancelled" || status === "rejected" || status === "expired"
                    ? "This booking was not paid."
                    : "Payment information unavailable."}
            </p>
        </div>
    );
}
