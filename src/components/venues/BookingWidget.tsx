"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Venue, Court } from "@/types";
import Button from "@/components/ui/Button";
import { Calendar, Check, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/services/authContext";
import { api } from "@/services/api";
import { bookingService } from "@/services/bookingService";
import { format, parseISO } from "date-fns";
import { useToast } from "@/components/ui/Toast";

interface BookingWidgetProps {
  venue: Venue;
}

export default function BookingWidget({ venue }: BookingWidgetProps) {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();
  const { addToast } = useToast();

  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [courtsData, setCourtsData] = useState<any[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [selectedSlots, setSelectedSlots] = useState<{ start: string, end: string }[]>([]);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch Slots
  useEffect(() => {
    if (!venue?.id || !date) return;
    setLoadingSlots(true);
    api.getVenueSlots(venue.id, date)
      .then((res: any) => {
        const data = res.venue_slots || [];
        setCourtsData(data);
        if (data.length > 0 && !selectedCourtId) {
          setSelectedCourtId(data[0].court.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [date, venue?.id]);

  // Calculate Price
  useEffect(() => {
    if (selectedCourtId && selectedSlots.length > 0) {
      // Sort slots by start time to ensure contiguous sequence 
      const sortedSlots = [...selectedSlots].sort((a, b) => a.start.localeCompare(b.start));
      const timeSlotsFormatted = sortedSlots.map(s => format(parseISO(s.start), "HH:mm"));

      bookingService.calculatePrice(selectedCourtId, date, timeSlotsFormatted)
        .then(setPricing)
        .catch(() => setPricing(null));
    } else {
      setPricing(null);
    }
  }, [selectedCourtId, selectedSlots, date]);

  const currentCourtData = courtsData.find(c => c.court.id === selectedCourtId);
  const timeSlots = currentCourtData ? currentCourtData.slots : [];

  const toggleSlot = (slot: { start: string, end: string }) => {
    const isSelected = selectedSlots.some(s => s.start === slot.start);
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter((s) => s.start !== slot.start));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleBooking = async () => {
    if (selectedSlots.length === 0) return;

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    setSubmitting(true);
    try {
      const sortedSlots = [...selectedSlots].sort((a, b) => a.start.localeCompare(b.start));
      const startTime = sortedSlots[0].start;
      const endTime = sortedSlots[sortedSlots.length - 1].end;

      const booking = await bookingService.createBooking({
        venue_id: venue.id,
        court_id: selectedCourtId,
        start_time: startTime,
        end_time: endTime,
        payment_method: "card"
      });

      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/bookings`);
      }, 2000);
    } catch (e) {
      addToast("Failed to create booking", "error");
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    login("player@arena.lk", "password123");
    setShowLoginPrompt(false);
  };

  // Success overlay
  if (showSuccess) {
    return (
      <div className="sticky top-24 w-full rounded-2xl bg-zinc-900/80 border border-emerald-500 p-8 backdrop-blur-md shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-black" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
        <p className="text-zinc-400 text-sm mb-4">Redirecting to your bookings...</p>
        <div className="animate-pulse text-emerald-500 text-sm">Please wait...</div>
      </div>
    );
  }

  // Login prompt overlay
  if (showLoginPrompt) {
    return (
      <div className="sticky top-24 w-full rounded-2xl bg-zinc-900/80 border border-zinc-800 p-8 backdrop-blur-md shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <LogIn className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
        <p className="text-zinc-400 text-sm mb-6">Please sign in to complete your booking.</p>

        <div className="space-y-3">
          <Button
            onClick={handleDemoLogin}
            className="w-full py-3 bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
          >
            Demo: Login as Player
          </Button>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Go to Login Page
          </button>
          <button
            onClick={() => setShowLoginPrompt(false)}
            className="text-xs text-zinc-500 hover:text-zinc-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 w-full rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 backdrop-blur-md shadow-xl">

      <h3 className="text-xl font-bold text-white mb-1">Confirm Booking</h3>
      <p className="text-xs text-zinc-400 mb-6">Select your date, court, and time slots.</p>

      {/* Date Picker */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</label>
        <div className="relative group">
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlots([]);
            }}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 py-3 px-4 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Court Selection Tabs */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Court</label>
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 overflow-x-auto scrollbar-hide">
          {courtsData.map((cData) => (
            <button
              key={cData.court.id}
              onClick={() => {
                setSelectedCourtId(cData.court.id);
                setSelectedSlots([]);
              }}
              className={`flex-shrink-0 min-w-[80px] px-4 py-2 text-xs font-bold rounded-md transition-all ${selectedCourtId === cData.court.id
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              {cData.court.name}
            </button>
          ))}
          {loadingSlots && courtsData.length === 0 && (
            <span className="py-2 px-4 text-xs text-zinc-500">Loading...</span>
          )}
          {!loadingSlots && courtsData.length === 0 && (
            <span className="py-2 px-4 text-xs text-zinc-500">No courts available</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-[10px] text-zinc-400 mb-4 px-1">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(80,200,120,0.6)]"></span> Selected</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/50"></span> Booked</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600"></span> Available</div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-4 gap-2 mb-8 min-h-[120px]">
        {loadingSlots ? (
          <div className="col-span-4 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
        ) : (
          timeSlots.map((slot: any) => {
            const isSelected = selectedSlots.some(s => s.start === slot.start);
            const isBooked = slot.status !== "available";

            return (
              <button
                key={slot.start}
                disabled={isBooked}
                onClick={() => toggleSlot({ start: slot.start, end: slot.end })}
                className={`
                    py-2 rounded-lg text-xs font-medium border transition-all duration-200
                    ${isBooked
                    ? "bg-red-900/20 border-red-900/50 text-red-500 cursor-not-allowed opacity-60"
                    : isSelected
                      ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(80,200,120,0.4)] scale-105"
                      : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-700"
                  }
                `}
              >
                {isBooked ? "Booked" : format(parseISO(slot.start), "HH:mm")}
              </button>
            );
          })
        )}
      </div>

      {/* Total & Action */}
      <div className="border-t border-zinc-800 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-zinc-400">Total:</span>
          <span className="text-2xl font-bold text-white">
            {pricing ? `LKR ${pricing.total_price.toLocaleString()}` : "LKR 0"}
          </span>
        </div>

        <Button
          onClick={handleBooking}
          disabled={submitting || selectedSlots.length === 0}
          className={`w-full py-4 text-sm font-bold transition-all border ${selectedSlots.length > 0
            ? "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-500"
            : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedSlots.length > 0 ? "Proceed to Pay" : "Select Slots")}
        </Button>
      </div>

    </div>
  );
}