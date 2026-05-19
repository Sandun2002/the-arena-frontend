"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fmtTime, fmtDateShort } from "@/lib/utils";
import {
  Clock,
  Shield,
  MapPin,
  CalendarBlank,
  Warning,
  ArrowsClockwise,
  ArrowLeft,
} from "@phosphor-icons/react";
import { bookingService, PayHereCheckoutData } from "@/services/bookingService";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";
import { useToast } from "@/components/ui/Toast";
import Script from "next/script";

// ---- Types ----------------------------------------------------------------
declare global {
  interface Window {
    payhere: {
      startPayment: (payment: Record<string, string | boolean>) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

// ---- Component ------------------------------------------------------------
export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [checkoutData, setCheckoutData] = useState<PayHereCheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // ---- Load booking + checkout data --------------------------------------
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const [b, cd] = await Promise.all([
          playerService.getBookingById(id),
          bookingService.getCheckoutData(id),
        ]);
        // If already confirmed, jump straight to success
        if (b.status === "confirmed") {
          router.replace(`/bookings/${id}/success`);
          return;
        }
        if (b.status !== "payment_pending") {
          router.replace(`/bookings`);
          return;
        }
        setBooking(b);
        setCheckoutData(cd);
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 410) {
          setError("Your payment hold has expired. The slot was released.");
        } else if (status === 400) {
          setError("This booking is no longer awaiting payment.");
        } else {
          setError("Failed to load checkout. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, router]);

  // ---- Countdown timer ---------------------------------------------------
  useEffect(() => {
    if (!booking) return;

    // hold_expires_at comes from created_at + 5 minutes (backend sets it)
    // We rely on created_at + 5min as fallback if hold_expires_at not normalised
    const expiryMs = booking.hold_expires_at
      ? new Date(booking.hold_expires_at).getTime()
      : new Date(booking.created_at).getTime() + 5 * 60 * 1000;

    // Capture initial remaining once — decouples from client clock manipulation
    const nowMs = Date.now();
    let remaining = Math.max(0, Math.floor((expiryMs - nowMs) / 1000));
    setCountdown(remaining);

    if (remaining <= 0) {
      setError("Your payment hold has expired. The slot has been released.");
      return;
    }

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        setCountdown(0);
        setError("Your payment hold has expired. The slot has been released.");
        clearInterval(timer);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  // ---- PayHere SDK handlers ----------------------------------------------
  const attachPayHereHandlers = useCallback(() => {
    if (typeof window === "undefined" || !window.payhere) return;

    window.payhere.onCompleted = (orderId) => {
      setPaying(false);
      addToast("Payment successful! Confirming your booking…", "success");
      // The webhook will confirm on backend. We poll for confirmation.
      pollForConfirmation();
    };

    window.payhere.onDismissed = () => {
      setPaying(false);
      addToast("Payment was dismissed. You can try again.", "warning");
    };

    window.payhere.onError = (error) => {
      setPaying(false);
      addToast(`Payment error: ${error}`, "error");
    };
  }, [addToast]); // eslint-disable-line react-hooks/exhaustive-deps

  const pollForConfirmation = useCallback(async () => {
    // Navigate immediately — success page shows content right away and
    // polls the status badge quietly in the background.
    router.push(`/bookings/${id}/success`);
  }, [id, router]);

  // ---- Trigger PayHere payment -------------------------------------------
  const handlePay = () => {
    if (!checkoutData || !sdkReady) return;
    setPaying(true);
    attachPayHereHandlers();

    window.payhere.startPayment({
      sandbox:            checkoutData.sandbox === "true",
      merchant_id:        checkoutData.merchant_id,
      return_url:         checkoutData.return_url,
      cancel_url:         checkoutData.cancel_url,
      notify_url:         checkoutData.notify_url,
      order_id:           checkoutData.order_id,
      items:              checkoutData.items,
      amount:             checkoutData.amount,
      currency:           checkoutData.currency,
      hash:               checkoutData.hash,
      first_name:         checkoutData.first_name,
      last_name:          checkoutData.last_name,
      email:              checkoutData.email,
      phone:              checkoutData.phone,
      address:            checkoutData.address,
      city:               checkoutData.city,
      country:            checkoutData.country,
    });
  };

  // ---- Format countdown --------------------------------------------------
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ---- Render states -----------------------------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (error || !booking || !checkoutData) {
    return (
      <main className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-surface-raised/80 border border-red-900/40 rounded-3xl p-10">
          <Warning size={48} weight="fill" className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Checkout Unavailable</h2>
          <p className="text-secondary mb-6">{error ?? "Something went wrong."}</p>
          <button
            onClick={() => router.push("/venues")}
            className="px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition"
          >
            Find Another Venue
          </button>
        </div>
      </main>
    );
  }

  const isExpired = countdown !== null && countdown <= 0;

  return (
    <>
      {/* PayHere JS SDK */}
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <main className="min-h-screen bg-surface-base pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">

          {/* Back */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-muted hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={16} weight="bold" className="mr-2" /> Back
          </button>

          <h1 className="text-3xl font-bold text-primary mb-2">Complete Payment</h1>
          <p className="text-secondary mb-8">
            Confirm your slot by completing payment below.
          </p>

          {/* Countdown Banner */}
          {countdown !== null && (
            <div className={`mb-6 flex items-center gap-3 px-5 py-3 rounded-xl border ${
              isExpired
                ? "bg-red-900/20 border-red-700/40 text-red-400"
                : countdown < 60
                ? "bg-amber-900/20 border-amber-700/40 text-amber-400"
                : "bg-surface-raised/60 border-subtle/40 text-secondary"
            }`}>
              <Clock size={20} weight="bold" className={`flex-shrink-0 ${isExpired ? "text-red-500" : countdown < 60 ? "text-amber-400" : "text-emerald-400"}`} />
              {isExpired ? (
                <span className="font-medium">Hold expired — slot released</span>
              ) : (
                <span className="font-medium">
                  Slot reserved for <span className="font-mono font-bold">{formatCountdown(countdown)}</span>
                </span>
              )}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">

            {/* Booking Summary */}
            <div className="bg-surface-raised/60 border border-default rounded-2xl p-6">
              <h2 className="text-base font-bold text-primary mb-5">Booking Summary</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} weight="fill" className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase mb-0.5">Venue</p>
                    <p className="text-sm font-medium text-primary">{booking.court?.venue_name}</p>
                    <p className="text-xs text-secondary">{booking.court?.name} — {booking.sport || booking.court?.sport_type?.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarBlank size={16} weight="bold" className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase mb-0.5">Date</p>
                    <p className="text-sm font-medium text-primary">
                      {fmtDateShort(booking.start_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} weight="bold" className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted uppercase mb-0.5">Time</p>
                    <p className="text-sm font-medium text-primary">
                      {fmtTime(booking.start_time)} – {fmtTime(booking.end_time)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-default pt-4 mt-2 space-y-2">
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Court ({booking.duration_hours}h)</span>
                    <span>LKR {booking.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Platform Fee</span>
                    <span>LKR {booking.platform_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-default">
                    <span>Total</span>
                    <span>LKR {booking.total_price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[10px] text-faint font-mono">REF: {booking.booking_reference}</div>
              </div>
            </div>

            {/* Payment Panel */}
            <div className="flex flex-col gap-4">
              <div className="bg-surface-raised/60 border border-default rounded-2xl p-6">
                <h2 className="text-base font-bold text-primary mb-4">Payment via PayHere</h2>

                <div className="flex items-center gap-2 mb-5">
                  <Shield size={16} weight="fill" className="text-emerald-400" />
                  <span className="text-xs text-secondary">Secured by PayHere · SSL Encrypted</span>
                </div>

                <div className="text-3xl font-black text-primary mb-6">
                  LKR {booking.total_price.toLocaleString()}
                </div>

                {/* Pay Button */}
                {(() => {
                  const onlinePaymentsEnabled = false; // TEMPORARY OVERRIDE: Set to true to re-enable card payments
                  
                  return (
                    <button
                      onClick={handlePay}
                      disabled={!onlinePaymentsEnabled || paying || isExpired || !sdkReady}
                      className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
                        !onlinePaymentsEnabled || paying || isExpired || !sdkReady
                          ? "bg-surface-overlay text-muted cursor-not-allowed"
                          : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                      }`}
                    >
                      {!onlinePaymentsEnabled ? (
                        "Online Payments Temporarily Disabled"
                      ) : paying ? (
                        <>
                          <ArrowsClockwise size={16} weight="bold" className="animate-spin" />
                          Opening PayHere…
                        </>
                      ) : isExpired ? (
                        "Hold Expired"
                      ) : !sdkReady ? (
                        "Loading…"
                      ) : (
                        "Pay Now with PayHere"
                      )}
                    </button>
                  );
                })()}

                {isExpired && (
                  <button
                    onClick={() => router.push("/venues")}
                    className="w-full mt-3 py-3 rounded-xl font-bold text-sm border border-subtle text-secondary hover:bg-surface-overlay transition"
                  >
                    Find Another Venue
                  </button>
                )}
              </div>

              {/* Trust note — sandbox warning only shown in sandbox/dev environments */}
              {process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === "true" ? (
                <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-400 leading-relaxed">
                    <strong>Sandbox Mode:</strong> Use PayHere&apos;s test card numbers to complete the payment.
                    No real money is charged.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    🔒 Payments are secured and processed by PayHere.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
