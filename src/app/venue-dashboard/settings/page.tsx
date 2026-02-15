
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, Loader2, Image as ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { Venue } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function VenueSettingsPage() {
    const { user, isVenueOwner, isVenueManager } = useAuth();
    const { addToast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        if (user && (isVenueOwner || isVenueManager)) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) setSelectedVenueId(data[0].id);
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedVenueId && venues.length > 0) {
            setIsLoading(true);
            const venue = venues.find(v => v.id === selectedVenueId);
            if (venue) {
                setValue("name", venue.name);
                setValue("description", venue.description);
                setValue("contact_number", venue.contact_number);
                setValue("operating_hours", venue.operating_hours);
                setValue("address", venue.address);
            }
            setIsLoading(false);
        }
    }, [selectedVenueId, venues, setValue]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            // Mock update
            addToast("Venue settings updated", "success");
        } catch (error) {
            addToast("Failed to update settings", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-3xl">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Venue Settings</h1>
                    {venues.length > 1 && (
                        <select
                            value={selectedVenueId}
                            onChange={(e) => setSelectedVenueId(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    )}
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>
                ) : (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Venue Name</label>
                                <input
                                    {...register("name", { required: "Name is required" })}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Contact Number</label>
                                    <input
                                        {...register("contact_number")}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase">Operating Hours</label>
                                    <input
                                        {...register("operating_hours")}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Address</label>
                                <textarea
                                    {...register("address")}
                                    rows={2}
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-zinc-800">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </div>

                        </form>
                    </div>
                )}

            </div>
        </main>
    );
}
