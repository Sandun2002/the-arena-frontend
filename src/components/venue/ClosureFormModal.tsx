"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { CircleNotch, Calendar, MapPin, Clock } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import { centerService } from "@/services/centerService";
import { Court } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface ClosureFormModalProps {
    venueId: string;
    courts: Court[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function ClosureFormModal({ venueId, courts, onClose, onSuccess }: ClosureFormModalProps) {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [closureLevel, setClosureLevel] = useState<"venue" | "court">("venue");
    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
    const today = format(new Date(), "yyyy-MM-dd");

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            title: "",
            start_date: "",
            end_date: "",
            date: format(new Date(), "yyyy-MM-dd"), // for court closure
            reason: "",
            court_id: courts.length > 0 ? courts[0].id : ""
        }
    });

    const toggleSlot = (hour: number) => {
        if (selectedSlots.includes(hour)) {
            setSelectedSlots(selectedSlots.filter(h => h !== hour));
        } else {
            setSelectedSlots([...selectedSlots, hour].sort((a, b) => a - b));
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (closureLevel === "venue") {
                await centerService.createClosure({
                    closure_date: data.start_date,
                    ...(data.end_date ? { end_date: data.end_date } : {}),
                    reason: [data.title, data.reason].filter(Boolean).join(" — ") || "Venue Closed",
                }, venueId);
            } else {
                if (selectedSlots.length === 0) {
                    addToast("Please select at least one time slot", "error");
                    setIsSubmitting(false);
                    return;
                }

                if (data.date < today) {
                    addToast("Court closure date cannot be in the past", "error");
                    setIsSubmitting(false);
                    return;
                }

                const existingClosures = await centerService.getClosures(venueId);
                const hasVenueClosure = existingClosures.some((closure: any) => {
                    const closureDate = String(closure?.closure_date || "").slice(0, 10);
                    return closureDate === data.date;
                });
                if (hasVenueClosure) {
                    addToast("Venue is already closed on this date. Pick another date or remove the venue closure.", "error");
                    setIsSubmitting(false);
                    return;
                }

                // Create blocks sequentially to surface the first exact slot failure.
                // Explicitly use Asia/Colombo (+05:30) so times are correct regardless of browser timezone.
                const VENUE_TZ = "+05:30";
                for (const hour of selectedSlots) {
                    const start = new Date(`${data.date}T${hour.toString().padStart(2, '0')}:00:00${VENUE_TZ}`);
                    const end = new Date(start);
                    end.setHours(start.getHours() + 1);

                    await centerService.createManualBooking({
                        court_id: data.court_id,
                        start_time: start.toISOString(),
                        end_time: end.toISOString(),
                        is_blocked: true,
                        block_reason: data.reason || "Court Maintenance",
                        payment_method: "cash"
                    }, venueId);
                }
            }
            addToast("Closure scheduled successfully", "success");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            const detail = error?.response?.data?.detail;
            addToast(detail || "Failed to schedule closure", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="space-y-6">
            {/* Toggle Level */}
            <div className="flex bg-surface-base/40 border border-default rounded-xl p-1 relative">
                <button
                    onClick={() => setClosureLevel("venue")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${closureLevel === "venue" ? "text-primary" : "text-muted hover:text-secondary"}`}
                >
                    <MapPin size={16} weight="bold" /> Venue
                </button>
                <button
                    onClick={() => setClosureLevel("court")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all relative z-10 ${closureLevel === "court" ? "text-primary" : "text-muted hover:text-secondary"}`}
                >
                    <Clock size={16} weight="bold" /> Court
                </button>
                <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface-overlay rounded-lg transition-transform duration-300 ${closureLevel === "venue" ? "translate-x-0" : "translate-x-full left-1"}`}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {closureLevel === "venue" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider">Closure Title</label>
                            <input
                                {...register("title")}
                                className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                placeholder="Ex: Pitch Maintenance"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <DatePicker
                                    label="Start Date"
                                    value={watch("start_date") || ""}
                                    onChange={(v) => setValue("start_date", v)}
                                    disablePast={true}
                                    placeholder="Start date"
                                />
                            </div>
                            <div className="space-y-2">
                                <DatePicker
                                    label="End Date"
                                    value={watch("end_date") || ""}
                                    onChange={(v) => setValue("end_date", v)}
                                    disablePast={true}
                                    minDate={watch("start_date") || undefined}
                                    placeholder="End date"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {closureLevel === "court" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Select Court</label>
                                <select
                                    {...register("court_id", { required: "Court is required" })}
                                    className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                                >
                                    {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <DatePicker
                                    label="Date"
                                    value={watch("date") || ""}
                                    onChange={(v) => setValue("date", v)}
                                    disablePast={true}
                                    placeholder="Select date"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider flex justify-between">
                                <span>Select Time Slots</span>
                                <span className="text-emerald-500">{selectedSlots.length} selected</span>
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                {hours.map(hour => {
                                    const now = new Date();
                                    const venueNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
                                    const isTodaySelected = watch("date") === today;
                                    const isPastHour = isTodaySelected && hour <= venueNow.getHours();
                                    const isSelected = selectedSlots.includes(hour);
                                    const timeStr = format(new Date().setHours(hour, 0, 0, 0), "h a");
                                    return (
                                        <button
                                            key={hour}
                                            type="button"
                                            disabled={isPastHour}
                                            onClick={() => toggleSlot(hour)}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all border
                                                ${isPastHour
                                                    ? 'bg-surface-raised/40 text-faint border-default cursor-not-allowed'
                                                    : ''}
                                                ${isSelected
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50'
                                                    : 'bg-surface-base/40 text-secondary border-default hover:border-subtle'}
                                            `}
                                        >
                                            {timeStr}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2 mt-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Reason</label>
                    <textarea
                        {...register("reason")}
                        rows={2}
                        className="w-full bg-surface-base/40 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                        placeholder="Details about the closure..."
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-primary font-bold rounded-xl mt-4 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                    {isSubmitting ? <CircleNotch size={20} weight="bold" className="animate-spin mx-auto" /> : "Confirm Closure"}
                </Button>
            </form>
        </div>
    );
}
