
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Building2, MapPin, Loader2, Info, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { venueApiService } from "@/services/venueApiService";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/services/authContext";
import { useVenue } from "@/components/venue/VenueContext";
import { Venue } from "@/types";

type Step = "details" | "location";

export default function EditVenuePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { currentVenue, refreshVenues } = useVenue();
    const { addToast } = useToast();
    const [step, setStep] = useState<Step>("details");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            description: "",
            operating_hours_summary: "",
            contact_number: "",
            contact_email: "",
            city: "",
            address: "",
        }
    });

    const formatOperatingHoursSummary = (operatingHours: Venue["operating_hours"]) => {
        const openDays = operatingHours.filter((entry) => !entry.is_closed && entry.open_time && entry.close_time);
        if (openDays.length === 0) return "Schedule not available";
        const uniqueRanges = Array.from(new Set(openDays.map((entry) => `${entry.open_time} - ${entry.close_time}`)));
        return uniqueRanges.join(", ");
    };

    useEffect(() => {
        if (currentVenue) {
            setValue("name", currentVenue.name);
            setValue("description", currentVenue.description ?? "");
            setValue("operating_hours_summary", formatOperatingHoursSummary(currentVenue.operating_hours));
            setValue("contact_number", currentVenue.phone_contact ?? "");
            setValue("contact_email", user?.email || "");
            setValue("city", currentVenue.city);
            setValue("address", currentVenue.address ?? "");
            setIsLoading(false);
        } else {
            const timer = setTimeout(() => { if (!currentVenue) setIsLoading(false); }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentVenue, setValue, user]);

    const onSubmit = async (data: any) => {
        if (!currentVenue) return;
        setIsSubmitting(true);
        try {
            const { operating_hours_summary, contact_email, ...venueData } = data;
            await venueApiService.updateVenue(currentVenue.id, {
                ...venueData,
                phone_contact: venueData.contact_number,
            });
            addToast("Venue updated successfully!", "success");
            await refreshVenues();
            setTimeout(() => router.push("/venue-dashboard"), 1000);
        } catch (error) {
            console.error(error);
            addToast("Failed to update venue", "error");
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    if (isLoading) {
        return (
            <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="w-full max-w-2xl space-y-6 animate-pulse">
                    <div className="h-8 w-48 rounded-lg bg-surface-raised" />
                    <div className="rounded-2xl bg-surface-raised border border-default/30 p-8 space-y-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="space-y-2">
                                <div className="h-3 w-24 rounded bg-surface-overlay" />
                                <div className="h-11 rounded-xl bg-surface-overlay/60" />
                            </div>
                        ))}
                        <div className="h-10 w-full rounded-xl bg-surface-overlay mt-4" />
                    </div>
                </div>
            </main>
        );
    }

    if (!currentVenue) {
        return (
            <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 flex items-center justify-center text-muted">
                Please select a venue to edit.
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-2xl relative z-10">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary mb-2">Edit Venue Details</h1>
                    <p className="text-secondary">Step {step === "details" ? 1 : 2} of 2</p>

                    {/* Progress Bar (2 steps) */}
                    <div className="flex gap-2 mt-6 justify-center">
                        <div className={`h-1.5 w-24 rounded-full transition-colors duration-300 ${step === "details" || step === "location" ? "bg-emerald-500" : "bg-surface-overlay"}`} />
                        <div className={`h-1.5 w-24 rounded-full transition-colors duration-300 ${step === "location" ? "bg-emerald-500" : "bg-surface-overlay"}`} />
                    </div>
                </div>

                <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Step 1: Basic Details */}
                        {step === "details" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-default">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Building2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-primary">Venue Details</h2>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Venue Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="Ex: City Sports Arena"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Description</label>
                                    <textarea
                                        {...register("description")}
                                        rows={3}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Tell players about your facilities..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Contact Number</label>
                                        <input
                                            {...register("contact_number", { required: true })}
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Contact Email</label>
                                        <input
                                            {...register("contact_email")}
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Operating Hours (Summary)</label>
                                    <input
                                        {...register("operating_hours_summary")}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors opacity-60"
                                        placeholder="Ex: 06:00 - 23:00"
                                        readOnly
                                    />
                                    <p className="text-faint text-xs">Manage schedule in Settings → Schedule</p>
                                </div>

                                <Button type="button" onClick={() => setStep("location")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    Next: Location <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Location & Save */}
                        {step === "location" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-default">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <MapPin className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-primary">Location</h2>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">City</label>
                                    <input
                                        {...register("city", { required: "City is required" })}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="Ex: Colombo"
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Full Address</label>
                                    <textarea
                                        {...register("address", { required: "Address is required" })}
                                        rows={3}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Street, Area, etc."
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>}
                                </div>

                                <div className="bg-blue-500/10 p-4 rounded-xl flex gap-3 items-start border border-blue-500/20">
                                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-200/80 leading-relaxed">
                                        <span className="font-bold text-blue-400 block mb-1">Map Coordinates</span>
                                        Coordinates (Lat/Lng) are managed automatically.
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setStep("details")} className="flex-1 h-12 text-secondary hover:text-primary">
                                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </main>
    );
}
