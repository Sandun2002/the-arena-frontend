
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CircleNotch } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import TimePicker from "@/components/ui/TimePicker";
import DatePicker from "@/components/ui/DatePicker";
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

    const [startTime, setStartTime] = useState(existingBooking?.start_time || "08:00");
    const [endTime, setEndTime] = useState(existingBooking?.end_time || "10:00");

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            client_name: existingBooking?.client_name || "",
            client_phone: existingBooking?.client_phone || "",
            court_id: existingBooking?.court_id || "",
            day_of_week: existingBooking?.day_of_week || "Monday",
            start_date: existingBooking?.start_date || "",
            end_date: existingBooking?.end_date || "",
        }
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const dayMap: Record<string, number> = {
                "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6
            };

            if (existingBooking) {
                // For update, backend only needs end_date, customer_name, customer_phone
                const updatePayload = {
                    end_date: data.end_date,
                    customer_name: data.client_name,
                    customer_phone: data.client_phone || null
                };
                await centerService.updateRecurringBooking(existingBooking.id, updatePayload, venueId);
                addToast("Recurring booking updated", "success");
            } else {
                // For create, backend needs all fields with correct types
                const createPayload = {
                    court_id: data.court_id,
                    day_of_week: dayMap[data.day_of_week] !== undefined ? dayMap[data.day_of_week] : 0,
                    start_time: startTime,
                    end_time: endTime,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    customer_name: data.client_name,
                    customer_phone: data.client_phone || null
                };
                await centerService.createRecurringBooking(createPayload, venueId);
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
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Client Name</label>
                    <input
                        {...register("client_name", { required: "Client name is required" })}
                        className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Academy or Company Name"
                    />
                    {errors.client_name && <p className="text-red-500 text-xs font-bold">{errors.client_name.message as string}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Contact Phone</label>
                    <input
                        {...register("client_phone")}
                        className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="077..."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Court</label>
                <div className="relative">
                    <select
                        {...register("court_id", { required: "Select a court" })}
                        className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                        <option value="">Select Court...</option>
                        {courts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.sport_type?.name})</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
                {errors.court_id && <p className="text-red-500 text-xs font-bold">{errors.court_id.message as string}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Day</label>
                    <select
                        {...register("day_of_week")}
                        className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-2 col-span-1">
                    <TimePicker
                        label="Start Time"
                        value={startTime}
                        onChange={setStartTime}
                    />
                </div>
                <div className="space-y-2 col-span-1">
                    <TimePicker
                        label="End Time"
                        value={endTime}
                        onChange={setEndTime}
                    />
                    {endTime <= startTime && (
                        <p className="text-red-500 text-[10px] font-bold mt-1">End time must be after start time</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <DatePicker
                        label="Start Date"
                        value={watch("start_date") || ""}
                        onChange={(v) => setValue("start_date", v)}
                        placeholder="Start date"
                    />
                </div>
                <div className="space-y-2">
                    <DatePicker
                        label="End Date"
                        value={watch("end_date") || ""}
                        onChange={(v) => setValue("end_date", v)}
                        minDate={watch("start_date") || undefined}
                        placeholder="End date"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting || (!existingBooking && (!watch("court_id") || !watch("start_date") || !watch("end_date") || !watch("client_name") || endTime <= startTime))}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? <CircleNotch size={20} weight="bold" className="animate-spin mx-auto" /> : (existingBooking ? "Update Booking" : "Create Booking")}
            </Button>
        </form>
    );
}
