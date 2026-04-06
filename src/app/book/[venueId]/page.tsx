"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, addDays, startOfToday, parseISO } from "date-fns";
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, CreditCard, Loader2, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { api } from "@/services/api";
import { bookingService } from "@/services/bookingService";
import { Venue, Court, SlotAvailability } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { centerService } from "@/services/centerService";

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const venueId = params.venueId as string;

    const [venue, setVenue] = useState<Venue | null>(null);
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);

    // Wizard State
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [selectedSport, setSelectedSport] = useState<string>("");
    const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [availability, setAvailability] = useState<SlotAvailability[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [pricing, setPricing] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadVenueData = async () => {
            try {
                const v = await api.getVenueById(venueId);
                setVenue(v || null);
                if (v) {
                    // Load courts for this venue
                    let venueCourts: Court[] = [];
                    try {
                        venueCourts = await centerService.getCourts(v.id);
                    } catch (e) {
                        console.error("Failed to load courts", e);
                    }
                    setCourts(venueCourts);

                    // Set default sport based on courts
                    if (venueCourts.length > 0 && venueCourts[0].sport_type) {
                        setSelectedSport((venueCourts[0] as any).sport_type?.name || (venueCourts[0] as any).sport_type);
                    } else {
                        setSelectedSport("Futsal");
                    }
                }
            } catch (error) {
                console.error("Failed to load venue");
            } finally {
                setLoading(false);
            }
        };
        loadVenueData();
    }, [venueId]);

    // Load slots when court/date changes
    useEffect(() => {
        if (step === 2 && selectedCourt && selectedDate) {
            setLoadingSlots(true);
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            // Call api to get venue slots
            api.getVenueSlots(venueId, dateStr, selectedSport)
                .then((res: any) => {
                    const courtData = res.venue_slots?.find((cs: any) => cs.court.id === selectedCourt);
                    setAvailability(courtData ? courtData.slots : []);
                })
                .catch(() => setAvailability([]))
                .finally(() => setLoadingSlots(false));
        }
    }, [step, selectedCourt, selectedDate, venueId, selectedSport]);

    // Calculate price when slot is selected
    useEffect(() => {
        if (selectedCourt && selectedSlot && selectedDate) {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const timeSlotFormatted = format(parseISO(selectedSlot.start), "HH:mm");

            bookingService.calculatePrice(selectedCourt, dateStr, [timeSlotFormatted])
                .then(setPricing)
                .catch(console.error);
        }
    }, [selectedCourt, selectedSlot, selectedDate]);

    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => setStep(prev => prev - 1);

    const handleConfirmBooking = async () => {
        if (!user || !selectedCourt || !selectedSlot) return;
        setSubmitting(true);
        try {
            const booking = await bookingService.createBooking({
                venue_id: venueId,
                court_id: selectedCourt,
                start_time: selectedSlot.start,
                end_time: selectedSlot.end,
                payment_method: "card"
            });
            addToast("Booking created! Redirecting to payment...", "info");
            router.push(`/checkout/${booking.id}`);
        } catch (error) {
            addToast("Booking failed. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!venue) return <div className="min-h-screen bg-black pt-24 text-white text-center">Venue not found</div>;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-4xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/venues/${venueId}`} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Book {venue.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {venue.city}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Step {step} of 3</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-zinc-900 rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                {/* Step 1: Select Sport & Date */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-sm font-bold border border-emerald-500/20">1</span>
                                Choose Sport & Date
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Sport</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Array.from(new Set(courts.map(c => c.sport_type?.name || 'Futsal'))).map((sportName) => {
                                            return (
                                                <button
                                                    key={sportName}
                                                    onClick={() => setSelectedSport(sportName)}
                                                    className={`p-4 rounded-xl border font-bold text-sm transition-all ${selectedSport === sportName ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                                                >
                                                    {sportName}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Date</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                                            const date = addDays(startOfToday(), offset);
                                            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                                            return (
                                                <button
                                                    key={offset}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? 'bg-white text-black border-white' : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                                                >
                                                    <span className="text-xs font-medium uppercase">{format(date, "EEE")}</span>
                                                    <span className="text-xl font-bold">{format(date, "d")}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleNextStep}
                                disabled={!selectedSport}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8"
                            >
                                Next: Select Court
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Court & Slot */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {courts.length > 0 ? (
                                courts
                                    .filter(c => c.sport_type?.name === selectedSport || !selectedSport)
                                    .map((court) => (
                                        <button
                                            key={court.id}
                                            onClick={() => { setSelectedCourt(court.id); setSelectedSlot(null); }}
                                            className={`flex-shrink-0 min-w-[200px] p-4 rounded-2xl border text-left transition-all ${selectedCourt === court.id ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <h3 className={`font-bold ${selectedCourt === court.id ? 'text-emerald-500' : 'text-white'}`}>{court.name}</h3>
                                            <p className="text-xs text-zinc-500 mt-1">{court.is_indoor ? 'Indoor' : 'Outdoor'}</p>
                                            <p className="text-sm font-bold text-white mt-3">LKR {court.hourly_rate}/hr</p>
                                        </button>
                                    ))
                            ) : (
                                <p className="text-zinc-500">No courts available for {selectedSport}.</p>
                            )}
                        </div>

                        {selectedCourt && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                                <h3 className="text-lg font-bold text-white mb-6">Available Slots for {format(selectedDate, "MMMM d")}</h3>

                                {loadingSlots ? (
                                    <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                                ) : (
                                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {availability.map((slot, idx) => {
                                            const startTime = format(parseISO(slot.start), "HH:mm");
                                            const isSelected = selectedSlot?.start === slot.start;
                                            const isAvailable = slot.status === "available";

                                            return (
                                                <button
                                                    key={idx}
                                                    disabled={!isAvailable}
                                                    onClick={() => setSelectedSlot({ start: slot.start, end: slot.end })}
                                                    className={`p-3 rounded-lg border text-sm font-bold transition-all
                                                        ${!isAvailable ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed line-through' :
                                                            isSelected ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                                                                'bg-black/40 border-zinc-800 text-white hover:border-emerald-500/50 hover:bg-emerald-500/5'}
                                                    `}
                                                >
                                                    {startTime}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={handlePrevStep} className="text-zinc-400 border-zinc-800 hover:text-white">Back</Button>
                            <Button
                                onClick={handleNextStep}
                                disabled={!selectedCourt || !selectedSlot}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Review Booking
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Pay */}
                {step === 3 && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden mb-6">
                            <div className="p-6 border-b border-zinc-800 bg-black/20">
                                <h2 className="text-xl font-bold text-white">Booking Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500">Venue</span>
                                    <span className="text-white font-medium text-right">{venue.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500">Sport</span>
                                    <span className="text-white font-medium">{selectedSport}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500">Court</span>
                                    <span className="text-white font-medium">
                                        {courts.find(c => c.id === selectedCourt)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                                    <span className="text-zinc-500">Date & Time</span>
                                    <div className="text-right">
                                        <p className="text-white font-medium">{format(selectedDate, "EEE, MMM d, yyyy")}</p>
                                        <p className="text-white font-medium">
                                            {selectedSlot && format(parseISO(selectedSlot.start), "HH:mm")} - {selectedSlot && format(parseISO(selectedSlot.end), "HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-500/5 border-t border-zinc-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-400">Subtotal</span>
                                    <span className="text-white">LKR {pricing?.subtotal || 0}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-zinc-400">Platform Fee</span>
                                    <span className="text-white">LKR {pricing?.platform_fee || 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-dashed border-zinc-700">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-emerald-500">LKR {pricing?.total_price || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between gap-4">
                            <Button variant="outline" onClick={handlePrevStep} className="text-zinc-400 border-zinc-800 hover:text-white">Back</Button>
                            <Button
                                onClick={handleConfirmBooking}
                                disabled={submitting}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-6 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5 mr-2" />}
                                Pay & Confirm
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
