
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Building2, MapPin, Loader2, ArrowRight, CheckCircle, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { venueService } from "@/services/venueService";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/services/authContext";

type Step = "details" | "location" | "amenities";

export default function CreateVenuePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [step, setStep] = useState<Step>("details");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            description: "",
            operating_hours: "06:00 - 23:00",
            contact_number: user?.phone_number || "",
            contact_email: user?.email || "",
            city: "",
            address: "",
            amenities: [] as string[]
        }
    });

    const amenitiesList = ["Parking", "A/C", "Showers", "Equipment Rental", "Cafe", "WiFi", "Lockers", "First Aid"];

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await venueService.createVenue(data);
            addToast("Venue created successfully!", "success");
            // Redirect to dashboard
            setTimeout(() => router.push("/venue-dashboard"), 1000);
        } catch (error) {
            addToast("Failed to create venue", "error");
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-2xl">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Register Your Venue</h1>
                    <p className="text-zinc-400">Step {step === "details" ? 1 : step === "location" ? 2 : 3} of 3</p>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-4 justify-center">
                        <div className={`h-1 w-12 rounded-full ${step === "details" || step === "location" || step === "amenities" ? "bg-blue-500" : "bg-zinc-800"}`} />
                        <div className={`h-1 w-12 rounded-full ${step === "location" || step === "amenities" ? "bg-blue-500" : "bg-zinc-800"}`} />
                        <div className={`h-1 w-12 rounded-full ${step === "amenities" ? "bg-blue-500" : "bg-zinc-800"}`} />
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">

                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Step 1: Basic Details */}
                        {step === "details" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Building2 className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Venue Details</h2>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Venue Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Ex: City Sports Arena"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                    <textarea
                                        {...register("description")}
                                        rows={3}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Tell players about your facilities..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Contact Number</label>
                                        <input
                                            {...register("contact_number", { required: true })}
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase">Contact Email</label>
                                        <input
                                            {...register("contact_email", { required: true })}
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Operating Hours</label>
                                    <input
                                        {...register("operating_hours")}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Ex: 06:00 - 23:00"
                                    />
                                </div>

                                <Button type="button" onClick={() => setStep("location")} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
                                    Next: Location
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {step === "location" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <MapPin className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Location</h2>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">City</label>
                                    <input
                                        {...register("city", { required: "City is required" })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Ex: Colombo"
                                    />
                                    {errors.city && <p className="text-red-500 text-xs">{errors.city.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Full Address</label>
                                    <textarea
                                        {...register("address", { required: "Address is required" })}
                                        rows={3}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Street, Area, etc."
                                    />
                                    {errors.address && <p className="text-red-500 text-xs">{errors.address.message as string}</p>}
                                </div>

                                <div className="bg-blue-500/10 p-4 rounded-xl flex gap-3 items-start border border-blue-500/20">
                                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-200/80">
                                        <span className="font-bold text-blue-400 block mb-1">Map Coordinates</span>
                                        Coordinates (Lat/Lng) will be automatically detected from the address or can be refined later in settings.
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setStep("details")} className="flex-1">Back</Button>
                                    <Button type="button" onClick={() => setStep("amenities")} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold">
                                        Next: Amenities
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Amenities & Submit */}
                        {step === "amenities" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Facilities</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {amenitiesList.map((amenity) => (
                                        <label key={amenity} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-700 bg-black/30 cursor-pointer hover:border-blue-500/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                value={amenity}
                                                {...register("amenities")}
                                                className="w-4 h-4 rounded border-zinc-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-black accent-blue-500"
                                            />
                                            <span className="text-sm font-medium text-white">{amenity}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-zinc-800 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setStep("location")} className="flex-1">Back</Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Complete Registration"}
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
