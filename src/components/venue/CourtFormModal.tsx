
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { venueApiService } from "@/services/venueApiService";
import { centerService } from "@/services/centerService";
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
            sport_type: existingCourt?.sport_type?.name || "Futsal",
            is_indoor: existingCourt?.is_indoor || false,
            hourly_rate: existingCourt?.hourly_rate || 1500,
            imageFile: undefined as unknown as FileList
        }
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const { imageFile, ...payload } = data;
            let courtId = existingCourt?.id;

            if (existingCourt) {
                await venueApiService.updateCourt(venueId, existingCourt.id, payload);
                addToast("Court updated successfully", "success");
            } else {
                const newCourt = await venueApiService.addCourt(venueId, payload);
                courtId = newCourt?.id || (newCourt as any)?.data?.id || (newCourt as any)?._id;
                addToast("Court created successfully", "success");
            }

            if (imageFile && imageFile.length > 0 && courtId) {
                try {
                    await centerService.uploadCourtImage(courtId, imageFile[0]);
                    addToast("Court image uploaded successfully", "success");
                } catch (imgErr) {
                    console.error(imgErr);
                    addToast("Court saved but image upload failed", "error");
                }
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            addToast("Failed to save court", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sports = ["Futsal", "Swimming", "Badminton", "Basketball", "Tennis", "Cricket", "Squash", "Table Tennis"];
    const surfaces = ["Turf", "Synthetic", "Wood", "Concrete", "Clay", "Grass", "Mat", "Parquet", "Sand", "Carpet"];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Court Name</label>
                <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Ex: Pitch 1"
                />
                {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message as string}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sport</label>
                    <div className="relative">
                        <select
                            {...register("sport_type")}
                            className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                        >
                            {sports.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Hourly Rate (LKR)</label>
                    <input
                        type="number"
                        {...register("hourly_rate", { required: true, min: 0 })}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cover Image</label>
                <div className="relative group">
                    <input
                        type="file"
                        accept="image/*"
                        {...register("imageFile")}
                        className="w-full bg-black/40 border border-zinc-700 border-dashed hover:border-emerald-500/50 rounded-xl px-4 py-6 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 cursor-pointer transition-colors"
                    />
                </div>
            </div>


            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Dimensions, special features..."
                />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-700 bg-black/30 cursor-pointer hover:border-emerald-500/50 transition-colors group">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        {...register("is_indoor")}
                        id="is_indoor"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-600 bg-black/50 transition-all checked:border-emerald-500 checked:bg-emerald-500"
                    />
                    <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 transition-opacity peer-checked:opacity-100"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <label htmlFor="is_indoor" className="text-sm font-bold text-white cursor-pointer select-none group-hover:text-emerald-400 transition-colors">Indoor Court?</label>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl mt-4"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (existingCourt ? "Update Court" : "Create Court")}
            </Button>
        </form>
    );
}
