
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Save, Loader2, MapPin, Phone, Clock, FileText, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { venueApiService } from "@/services/venueApiService";
import { centerService } from "@/services/centerService";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { Venue, VenueProfile } from "@/types";

export default function VenueSettingsPage() {
    const { user } = useAuth();
    const { currentVenue, refreshVenues } = useVenue();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // Detailed profile state for schedule
    const [profile, setProfile] = useState<VenueProfile | null>(null);

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            description: "",
            contact_number: "",
            operating_hours_summary: "", // Summary string
            address: "",
            city: "",
            schedule: [
                { day: "monday", open: "09:00", close: "22:00", is_closed: false },
                { day: "tuesday", open: "09:00", close: "22:00", is_closed: false },
                { day: "wednesday", open: "09:00", close: "22:00", is_closed: false },
                { day: "thursday", open: "09:00", close: "22:00", is_closed: false },
                { day: "friday", open: "09:00", close: "22:00", is_closed: false },
                { day: "saturday", open: "08:00", close: "23:00", is_closed: false },
                { day: "sunday", open: "08:00", close: "23:00", is_closed: false },
            ]
        }
    });

    const { fields: scheduleFields } = useFieldArray({
        control,
        name: "schedule"
    });

    const formatOperatingHoursSummary = (operatingHours: Venue["operating_hours"]) => {
        const openDays = operatingHours.filter((entry) => !entry.is_closed && entry.open_time && entry.close_time);

        if (openDays.length === 0) {
            return "Schedule not available";
        }

        const uniqueRanges = Array.from(new Set(openDays.map((entry) => `${entry.open_time} - ${entry.close_time}`)));
        return uniqueRanges.join(", ");
    };

    useEffect(() => {
        if (currentVenue) {
            // Set basic info from context
            setValue("name", currentVenue.name);
            setValue("description", currentVenue.description ?? "");
            setValue("contact_number", currentVenue.contact_number ?? "");
            setValue("operating_hours_summary", formatOperatingHoursSummary(currentVenue.operating_hours));
            setValue("address", currentVenue.address ?? "");
            setValue("city", currentVenue.city);

            // Fetch detailed profile for schedule
            loadProfile();
        }
    }, [currentVenue, setValue]);

    const loadProfile = async () => {
        if (!currentVenue) return;
        setIsLoadingProfile(true);
        try {
            const data = await centerService.getProfile(currentVenue.id);
            setProfile(data);
            if (data.operating_schedule && data.operating_schedule.length > 0) {
                setValue("schedule", data.operating_schedule);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const onSubmit = async (data: any) => {
        if (!currentVenue) return;
        setIsSubmitting(true);
        try {
            // Update Basic Info
            const basicUpdatePromise = venueApiService.updateVenue(currentVenue.id, {
                name: data.name,
                description: data.description,
                contact_number: data.contact_number,
                address: data.address,
                city: data.city
            });

            // Update Schedule
            const scheduleUpdatePromise = centerService.updateSchedule(currentVenue.id, data.schedule);

            await Promise.all([basicUpdatePromise, scheduleUpdatePromise]);

            addToast("Venue settings and schedule updated successfully", "success");
            refreshVenues();
        } catch (error) {
            console.error(error);
            addToast("Failed to update settings", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="min-h-screen bg-black pt-24 pb-12 px-4 flex items-center justify-center text-zinc-500">
                Please select a venue to edit settings.
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Venue Settings</h1>
                    <p className="text-zinc-400">Update your venue information, contact details, and operating hours.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                        {/* Basic Info */}
                        <div className="space-y-4 mb-8">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <FileText className="w-5 h-5 text-emerald-500" /> Basic Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Venue Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="e.g. Arena Sports Complex"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">City</label>
                                    <input
                                        {...register("city", { required: "City is required" })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="e.g. Colombo"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Tell players about your venue..."
                                />
                            </div>
                        </div>

                        {/* Contact & Location */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
                                <MapPin className="w-5 h-5 text-blue-500" /> Location & Contact
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Contact Number
                                    </label>
                                    <input
                                        {...register("contact_number", { required: "Contact number is required" })}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="+94 77..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Operating Hours (Summary)
                                    </label>
                                    <input
                                        {...register("operating_hours_summary")}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="e.g. 6:00 AM - 10:00 PM"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Address</label>
                                <textarea
                                    {...register("address", { required: "Address is required" })}
                                    rows={2}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Full street address..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-500" /> Weekly Schedule
                            </h2>
                            {isLoadingProfile && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
                        </div>

                        <div className="space-y-4">
                            {scheduleFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-4 items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                                    <div className="col-span-3">
                                        <span className="text-sm font-bold text-white capitalize">{field.day}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="time"
                                            {...register(`schedule.${index}.open`)}
                                            disabled={field.is_closed}
                                            className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="col-span-1 text-center text-zinc-500">-</div>
                                    <div className="col-span-3">
                                        <input
                                            type="time"
                                            {...register(`schedule.${index}.close`)}
                                            disabled={field.is_closed}
                                            className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register(`schedule.${index}.is_closed`)}
                                                className="w-4 h-4 rounded border-zinc-600 text-red-500 focus:ring-red-500 accent-red-500"
                                            />
                                            <span className="text-xs font-medium text-zinc-400">Closed</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end sticky bottom-4 z-20">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-xl"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save All Changes
                        </Button>
                    </div>

                </form>
            </div>
        </main>
    );
}
