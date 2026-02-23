
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { centerService } from "@/services/centerService";
import { Court, RecurringBooking } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface RecurringFormModalProps {
    venueId: string;
    courts: Court[];
    existingBooking?: RecurringBooking | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RecurringFormModal({ venueId, courts, existingBooking, onClose, onSuccess }: RecurringFormModalProps) {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            client_name: existingBooking?.client_name || "",
            client_phone: existingBooking?.client_phone || "",
            court_id: existingBooking?.court_id || "",
            day_of_week: existingBooking?.day_of_week || "Monday",
            start_time: existingBooking?.start_time || "08:00",
            end_time: existingBooking?.end_time || "10:00",
            start_date: existingBooking?.start_date || "",
            end_date: existingBooking?.end_date || "",
        }
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, venue_id: venueId };

            if (existingBooking) {
                await centerService.updateRecurringBooking(existingBooking.id, payload);
                addToast("Recurring booking updated", "success");
            } else {
                await centerService.createRecurringBooking(payload);
                addToast("Recurring booking created", "success");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            addToast("Failed to save recurring booking", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Client Name</label>
                    <input
                        {...register("client_name", { required: "Client name is required" })}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Academy or Company Name"
                    />
                    {errors.client_name && <p className="text-red-500 text-xs font-bold">{errors.client_name.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact Phone</label>
                    <input
                        {...register("client_phone")}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="077..."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Court</label>
                <div className="relative">
                    <select
                        {...register("court_id", { required: "Select a court" })}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                        <option value="">Select Court...</option>
                        {courts.map(c => <option key={c.id} value={c.id}>{c.name} ({(c as any).sport_type?.name || (c as any).sport_type})</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                {errors.court_id && <p className="text-red-500 text-xs font-bold">{errors.court_id.message as string}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Day</label>
                    <select
                        {...register("day_of_week")}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-2 col-span-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Start Time</label>
                    <input
                        type="time"
                        {...register("start_time", { required: true })}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
                <div className="space-y-2 col-span-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">End Time</label>
                    <input
                        type="time"
                        {...register("end_time", { required: true })}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Start Date</label>
                    <input
                        type="date"
                        {...register("start_date", { required: "Start date is required" })}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">End Date</label>
                    <input
                        type="date"
                        {...register("end_date", { required: "End date is required" })}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl mt-4"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (existingBooking ? "Update Booking" : "Create Booking")}
            </Button>
        </form>
    );
}
