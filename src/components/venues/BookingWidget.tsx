"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Venue } from "@/types";
import Button from "@/components/ui/Button";
import { Calendar, Check, LogIn } from "lucide-react";
import { useAuth } from "@/services/authContext";
import { addBooking } from "@/services/userData";

interface BookingWidgetProps {
  venue: Venue;
}

export default function BookingWidget({ venue }: BookingWidgetProps) {
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();
  const [date, setDate] = useState<string>("2026-02-10");
  const [selectedCourt, setSelectedCourt] = useState("Court 1");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Mock Data mimicking your screenshot
  const courts = ["Court 1", "Court 2", "Court 3"];
  const timeSlots = [
    { time: "06:00", status: "available" },
    { time: "07:00", status: "available" },
    { time: "08:00", status: "booked" }, // Red in screenshot
    { time: "09:00", status: "booked" },
    { time: "10:00", status: "available" },
    { time: "11:00", status: "available" },
    { time: "12:00", status: "available" },
    { time: "13:00", status: "available" },
    { time: "14:00", status: "available" },
    { time: "15:00", status: "available" },
    { time: "16:00", status: "available" },
    { time: "17:00", status: "available" },
  ];

  const toggleSlot = (time: string) => {
    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter((t) => t !== time));
    } else {
      setSelectedSlots([...selectedSlots, time]);
    }
  };

  const totalPrice = selectedSlots.length * venue.pricePerHour;

  const handleBooking = () => {
    if (selectedSlots.length === 0) return;

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // Add booking to user data
    const timeRange = selectedSlots.length > 1
      ? `${selectedSlots[0]} - ${parseInt(selectedSlots[selectedSlots.length - 1]) + 1}:00`
      : `${selectedSlots[0]} - ${parseInt(selectedSlots[0]) + 1}:00`;

    addBooking({
      venueName: venue.name,
      date: date,
      time: timeRange,
      price: totalPrice,
      image: venue.imageUrl,
    });

    // Show success and redirect
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/bookings");
    }, 2000);
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
    // THE STICKY MAGIC HAPPENS HERE: 'sticky top-24'
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
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 py-3 px-4 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Court Selection Tabs */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Court</label>
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          {courts.map((court) => (
            <button
              key={court}
              onClick={() => setSelectedCourt(court)}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${selectedCourt === court
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              {court}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between text-[10px] text-zinc-400 mb-4 px-1">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(80,200,120,0.6)]"></span> Selected</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/50"></span> Booked</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600"></span> Available</div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {timeSlots.map((slot) => {
          const isSelected = selectedSlots.includes(slot.time);
          const isBooked = slot.status === "booked";

          return (
            <button
              key={slot.time}
              disabled={isBooked}
              onClick={() => toggleSlot(slot.time)}
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
              {isBooked ? "Booked" : slot.time}
            </button>
          );
        })}
      </div>

      {/* Total & Action */}
      <div className="border-t border-zinc-800 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-zinc-400">Total:</span>
          <span className="text-2xl font-bold text-white">LKR {totalPrice.toLocaleString()}</span>
        </div>

        <Button
          onClick={handleBooking}
          className={`w-full py-4 text-sm font-bold transition-all border ${selectedSlots.length > 0
            ? "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-500"
            : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
            }`}
        >
          {selectedSlots.length > 0 ? "Proceed to Pay" : "Select Slots"}
        </Button>
      </div>

    </div>
  );
}