
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Building2, MapPin, Loader2, Info, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { venueApiService } from "@/services/venueApiService";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/services/authContext";
import { useVenue } from "@/components/venue/VenueContext";

type Step = "details" | "location" | "amenities";

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
            operating_hours: "",
            contact_number: "",
            contact_email: "",
            city: "",
            address: "",
            amenities: [] as string[]
        }
    });

    const amenitiesList = ["Parking", "A/C", "Showers", "Equipment Rental", "Cafe", "WiFi", "Lockers", "First Aid"];

    useEffect(() => {
        if (currentVenue) {
            setValue("name", currentVenue.name);
            setValue("description", currentVenue.description);
            setValue("operating_hours", currentVenue.operating_hours);
            setValue("contact_number", currentVenue.contact_number);
            setValue("contact_email", user?.email || ""); // Venue object doesn't have email usually, using user's or empty
            setValue("city", currentVenue.city);
            setValue("address", currentVenue.address);
            setValue("amenities", currentVenue.amenities || []);
            setIsLoading(false);
        } else {
            // If accessed directly without context loaded, might need to wait or redirect
            const timer = setTimeout(() => {
                if (!currentVenue) setIsLoading(false); // Stop loading to show error/empty state
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentVenue, setValue, user]);

    const onSubmit = async (data: any) => {
        if (!currentVenue) return;
        setIsSubmitting(true);
        try {
            await venueApiService.updateVenue(currentVenue.id, {
                ...data,
                location: data.city, // Backward compatibility
            });
            addToast("Venue updated successfully!", "success");

            await refreshVenues();

            // Redirect to dashboard
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
            <main className="min-h-screen bg-black pt-24 pb-12 px-4 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </main>
        );
    }

    if (!currentVenue) {
        return (
            <main className="min-h-screen bg-black pt-24 pb-12 px-4 flex items-center justify-center text-zinc-500">
                Please select a venue to edit.
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-2xl relative z-10">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Edit Venue Details</h1>
                    <p className="text-zinc-400">Step {step === "details" ? 1 : step === "location" ? 2 : 3} of 3</p>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-6 justify-center">
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "details" || step === "location" || step === "amenities" ? "bg-emerald-500" : "bg-zinc-800"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "location" || step === "amenities" ? "bg-emerald-500" : "bg-zinc-800"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "amenities" ? "bg-emerald-500" : "bg-zinc-800"}`} />
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">

                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Step 1: Basic Details */}
                        {step === "details" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Building2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Venue Details</h2>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Venue Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="Ex: City Sports Arena"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                                    <textarea
                                        {...register("description")}
                                        rows={3}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Tell players about your facilities..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact Number</label>
                                        <input
                                            {...register("contact_number", { required: true })}
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact Email</label>
                                        <input
                                            {...register("contact_email", { required: true })}
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Operating Hours (Summary)</label>
                                    <input
                                        {...register("operating_hours")}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="Ex: 06:00 - 23:00"
                                    />
                                </div>

                                <Button type="button" onClick={() => setStep("location")} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    Next: Location <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {step === "location" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <MapPin className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Location</h2>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">City</label>
                                    <input
                                        {...register("city", { required: "City is required" })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="Ex: Colombo"
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Address</label>
                                    <textarea
                                        {...register("address", { required: "Address is required" })}
                                        rows={3}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
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
                                    <Button type="button" variant="ghost" onClick={() => setStep("details")} className="flex-1 h-12 text-zinc-400 hover:text-white">
                                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                    </Button>
                                    <Button type="button" onClick={() => setStep("amenities")} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        Next: Amenities <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Amenities & Submit */}
                        {step === "amenities" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Facilities</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {amenitiesList.map((amenity) => (
                                        <label key={amenity} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-black/40 cursor-pointer hover:border-emerald-500/50 hover:bg-zinc-900 transition-all group">
                                            <input
                                                type="checkbox"
                                                value={amenity}
                                                {...register("amenities")}
                                                className="w-4 h-4 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black accent-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{amenity}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-zinc-800 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setStep("location")} className="flex-1 h-12 text-zinc-400 hover:text-white">
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
