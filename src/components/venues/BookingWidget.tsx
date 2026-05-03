import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Venue } from "@/types";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import { Check, SignIn, CircleNotch, CalendarBlank, Hammer, Lightning, WarningCircle, ArrowsClockwise, Money, CreditCard, HandCoins } from "@phosphor-icons/react";
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
  const [closureReason, setClosureReason] = useState<string | null>(null);
  const [maintenanceCourts, setMaintenanceCourts] = useState<any[]>([]);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [peakConfig, setPeakConfig] = useState<{
    peak_start_time: string | null;
    peak_end_time: string | null;
    peak_days: string | null;
    has_peak_config: boolean;
  } | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [cashBookingRef, setCashBookingRef] = useState<string | null>(null);
  const [cashBookingAmount, setCashBookingAmount] = useState<number>(0);
  const [cashBookingTime, setCashBookingTime] = useState<string>("");

  useEffect(() => {
    if (!rqDate) {
      setDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [rqDate]);

  // Fetch Slots
  const loadSlots = () => {
    if (!venue?.id || !date) return;
    setLoadingSlots(true);
    setSlotsError(false);
    api.getVenueSlots(venue.id, date)
      .then((res: any) => {
        setIsVenueClosed(res.is_closed || false);
        setClosureReason(res.closure_reason || null);
        setPeakConfig(res.peak_hours || null);

        // Separate active and maintenance courts
        const allCourts = res.courts || [];
        const activeCourts = allCourts.filter((c: any) => c.is_active !== false);
        const maintenance = allCourts.filter((c: any) => c.is_active === false);
        setMaintenanceCourts(maintenance);

        const data = activeCourts.map((court: any) => ({
          court: {
            id: court.court_id,
            name: court.court_name,
            sport: court.sport_type,
            hourly_rate: court.hourly_rate,
            peak_hourly_rate: court.peak_hourly_rate,
          },
          slots: court.slots.map((slot: any) => ({
            start: `${slot.date}T${slot.start}`,
            end: `${slot.date}T${slot.end}`,
            status: slot.status,
            is_peak: !!slot.is_peak,
            effective_rate: slot.effective_rate ?? court.hourly_rate,
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
      .catch((err) => { console.error(err); setSlotsError(true); })
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
        payment_method: paymentMethod,
      });

      if (paymentMethod === "cash") {
        // Cash booking: show confirmation panel — no redirect to PayHere
        setCashBookingRef(booking.booking_reference);
        setCashBookingAmount(booking.total_price);
        setCashBookingTime(format(new Date(startTime), "dd MMM yyyy, HH:mm"));
        setShowSuccess(true);
      } else {
        // Card booking: redirect to checkout
        router.push(`/checkout/${booking.id}`);
      }
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

  // Cash booking success overlay
  if (showSuccess && paymentMethod === "cash") {
    return (
      <div className="w-full rounded-2xl bg-surface-raised/80 border border-yellow-500/40 p-8 backdrop-blur-md shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mx-auto mb-4">
          <HandCoins size={32} weight="duotone" className="text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-1">Reservation Confirmed!</h3>
        <p className="text-secondary text-sm mb-4">Pay <span className="font-bold text-primary">LKR {cashBookingAmount.toLocaleString()}</span> at the venue on arrival.</p>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-5 text-left space-y-1.5">
          <div className="flex justify-between text-xs"><span className="text-muted">Reference</span><span className="font-mono font-bold text-primary">{cashBookingRef}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted">Session</span><span className="text-secondary">{cashBookingTime}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted">Payment</span><span className="font-bold text-yellow-400">Cash at Venue 💵</span></div>
        </div>
        <button
          onClick={() => router.push("/bookings")}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-sm transition-colors"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  // Card booking success overlay (redirect already happened; fallback)
  if (showSuccess) {
    return (
      <div className="w-full rounded-2xl bg-surface-raised/80 border border-emerald-500 p-8 backdrop-blur-md shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
          <Check size={32} weight="bold" className="text-black" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">Booking Confirmed!</h3>
        <p className="text-secondary text-sm mb-4">Redirecting to your bookings...</p>
        <div className="animate-pulse text-emerald-500 text-sm">Please wait...</div>
      </div>
    );
  }

  // Login prompt overlay
  if (showLoginPrompt) {
    return (
      <div className="w-full rounded-2xl bg-surface-raised/80 border border-default p-8 backdrop-blur-md shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-surface-overlay flex items-center justify-center mx-auto mb-4">
          <SignIn size={32} weight="duotone" className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">Login Required</h3>
        <p className="text-secondary text-sm mb-6">Please sign in to complete your booking.</p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 text-sm text-secondary hover:text-primary transition-colors"
          >
            Go to Login Page
          </button>
          <button
            onClick={() => setShowLoginPrompt(false)}
            className="text-xs text-muted hover:text-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-surface-raised/80 border border-default p-6 backdrop-blur-md shadow-xl">

      <h3 className="text-xl font-bold text-primary mb-1">Confirm Booking</h3>
      <p className="text-xs text-secondary mb-6">Select your date, court, and time slots.</p>

      {/* Peak Hours Banner */}
      {peakConfig?.has_peak_config && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 flex items-center gap-2">
          <Lightning size={14} weight="fill" className="text-amber-400 flex-shrink-0" />
          <p className="text-[11px] text-amber-400/90 leading-snug">
            <span className="font-bold">Peak hours {peakConfig.peak_start_time}&ndash;{peakConfig.peak_end_time}</span>
            {peakConfig.peak_days ? ` on selected days` : ` (every day)`}
            {` `}may cost more.
          </p>
        </div>
      )}

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
          <label className="mb-2 block text-xs font-bold text-muted uppercase tracking-wider">Select Court</label>
          <div className="flex bg-surface-sunken p-1 rounded-lg border border-default overflow-x-auto scrollbar-hide">
            {courtsData.map((cData) => (
              <button
                key={cData.court.id}
                onClick={() => {
                  setSelectedCourtId(cData.court.id);
                  setSelectedSlots([]);
                }}
                className={`flex-shrink-0 min-w-[120px] px-4 py-2 text-xs font-bold rounded-md transition-all ${selectedCourtId === cData.court.id
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-secondary hover:text-primary"
                  }`}
              >
                {cData.court.name} <span className="opacity-60 font-normal">({cData.court.sport})</span>
              </button>
            ))}
            {loadingSlots && courtsData.length === 0 && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 min-w-[120px] h-8 rounded-md bg-surface-overlay animate-pulse" />
                ))}
              </>
            )}
            {!loadingSlots && courtsData.length === 0 && (
              <span className="py-2 px-4 text-xs text-muted">No courts available</span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {!isVenueClosed && (
        <div className="flex justify-between text-[10px] text-secondary mb-4 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(80,200,120,0.6)]"></span> Selected</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/50"></span> Booked</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500/60"></span> Reserved</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600/70 border border-zinc-500/40"></span> Maintenance</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-subtle bg-surface-overlay/50"></span> Past/Closed</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600"></span> Available</div>
          <div className="flex items-center gap-1"><Lightning size={10} weight="fill" className="text-amber-400" /> Peak</div>
        </div>
      )}

      {/* Maintenance Courts Section - shown when venue is open but some courts are under maintenance */}
      {!isVenueClosed && maintenanceCourts.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Hammer size={16} weight="duotone" className="text-amber-500" />
            <h4 className="text-amber-500 font-bold text-sm uppercase tracking-wider">
              Courts Under Maintenance
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {maintenanceCourts.map((court) => (
              <div
                key={court.court_id}
                className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg"
              >
                <span className="text-amber-400 text-xs font-medium line-through opacity-60">
                  {court.court_name}
                </span>
                <span className="text-[10px] text-amber-500/70 uppercase tracking-wider">
                  Maintenance
                </span>
              </div>
            ))}
          </div>
          <p className="text-amber-500/60 text-xs">
            These courts are temporarily unavailable. Check back later.
          </p>
        </div>
      )}

      {/* Time Slots Grid */}
      {isVenueClosed ? (
        <div className="mb-8 p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
          <CalendarBlank size={32} weight="duotone" className="text-red-500/50 mx-auto mb-3" />
          <h4 className="text-red-400 font-bold mb-1">Venue Closed</h4>
          <p className="text-secondary text-sm">
            {closureReason || "This venue is closed on the selected date. Please choose another date."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 mb-8 min-h-[120px]">
          {loadingSlots ? (
            <>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-surface-raised border border-default/30 animate-pulse" />
              ))}
            </>
          ) : slotsError ? (
            <div className="col-span-4 flex flex-col items-center justify-center gap-3 py-6 text-sm text-muted">
              <WarningCircle size={20} weight="duotone" className="text-red-400" />
              <span>Failed to load availability.</span>
              <button
                onClick={loadSlots}
                className="inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:underline text-xs"
              >
                <ArrowsClockwise size={14} weight="bold" /> Retry
              </button>
            </div>
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
              const isMaintenance = slot.status === "maintenance";
              
              const isUnavailable = isBooked || isClosed || isPast || isRecurring || isMaintenance;

              const isPeak = !!slot.is_peak;
              const showPeakBadge = isPeak && !isUnavailable;
              const peakTooltip = isPeak && slot.effective_rate
                ? `Peak hour · LKR ${slot.effective_rate.toLocaleString()}/hr`
                : undefined;

              return (
                <button
                  key={slot.start}
                  disabled={isUnavailable}
                  title={
                    isMaintenance ? "Under maintenance — unavailable"
                    : isRecurring ? "Reserved — recurring booking"
                    : peakTooltip
                  }
                  onClick={() => toggleSlot({ start: slot.start, end: slot.end })}
                  className={`
                      relative py-2 rounded-lg text-xs font-medium border transition-all duration-200
                      ${isMaintenance
                        ? "bg-surface-overlay/30 border-subtle/50 text-secondary cursor-not-allowed"
                        : isBooked
                          ? "bg-red-900/20 border-red-900/50 text-red-500 cursor-not-allowed opacity-60"
                          : isRecurring
                            ? "bg-indigo-900/30 border-indigo-700/50 text-indigo-400 cursor-not-allowed"
                            : isClosed || isPast
                              ? "bg-surface-base/20 border-default/50 text-faint cursor-not-allowed"
                              : isSelected
                                ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(80,200,120,0.4)] scale-105"
                                : isPeak
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-500/60 hover:bg-amber-500/20"
                                  : "bg-surface-overlay border-subtle text-secondary hover:border-subtle hover:bg-surface-overlay"
                    }
                  `}
                >
                  {showPeakBadge && (
                    <Lightning
                      size={10}
                      weight="fill"
                      className={`absolute top-1 right-1 ${
                        isSelected ? "text-black/80" : "text-amber-400"
                      }`}
                    />
                  )}
                  {isMaintenance ? "Maint." : isBooked ? "Booked" : isRecurring ? "Reserved" : isClosed ? "Closed" : isPast ? "Past" : format(slotTime, "HH:mm")}
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
      <div className="border-t border-default pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-secondary">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {pricing ? `LKR ${pricing.total.toLocaleString()}` : "LKR 0"}
          </span>
        </div>

        {/* Payment Method Toggle */}
        {selectedSlots.length > 0 && pricing && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-bold text-muted uppercase tracking-wider">How will you pay?</label>
            <div className="flex bg-surface-sunken p-1 rounded-xl border border-default gap-1">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === "card"
                    ? "bg-emerald-500 text-black shadow"
                    : "text-muted hover:text-secondary"
                }`}
              >
                <CreditCard size={14} weight="bold" /> Pay by Card
              </button>
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  paymentMethod === "cash"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow"
                    : "text-muted hover:text-secondary"
                }`}
              >
                <Money size={14} weight="bold" /> Pay at Venue
              </button>
            </div>
            {paymentMethod === "cash" && (
              <p className="mt-2 text-[11px] text-yellow-400/80 leading-snug">
                💡 Your slot is reserved immediately. Bring <strong>LKR {pricing.total.toLocaleString()}</strong> cash on arrival.
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleBooking}
          disabled={submitting || selectedSlots.length === 0}
          className={`w-full py-4 text-sm font-bold transition-all border ${
            selectedSlots.length > 0
              ? paymentMethod === "cash"
                ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/40"
                : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-500"
              : "bg-surface-overlay hover:bg-surface-overlay text-primary border-subtle"
          } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {submitting
            ? <CircleNotch size={20} weight="bold" className="animate-spin" />
            : selectedSlots.length > 0
              ? paymentMethod === "cash"
                ? <><HandCoins size={16} weight="bold" /> Reserve — Pay at Venue</>
                : "Proceed to Pay"
              : "Select Slots"
          }
        </Button>
      </div>

    </div>
  );
}