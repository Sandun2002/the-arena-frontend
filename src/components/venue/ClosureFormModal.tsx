
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
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

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            title: "",
            start_date: "",
            end_date: "",
            reason: "",
            type: "maintenance",
            courts: [] as string[] // Array of court IDs
        }
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await centerService.createClosure({
                venue_id: venueId,
                title: data.title,
                start_date: data.start_date,
                end_date: data.end_date,
                reason: data.reason,
                type: data.type,
                courts: data.courts
            });
            addToast("Closure scheduled successfully", "success");
            onSuccess();
        } catch (error) {
            console.error(error);
            addToast("Failed to schedule closure", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</label>
                <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Ex: Pitch Maintenance"
                />
                {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title.message as string}</p>}
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

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</label>
                <select
                    {...register("type")}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                >
                    <option value="maintenance">Maintenance</option>
                    <option value="holiday">Holiday</option>
                    <option value="weather">Weather</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Affected Courts</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                    {courts.map(court => (
                        <div key={court.id} className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                            <input
                                type="checkbox"
                                value={court.id}
                                {...register("courts")}
                                className="w-4 h-4 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 bg-black/50"
                            />
                            <span className="text-sm text-zinc-300 truncate">{court.name}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-zinc-500">Leave unselected to close entire venue (optional logic depends on backend)</p>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Reason</label>
                <textarea
                    {...register("reason")}
                    rows={2}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Details about the closure..."
                />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl mt-4"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Schedule Closure"}
            </Button>
        </form>
    );
}
