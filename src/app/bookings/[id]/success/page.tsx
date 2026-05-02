"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { fmtTime, fmtDateShort } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle, CalendarBlank, Clock, MapPin, ArrowRight } from "@phosphor-icons/react";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";

export default function BookingSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  // Only show the full-screen spinner on the very first load (no data yet).
  // Once we have any booking data we show the success UI immediately and
  // update the status badge silently in the background.
  const [initialLoading, setInitialLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;

    let attempts = 0;

    const poll = async () => {
      try {
        const b = await playerService.getBookingById(id);
        setBooking(b);

        // First response received — immediately show the success page.
        setInitialLoading(false);

        // Keep polling silently until confirmed or 15 attempts exhausted.
        if (b.status !== "confirmed" && attempts < 14) {
          attempts++;
          pollRef.current = setTimeout(poll, 1000);
        }
      } catch {
        // Can't reach the API — show whatever we have (or empty state).
        setInitialLoading(false);
      }
    };

    poll();

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [id]);

  if (initialLoading) {
    return (
      <main className="min-h-screen bg-surface-base flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-secondary text-sm">Loading your booking…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-base flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full">

        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={40} weight="fill" className="text-emerald-400" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-primary mt-5 mb-2">Payment Successful!</h1>
          <p className="text-secondary">
            {booking?.status === "confirmed"
              ? "Your court is confirmed. See you on the court!"
              : "Your payment was received. Booking confirmation is on the way."}
          </p>
        </div>

        {/* Booking Card */}
        {booking && (
          <div className="bg-surface-raised/70 border border-default rounded-2xl p-6 mb-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full mb-2">
                  {booking.status === "confirmed" ? "Confirmed" : "Processing"}
                </span>
                <h2 className="text-lg font-bold text-primary">
                  {booking.sport || booking.court?.sport_type?.name} at {booking.court?.venue_name}
                </h2>
                <p className="text-sm text-secondary">{booking.court?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted mb-0.5">Total Paid</p>
                <p className="text-lg font-bold text-emerald-400">
                  LKR {booking.total_price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-default pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarBlank size={16} weight="bold" className="text-muted" />
                <span className="text-primary">{fmtDateShort(booking.start_time)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} weight="bold" className="text-muted" />
                <span className="text-primary">
                  {fmtTime(booking.start_time)} – {fmtTime(booking.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} weight="fill" className="text-muted" />
                <span className="text-primary">{booking.court?.name}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-faint border-t border-default">
              REF: {booking.booking_reference}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/bookings/${id}`}
            className="w-full py-3.5 bg-emerald-500 text-black font-bold rounded-xl text-center hover:bg-emerald-400 transition flex items-center justify-center gap-2"
          >
            View Booking <ArrowRight size={16} weight="bold" />
          </Link>
          <Link
            href="/bookings"
            className="w-full py-3 text-sm text-secondary text-center hover:text-primary transition"
          >
            View All Bookings
          </Link>
        </div>

      </div>
    </main>
  );
}
