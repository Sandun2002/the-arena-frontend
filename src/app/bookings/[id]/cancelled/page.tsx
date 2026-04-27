"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";

export default function BookingCancelledPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [holdValid, setHoldValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    playerService.getBookingById(id).then((b) => {
      setBooking(b);
      // Check if the 5-minute hold is still valid (booking still pending and not expired)
      if (b.status === "payment_pending") {
        const expiry = b.hold_expires_at
          ? new Date(b.hold_expires_at).getTime()
          : new Date(b.created_at).getTime() + 5 * 60 * 1000;
        setHoldValid(Date.now() < expiry);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-base flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="inline-flex w-20 h-20 rounded-full bg-surface-overlay/60 border border-subtle items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-secondary" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-3">Payment Cancelled</h1>

        {holdValid ? (
          <>
            <p className="text-secondary mb-8">
              Your slot is still reserved. You can try paying again before your hold expires.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/checkout/${id}`)}
                className="w-full py-3.5 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <Link
                href="/venues"
                className="w-full py-3 text-sm text-muted hover:text-primary transition text-center"
              >
                Find a Different Venue
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-secondary mb-8">
              Your payment hold has expired and the slot has been released back to the public.
            </p>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Find Another Venue
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
