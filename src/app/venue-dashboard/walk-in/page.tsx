
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { format, addHours, startOfHour } from "date-fns";
import { Loader2, Calendar, User, Clock, DollarSign } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { Court, Venue } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function WalkInPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");
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
        if (user) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) setSelectedVenueId(data[0].id);
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedVenueId) {
            venueService.getCourts(selectedVenueId).then(setCourts);
        }
    }, [selectedVenueId]);

    const onSubmit = async (data: any) => {
        if (!selectedVenueId) return;
        setIsSubmitting(true);
        try {
            // Calculate end time
            const startDateTime = new Date(`${data.date}T${data.start_time}`);
            const endDateTime = addHours(startDateTime, data.duration);

            await venueService.createManualBooking({
                venue_id: selectedVenueId,
                court_id: data.court_id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                customer_name: data.customer_name || "Walk-in Guest",
                customer_phone: data.customer_phone,
                notes: data.notes,
                total_price: totalPrice
            });

            addToast("Walk-in booking recorded", "success");
            router.push("/venue-dashboard");
        } catch (error) {
            addToast("Failed to record booking. Slot might be taken.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-lg">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Record Walk-in</h1>
                    <p className="text-zinc-400">Manually add a booking for an offline customer.</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Venue & Court Selection */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Venue</label>
                                <select
                                    value={selectedVenueId}
                                    onChange={(e) => setSelectedVenueId(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                                >
                                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Court</label>
                                <select
                                    {...register("court_id", { required: "Select a court" })}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                                >
                                    <option value="">Select a court...</option>
                                    {courts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.sport_type})</option>)}
                                </select>
                                {errors.court_id && <p className="text-red-500 text-xs">{errors.court_id.message as string}</p>}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Date</label>
                                <input
                                    type="date"
                                    {...register("date", { required: true })}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Start Time</label>
                                <input
                                    type="time"
                                    {...register("start_time", { required: true })}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Duration (Hours)</label>
                            <div className="flex bg-black/50 border border-zinc-700 rounded-xl p-1">
                                {[1, 1.5, 2, 3].map((h) => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setValue("duration", h)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${duration === h ? "bg-emerald-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"}`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Customer Name (Optional)</label>
                                <input
                                    {...register("customer_name")}
                                    placeholder="Guest Name"
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Phone (Optional)</label>
                                <input
                                    {...register("customer_phone")}
                                    placeholder="077..."
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Total & Submit */}
                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-zinc-400 font-medium">Total to Collect</span>
                                <span className="text-2xl font-bold text-white">LKR {totalPrice.toLocaleString()}</span>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm & Record Payment"}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    );
}
