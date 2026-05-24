"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarBlank, Clock, Lock, MapPin, ShieldCheck, User } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { api } from "@/services/api";
import { bookingService } from "@/services/bookingService";
import { useAuth } from "@/services/authContext";
import { useToast } from "@/components/ui/Toast";
import { Venue } from "@/types";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const { addToast } = useToast();

    const venueId = searchParams.get("venue_id");
    const courtId = searchParams.get("court_id");
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const startTime = searchParams.get("start") || "18:00";
    const endTime = searchParams.get("end") || "19:00";

    const [venue, setVenue] = useState<Venue | null>(null);
    const [pricing, setPricing] = useState<{ total_price: number; subtotal: number; platform_fee: number; duration_hours: number } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const court = venue?.courts.find((item) => item.id === courtId) ?? null;

    useEffect(() => {
        const load = async () => {
            if (!venueId || !courtId) {
                setLoading(false);
                return;
            }

            try {
                const venueData = await api.getVenueById(venueId);
                setVenue(venueData);
                const price = await bookingService.calculatePrice(courtId, date, [startTime]);
                setPricing({
                    total_price: price.total,
                    subtotal: price.subtotal,
                    platform_fee: price.service_fee,
                    duration_hours: price.duration_hours
                });
            } catch {
                addToast("Unable to load checkout details", "error");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [venueId, courtId, date, startTime, addToast]);

    const handleBook = async () => {
        if (!isLoggedIn) {
            router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }
        if (!venue || !courtId) return;

        setSubmitting(true);
        try {
            const booking = await bookingService.createBooking({
                venue_id: venue.id,
                court_id: courtId,
                start_time: new Date(`${date}T${startTime}:00`).toISOString(),
                end_time: new Date(`${date}T${endTime}:00`).toISOString(),
                payment_method: "cash",
            });
            // TEMPORARY: Redirect to bookings instead of checkout because card payments are disabled
            // router.push(`/checkout/${booking.id}`);
            router.push(`/bookings`);
        } catch {
            addToast("Failed to create booking", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-surface-base flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" /></div>;
    }

    if (!venueId || !courtId || !venue || !court) {
        return (
            <main className="min-h-screen bg-surface-base pt-24 px-4 text-primary">
                <div className="container mx-auto max-w-3xl rounded-[2rem] border border-default bg-surface-raised/40 p-8 text-center">
                    <h1 className="text-2xl font-bold">Checkout requires a live booking selection</h1>
                    <p className="mt-3 text-secondary">Choose a venue and time slot from the venue page to continue.</p>
                    <Link href="/venues"><Button className="mt-6 bg-emerald-500 text-black hover:bg-emerald-400">Browse Venues</Button></Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-20 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"><div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" /></div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <Link href={`/venues/${venue.id}`} className="inline-flex items-center text-muted hover:text-primary mb-8 transition-colors group"><ArrowLeft size={16} weight="bold" className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Venue</Link>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                            <div className="rounded-[2rem] border border-default bg-surface-raised/40 backdrop-blur-sm overflow-hidden">
                                <div className="p-6 border-b border-default">
                                    <h1 className="text-3xl font-black text-primary mb-1 uppercase tracking-tight">{venue.name}</h1>
                                    <div className="flex items-center gap-2 text-secondary text-sm font-medium">
                                        <MapPin size={16} weight="fill" className="text-emerald-500" />
                                        {venue.city} · {court.name}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-surface-base/40 p-4 rounded-xl border border-default flex items-center gap-3"><CalendarBlank size={20} weight="bold" className="text-emerald-500" /><div><p className="text-xs text-muted font-bold uppercase">Date</p><p className="text-primary font-medium">{date}</p></div></div>
                                        <div className="bg-surface-base/40 p-4 rounded-xl border border-default flex items-center gap-3"><Clock size={20} weight="bold" className="text-emerald-500" /><div><p className="text-xs text-muted font-bold uppercase">Time</p><p className="text-primary font-medium">{startTime} - {endTime}</p></div></div>
                                    </div>

                                    <div className="space-y-3 border-t border-default pt-6">
                                        <div className="flex justify-between text-secondary"><span>Court Rental ({pricing?.duration_hours || 1} hr)</span><span>LKR {(pricing?.subtotal || 0).toLocaleString()}</span></div>
                                        <div className="flex justify-between text-secondary"><span>Service Fee</span><span>LKR {(pricing?.platform_fee || 0).toLocaleString()}</span></div>
                                        <div className="flex justify-between text-primary text-xl font-bold pt-3 border-t border-default/50"><span>Total</span><span>LKR {(pricing?.total_price || 0).toLocaleString()}</span></div>
                                    </div>
                                </div>
                            </div>
                    </div>

                        <div className="md:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                <div className="rounded-[2rem] border border-default bg-surface-raised/60 backdrop-blur-xl p-6 shadow-xl">
                                    <h3 className="text-lg font-bold text-primary mb-4">Confirm Booking</h3>
                                    <div className="mb-6 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-secondary"><ShieldCheck size={16} weight="fill" className="text-emerald-500" /><span>Authenticated booking flow</span></div>
                                        <div className="flex items-center gap-2 text-sm text-secondary"><User size={16} weight="fill" className="text-emerald-500" /><span>Instant reservation creation</span></div>
                                    </div>

                                    <Button onClick={handleBook} disabled={submitting} className="w-full py-4 text-sm bg-emerald-500 text-black hover:bg-emerald-400 font-bold flex items-center justify-center gap-2">
                                        {submitting ? "Creating booking..." : <><Lock size={16} weight="bold" /> Confirm LKR {(pricing?.total_price || 0).toLocaleString()}</>}
                                    </Button>

                                    <p className="text-xs text-muted text-center mt-4">By confirming, you agree to the <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>.</p>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </main>
    );
}

export default function CheckoutPage() {
    return <Suspense fallback={<div className="min-h-screen bg-surface-base flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div></div>}><CheckoutContent /></Suspense>;
}
