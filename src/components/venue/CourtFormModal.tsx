
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { venueService } from "@/services/venueService";
import { Court } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface CourtFormModalProps {
    venueId: string;
    existingCourt?: Court | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CourtFormModal({ venueId, existingCourt, onClose, onSuccess }: CourtFormModalProps) {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: existingCourt?.name || "",
            description: existingCourt?.description || "",
            sport_type: existingCourt?.sport_type || "Futsal",
            surface_type: existingCourt?.surface_type || "Turf",
            is_indoor: existingCourt?.is_indoor || false,
            hourly_rate: existingCourt?.hourly_rate || 1500,
            capacity: existingCourt?.capacity || 10,
        }
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (existingCourt) {
                await venueService.updateCourt(existingCourt.id, data);
                addToast("Court updated successfully", "success");
            } else {
                await venueService.createCourt(venueId, data);
                addToast("Court created successfully", "success");
            }
            onSuccess();
        } catch (error) {
            addToast("Failed to save court", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sports = ["Futsal", "Swimming", "Badminton", "Basketball", "Tennis", "Cricket", "Squash", "Table Tennis"];
    const surfaces = ["Turf", "Synthetic", "Wood", "Concrete", "Clay", "Grass", "Mat", "Parquet", "Sand", "Carpet"];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Court Name</label>
                <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Ex: Pitch 1"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Sport</label>
                    <select
                        {...register("sport_type")}
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                        {sports.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Surface</label>
                    <select
                        {...register("surface_type")}
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                    >
                        {surfaces.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Hourly Rate (LKR)</label>
                    <input
                        type="number"
                        {...register("hourly_rate", { required: true, min: 0 })}
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Capacity (Players)</label>
                    <input
                        type="number"
                        {...register("capacity", { required: true, min: 1 })}
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Dimensions, special features..."
                />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-700 bg-black/30 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input
                    type="checkbox"
                    {...register("is_indoor")}
                    id="is_indoor"
                    className="w-4 h-4 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black accent-emerald-500"
                />
                <label htmlFor="is_indoor" className="text-sm font-medium text-white cursor-pointer select-none">Indoor Court?</label>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold mt-2"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (existingCourt ? "Update Court" : "Create Court")}
            </Button>
        </form>
    );
}
