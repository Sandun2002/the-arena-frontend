
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Building2, MapPin, Loader2, Info, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { venueApiService } from "@/services/venueApiService";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/services/authContext";
import { useVenue } from "@/components/venue/VenueContext";
import Script from "next/script";
import { api } from "@/services/api";
import { City } from "@/types";
import { useRef, useEffect } from "react";

type Step = "details" | "location" | "amenities" | "document";

export default function CreateVenuePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { refreshVenues } = useVenue();
    const { addToast } = useToast();
    const [step, setStep] = useState<Step>("details");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [brDocument, setBrDocument] = useState<File | null>(null);
    const [geoLat, setGeoLat] = useState<number | null>(null);
    const [geoLng, setGeoLng] = useState<number | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [mounted, setMounted] = useState(false);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
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

    const initAutocomplete = () => {
        if (!(window as any).google || !searchInputRef.current) return;

        const autocomplete = new (window as any).google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'lk' }
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) return;

            setGeoLat(place.geometry.location.lat());
            setGeoLng(place.geometry.location.lng());
            setValue("address", place.formatted_address || "");

            const cityComp = place.address_components?.find((c: any) => 
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            );
            if (cityComp) {
                setValue("city", cityComp.long_name);
            }
        });
    };

    useEffect(() => {
        if (mapLoaded && step === "location" && searchInputRef.current) {
            initAutocomplete();
        }
    }, [mapLoaded, step]);

    useEffect(() => {
        setMounted(true);
        const fetchCities = async () => {
            setIsLoadingCities(true);
            try {
                const cities = await api.getCities();
                setAvailableCities(cities);
            } catch (error) {
                console.error("Failed to fetch cities", error);
            } finally {
                setIsLoadingCities(false);
            }
        };
        fetchCities();
    }, []);

    const onSubmit = async (data: any) => {
        if (!brDocument) {
            addToast("Business Registration document is required.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload the BR document first
            const uploadRes = await venueApiService.uploadBRDocument(brDocument);
            const brDocumentUrl = uploadRes.url;

            // 2. Create the venue with the returned document URL
            await venueApiService.createVenue({
                ...data,
                sport: "generic", // Default for now, could be added to form
                location: data.city, // Backward compatibility
                owner_id: user?.id,
                br_document_url: brDocumentUrl,
                geo_lat: geoLat,
                geo_lng: geoLng
            });
            addToast("Venue created successfully! Waiting for admin verification.", "success");

            // Refresh venues list in context so the new venue appears immediately
            refreshVenues();

            // Redirect to dashboard
            setTimeout(() => router.push("/venue-dashboard"), 1000);
        } catch (error) {
            console.error(error);
            addToast("Failed to create venue", "error");
            setIsSubmitting(false);
        }
    };

    if (!mounted || !user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-2xl relative z-10">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Register Your Venue</h1>
                    <p className="text-zinc-400">Step {step === "details" ? 1 : step === "location" ? 2 : step === "amenities" ? 3 : 4} of 4</p>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-6 justify-center">
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "details" || step === "location" || step === "amenities" || step === "document" ? "bg-emerald-500" : "bg-zinc-800"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "location" || step === "amenities" || step === "document" ? "bg-emerald-500" : "bg-zinc-800"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "amenities" || step === "document" ? "bg-emerald-500" : "bg-zinc-800"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "document" ? "bg-emerald-500" : "bg-zinc-800"}`} />
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
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Operating Hours</label>
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
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Search on Google Maps</label>
                                    <input
                                        ref={searchInputRef}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="Search for address..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">City</label>
                                        <select
                                            {...register("city", { required: "City is required" })}
                                            className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                                        >
                                            <option value="" disabled>Select a city</option>
                                            {availableCities.map((city) => (
                                                <option key={city.name} value={city.name}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message as string}</p>}
                                        {isLoadingCities && <p className="text-zinc-500 text-[10px] mt-1 animate-pulse">Loading cities...</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Coordinates</label>
                                        <div className="h-12 bg-black/30 border border-zinc-800 rounded-xl px-4 flex items-center text-xs text-zinc-500 italic">
                                            {geoLat ? `${geoLat.toFixed(4)}, ${geoLng?.toFixed(4)}` : "Auto-detected from search"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Address</label>
                                    <textarea
                                        {...register("address", { required: "Address is required" })}
                                        rows={1}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Street, Area, etc."
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>}
                                </div>

                                <div className="bg-blue-500/10 p-4 rounded-xl flex gap-3 items-start border border-blue-500/20">
                                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-200/80 leading-relaxed">
                                        <span className="font-bold text-blue-400 block mb-1">Interactive Setup</span>
                                        Find your venue on the map above to automatically sync coordinates. This ensures better visibility in "Near Me" searches.
                                    </div>
                                </div>

                                <Script 
                                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                                    onLoad={() => setMapLoaded(true)}
                                />

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
                                    <Button type="button" onClick={() => setStep("document")} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        Next: Verification <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Document Upload & Submit */}
                        {step === "document" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Info className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Verification</h2>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-white block">Business Registration Document (PDF)</label>
                                    <p className="text-xs text-zinc-400">Please upload your official business registration. Only PDF format up to 5MB is allowed. This is strictly required to verify your venue ownership.</p>

                                    <div className="relative group mt-2">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setBrDocument(e.target.files[0]);
                                                }
                                            }}
                                            className="w-full text-sm text-zinc-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 cursor-pointer"
                                        />
                                    </div>

                                    {brDocument && (
                                        <div className="bg-emerald-500/10 text-emerald-500 text-sm px-4 py-2 rounded-xl inline-flex items-center border border-emerald-500/20">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            "{brDocument.name}" ready to upload
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-zinc-800 mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setStep("amenities")} className="flex-1 h-12 text-zinc-400 hover:text-white">
                                        <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !brDocument}
                                        className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none"
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
