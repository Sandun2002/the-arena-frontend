"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fmtTime, fmtDateShort } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, MapPin, ArrowRight, Download } from "lucide-react";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";

export default function BookingSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // Poll for up to 15 seconds to handle webhook delay
    let attempts = 0;
    const poll = async () => {
      try {
        const b = await playerService.getBookingById(id);
        setBooking(b);
        if (b.status === "confirmed" || attempts >= 14) {
          setLoading(false);
          return;
        }
      } catch {
        setLoading(false);
        return;
      }
      attempts++;
      setTimeout(poll, 1000);
    };
    poll();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-zinc-400 text-sm">Confirming your booking…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full">

        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mt-5 mb-2">Payment Successful!</h1>
          <p className="text-zinc-400">
            {booking?.status === "confirmed"
              ? "Your court is confirmed. See you on the court!"
              : "Your payment was received. Booking confirmation is on the way."}
          </p>
        </div>

        {/* Booking Card */}
        {booking && (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 mb-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full mb-2">
                  {booking.status === "confirmed" ? "Confirmed" : "Processing"}
                </span>
                <h2 className="text-lg font-bold text-white">
                  {booking.sport || booking.court?.sport_type?.name} at {booking.court?.venue_name}
                </h2>
                <p className="text-sm text-zinc-400">{booking.court?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 mb-0.5">Total Paid</p>
                <p className="text-lg font-bold text-emerald-400">
                  LKR {booking.total_price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-white">{fmtDateShort(booking.start_time)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span className="text-white">
                  {fmtTime(booking.start_time)} – {fmtTime(booking.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span className="text-white">{booking.court?.name}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-zinc-600 border-t border-zinc-800">
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
            View Booking <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/bookings"
            className="w-full py-3 text-sm text-zinc-400 text-center hover:text-white transition"
          >
            View All Bookings
          </Link>
        </div>

      </div>
    </main>
  );
}
