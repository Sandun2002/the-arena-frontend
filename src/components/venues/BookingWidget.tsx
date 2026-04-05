import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Venue } from "@/types";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import { Check, LogIn, Loader2, Calendar } from "lucide-react";
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
  const searchParams = useSearchParams();
  const { isLoggedIn, login } = useAuth();
  const { addToast } = useToast();

  const rqDate = searchParams.get("date");
  const rqSport = searchParams.get("sport");
  const rqStart = searchParams.get("start");
  const rqEnd = searchParams.get("end");

  const [date, setDate] = useState<string>(rqDate || "");
  const [courtsData, setCourtsData] = useState<any[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [selectedSlots, setSelectedSlots] = useState<{ start: string, end: string }[]>([]);
  const [isVenueClosed, setIsVenueClosed] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!rqDate) {
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [rqDate]);

  // Fetch Slots
  const loadSlots = () => {
    if (!venue?.id || !date) return;
    setLoadingSlots(true);
    api.getVenueSlots(venue.id, date)
      .then((res: any) => {
        setIsVenueClosed(res.is_closed || false);
        const data = (res.courts || []).map((court: any) => ({
          court: {
            id: court.court_id,
            name: court.court_name,
            sport: court.sport_type,
          },
          slots: court.slots.map((slot: any) => ({
            start: `${slot.date}T${slot.start}`,
            end: `${slot.date}T${slot.end}`,
            status: slot.status,
          })),
        }));
        setCourtsData(data);
        
        let targetCourtId = selectedCourtId;

        // Auto-select court logic 
        if (data.length > 0 && !targetCourtId) {
          // If sport is provided in URL, try to match it against court name or just use first court
          // Since the backend doesn't explicitly return sport_type with slots, we match name fuzzily or default
          const matchedCourt = rqSport 
            ? data.find((c: any) => c.court.sport?.toLowerCase() === rqSport.toLowerCase())
            : null;
            
          targetCourtId = matchedCourt ? matchedCourt.court.id : data[0].court.id;
          setSelectedCourtId(targetCourtId);
        }

        // Auto-select slots logic
        if (rqStart && !hasAutoSelected && targetCourtId) {
          const targetCourtData = data.find((c: any) => c.court.id === targetCourtId);
          if (targetCourtData && targetCourtData.slots) {
            // Find start and end indices
            const startIndex = targetCourtData.slots.findIndex((s: any) => s.start.includes(`T${rqStart}`) || s.start.includes(` ${rqStart}`));
            const endIndex = rqEnd ? targetCourtData.slots.findIndex((s: any) => s.end.includes(`T${rqEnd}`) || s.end.includes(` ${rqEnd}`)) : startIndex;
            
            if (startIndex !== -1) {
              const eIndex = endIndex !== -1 ? endIndex : startIndex;
              const slotsToSelect = targetCourtData.slots.slice(startIndex, eIndex + 1);
              
              // Only pick available ones
              const validSlots = slotsToSelect.filter((s: any) => s.status === "available");
              if (validSlots.length > 0) {
                setSelectedSlots(validSlots.map((s: any) => ({ start: s.start, end: s.end })));
              }
            }
          }
          setHasAutoSelected(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  };

  useEffect(() => {
    loadSlots();
    // Refresh slots every 30 seconds for real-time updates
    const intervalId = setInterval(loadSlots, 30000);
    return () => clearInterval(intervalId);
  }, [date, venue?.id]);

  // Calculate Price
  useEffect(() => {
    if (selectedCourtId && selectedSlots.length > 0) {
      // Sort slots by start time to ensure contiguous sequence 
      const sortedSlots = [...selectedSlots].sort((a, b) => a.start.localeCompare(b.start));
      const timeSlotsFormatted = sortedSlots.map(s => s.start.slice(11, 16));

      bookingService.calculatePrice(selectedCourtId, date, timeSlotsFormatted)
        .then(setPricing)
        .catch((error: any) => {
          setPricing(null);
          if (error.response?.status === 409) {
            addToast("Selected slot(s) are no longer available.", "error");
            setCourtsData(prev => prev.map(c => {
               if (c.court.id === selectedCourtId) {
                 return {
                   ...c,
                   slots: c.slots.map((s: any) => 
                     selectedSlots.some(sel => sel.start === s.start)
                       ? { ...s, status: "booked" }
                       : s
                   )
                 };
               }
               return c;
            }));
            setSelectedSlots([]);
          }
        });
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

      // Redirect to checkout to complete payment
      router.push(`/checkout/${booking.id}`);
    } catch (e: any) {
      if (e.response?.status === 409) {
         addToast("This time slot was just booked. Please select another.", "error");
         setCourtsData(prev => prev.map(c => {
            if (c.court.id === selectedCourtId) {
              return {
                ...c,
                slots: c.slots.map((s: any) => 
                  selectedSlots.some(sel => sel.start === s.start)
                    ? { ...s, status: "booked" }
                    : s
                )
              };
            }
            return c;
         }));
         setSelectedSlots([]);
      } else {
         addToast("Failed to create booking", "error");
      }
      setSubmitting(false);
    }
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
        <DatePicker
          label="Date"
          value={date}
          onChange={(v) => { setDate(v); setSelectedSlots([]); }}
          disablePast={true}
          placeholder="Select a date"
        />
      </div>

      {/* Court Selection Tabs */}
      {!isVenueClosed && (
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
                className={`flex-shrink-0 min-w-[120px] px-4 py-2 text-xs font-bold rounded-md transition-all ${selectedCourtId === cData.court.id
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                {cData.court.name} <span className="opacity-60 font-normal">({cData.court.sport})</span>
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
      )}

      {/* Legend */}
      {!isVenueClosed && (
        <div className="flex justify-between text-[10px] text-zinc-400 mb-4 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(80,200,120,0.6)]"></span> Selected</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/50"></span> Booked</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500/60"></span> Reserved</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-zinc-600 bg-zinc-800/50"></span> Past/Closed</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600"></span> Available</div>
        </div>
      )}

      {/* Time Slots Grid */}
      {isVenueClosed ? (
        <div className="mb-8 p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
          <Calendar className="w-8 h-8 text-red-500/50 mx-auto mb-3" />
          <h4 className="text-red-400 font-bold mb-1">Venue Closed</h4>
          <p className="text-zinc-400 text-sm">This venue is closed on the selected date. Please choose another date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 mb-8 min-h-[120px]">
          {loadingSlots ? (
            <div className="col-span-4 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
          ) : (
            timeSlots.map((slot: any) => {
              const isSelected = selectedSlots.some(s => s.start === slot.start);
              
              // Determine logic states
              const slotTime = parseISO(slot.start);
              const now = new Date();
              const isPast = slotTime < now;
              const isBooked = slot.status === "booked";
              const isClosed = slot.status === "closed";
              const isRecurring = slot.status === "recurring";
              
              const isUnavailable = isBooked || isClosed || isPast || isRecurring;

              return (
                <button
                  key={slot.start}
                  disabled={isUnavailable}
                  title={isRecurring ? "Reserved — recurring booking" : undefined}
                  onClick={() => toggleSlot({ start: slot.start, end: slot.end })}
                  className={`
                      py-2 rounded-lg text-xs font-medium border transition-all duration-200
                      ${isBooked
                        ? "bg-red-900/20 border-red-900/50 text-red-500 cursor-not-allowed opacity-60"
                        : isRecurring
                          ? "bg-indigo-900/30 border-indigo-700/50 text-indigo-400 cursor-not-allowed"
                          : isClosed || isPast
                            ? "bg-black/20 border-zinc-800/50 text-zinc-600 cursor-not-allowed"
                            : isSelected
                              ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(80,200,120,0.4)] scale-105"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-700"
                    }
                  `}
                >
                  {isBooked ? "Booked" : isRecurring ? "Reserved" : isClosed ? "Closed" : isPast ? "Past" : format(slotTime, "HH:mm")}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Warning Box */}
      {!isVenueClosed && pricing && selectedSlots.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-2">
          <h4 className="flex items-center gap-2 text-sm font-bold text-amber-500 mb-1">
            ⚠️ Double Check Your Court!
          </h4>
          <p className="text-xs text-amber-500/80 leading-relaxed">
            Please make sure you are booking the correct court for your sport. You have selected:
            <br/>
            <span className="font-bold text-amber-400 mt-1 inline-block">
              {courtsData.find(c => c.court.id === selectedCourtId)?.court.name || "Court"}
            </span>
          </p>
        </div>
      )}

      {/* Total & Action */}
      <div className="border-t border-zinc-800 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-zinc-400">Total:</span>
          <span className="text-2xl font-bold text-white">
            {pricing ? `LKR ${pricing.total.toLocaleString()}` : "LKR 0"}
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