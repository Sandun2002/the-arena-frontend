
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { format, addHours, startOfHour } from "date-fns";
import { Loader2, Calendar, User, Clock, DollarSign, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { Court } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";

export default function WalkInPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    const [courts, setCourts] = useState<Court[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            court_id: "",
            date: format(new Date(), "yyyy-MM-dd"),
            start_time: format(startOfHour(addHours(new Date(), 1)), "HH:mm"),
            duration: 1,
            customer_name: "",
            customer_phone: "",
            notes: ""
        }
    });

    const selectedCourtId = watch("court_id");
    const selectedCourt = courts.find(c => c.id === selectedCourtId);
    const duration = watch("duration");
    const totalPrice = selectedCourt ? selectedCourt.hourly_rate * duration : 0;

    useEffect(() => {
        if (currentVenue) {
            centerService.getCourts(currentVenue.id).then(setCourts);
        }
    }, [currentVenue]);

    const onSubmit = async (data: any) => {
        if (!currentVenue) return;
        setIsSubmitting(true);
        try {
            // Calculate timestamps
            const startDateTime = new Date(`${data.date}T${data.start_time}`);
            const endDateTime = addHours(startDateTime, data.duration);

            await centerService.createManualBooking({
                venue_id: currentVenue.id,
                court_id: data.court_id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                customer_name: data.customer_name || "Walk-in Guest",
                customer_phone: data.customer_phone,
                notes: data.notes,
                total_price: totalPrice,
                is_manual: true,
                payment_status: "paid" // Walk-ins are usually paid on spot
            });

            addToast("Walk-in booking recorded successfully", "success");
            router.push("/venue-dashboard/bookings");
        } catch (error: any) {
            console.error(error);
            addToast(error.response?.data?.message || "Failed to record booking. Slot might be taken.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <Wallet className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400">Please select a venue to record a walk-in.</p>
            </div>
        );
    }

    return (
        <main className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">New Booking</h1>
                    <p className="text-zinc-400">Record a manual booking for {currentVenue.name}</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Court Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Court</label>
                            <div className="relative">
                                <select
                                    {...register("court_id", { required: "Select a court" })}
                                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer hover:border-zinc-600"
                                >
                                    <option value="">Choose a court...</option>
                                    {courts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.sport_type}) - LKR {c.hourly_rate}/hr</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            {errors.court_id && <p className="text-red-500 text-xs font-bold">{errors.court_id.message as string}</p>}
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</label>
                                <input
                                    type="date"
                                    {...register("date", { required: true })}
                                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Start Time</label>
                                <input
                                    type="time"
                                    {...register("start_time", { required: true })}
                                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration</label>
                            <div className="flex bg-black/40 border border-zinc-700 rounded-xl p-1 gap-1">
                                {[1, 1.5, 2, 3].map((h) => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setValue("duration", h)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${duration === h ? "bg-emerald-500 text-black shadow-lg scale-105" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-zinc-800/50 my-6" />

                        {/* Customer Info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Customer Details</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        {...register("customer_name")}
                                        placeholder="Name (Optional)"
                                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600"
                                    />
                                    <input
                                        {...register("customer_phone")}
                                        placeholder="Phone (Optional)"
                                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Total & Submit */}
                        <div className="pt-2">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase">Total Due</p>
                                        <p className="text-xs text-zinc-600">Pay at counter</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-white tracking-tight">LKR {totalPrice.toLocaleString()}</span>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Receipt & Book"}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    );
}
