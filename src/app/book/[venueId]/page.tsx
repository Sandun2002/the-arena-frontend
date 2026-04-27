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

    if (loading) return <div className="min-h-screen bg-surface-base flex items-center justify-center text-emerald-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!venue) return <div className="min-h-screen bg-surface-base pt-24 text-primary text-center">Venue not found</div>;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-4xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/venues/${venueId}`} className="p-2 bg-surface-raised rounded-full text-secondary hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-primary mb-1">Book {venue.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {venue.city}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Step {step} of 3</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-surface-raised rounded-full mb-8 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>

                {/* Step 1: Select Sport & Date */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 md:p-8">
                            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-sm font-bold border border-emerald-500/20">1</span>
                                Choose Sport & Date
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase mb-3">Sport</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Array.from(new Set(courts.map(c => c.sport_type?.name || 'Futsal'))).map((sportName) => {
                                            return (
                                                <button
                                                    key={sportName}
                                                    onClick={() => setSelectedSport(sportName)}
                                                    className={`p-4 rounded-xl border font-bold text-sm transition-all ${selectedSport === sportName ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-surface-base/40 border-default text-secondary hover:border-subtle'}`}
                                                >
                                                    {sportName}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase mb-3">Date</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                                            const date = addDays(startOfToday(), offset);
                                            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                                            return (
                                                <button
                                                    key={offset}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? 'bg-primary text-inverted border-primary' : 'bg-surface-base/40 border-default text-muted hover:border-subtle'}`}
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
                                            className={`flex-shrink-0 min-w-[200px] p-4 rounded-2xl border text-left transition-all ${selectedCourt === court.id ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50' : 'bg-surface-raised/50 border-default hover:border-subtle'}`}
                                        >
                                            <h3 className={`font-bold ${selectedCourt === court.id ? 'text-emerald-500' : 'text-primary'}`}>{court.name}</h3>
                                            <p className="text-xs text-muted mt-1">{court.is_indoor ? 'Indoor' : 'Outdoor'}</p>
                                            <p className="text-sm font-bold text-primary mt-3">LKR {court.hourly_rate}/hr</p>
                                        </button>
                                    ))
                            ) : (
                                <p className="text-muted">No courts available for {selectedSport}.</p>
                            )}
                        </div>

                        {selectedCourt && (
                            <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 md:p-8">
                                <h3 className="text-lg font-bold text-primary mb-6">Available Slots for {format(selectedDate, "MMMM d")}</h3>

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
                                                        ${!isAvailable ? 'bg-surface-raised border-default text-faint cursor-not-allowed line-through' :
                                                            isSelected ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                                                                'bg-surface-base/40 border-default text-primary hover:border-emerald-500/50 hover:bg-emerald-500/5'}
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
                            <Button variant="outline" onClick={handlePrevStep} className="text-secondary border-default hover:text-primary">Back</Button>
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
                        <div className="bg-surface-raised/50 border border-default rounded-3xl overflow-hidden mb-6">
                            <div className="p-6 border-b border-default bg-surface-base/20">
                                <h2 className="text-xl font-bold text-primary">Booking Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-default/50">
                                    <span className="text-muted">Venue</span>
                                    <span className="text-primary font-medium text-right">{venue.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-default/50">
                                    <span className="text-muted">Sport</span>
                                    <span className="text-primary font-medium">{selectedSport}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-default/50">
                                    <span className="text-muted">Court</span>
                                    <span className="text-primary font-medium">
                                        {courts.find(c => c.id === selectedCourt)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-default/50">
                                    <span className="text-muted">Date & Time</span>
                                    <div className="text-right">
                                        <p className="text-primary font-medium">{format(selectedDate, "EEE, MMM d, yyyy")}</p>
                                        <p className="text-primary font-medium">
                                            {selectedSlot && format(parseISO(selectedSlot.start), "HH:mm")} - {selectedSlot && format(parseISO(selectedSlot.end), "HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-500/5 border-t border-default">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-secondary">Subtotal</span>
                                    <span className="text-primary">LKR {pricing?.subtotal || 0}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-secondary">Platform Fee</span>
                                    <span className="text-primary">LKR {pricing?.platform_fee || 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-dashed border-subtle">
                                    <span className="text-lg font-bold text-primary">Total</span>
                                    <span className="text-2xl font-bold text-emerald-500">LKR {pricing?.total_price || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between gap-4">
                            <Button variant="outline" onClick={handlePrevStep} className="text-secondary border-default hover:text-primary">Back</Button>
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
