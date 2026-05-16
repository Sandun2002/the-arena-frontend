
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Buildings, MapPin, CircleNotch, Info, CheckCircle, ArrowRight, ArrowLeft, Link, ArrowSquareOut } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import TimePicker from "@/components/ui/TimePicker";
import { venueApiService } from "@/services/venueApiService";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/services/authContext";
import { useVenue } from "@/components/venue/VenueContext";
import { api } from "@/services/api";
import { City } from "@/types";
import CityCombobox from "@/components/ui/CityCombobox";

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
    const [mapsLink, setMapsLink] = useState("");
    const [mapsLinkError, setMapsLinkError] = useState<string | null>(null);
    const [isResolvingMapLink, setIsResolvingMapLink] = useState(false);
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            description: "",
            opening_time: "06:00",
            closing_time: "23:00",
            contact_number: user?.phone_number || "",
            contact_email: user?.email || "",
            city: "",
            address: "",
            amenities: [] as string[]
        }
    });

    const openingTime = watch("opening_time");
    const closingTime = watch("closing_time");

    const amenitiesList = ["Parking", "A/C", "Showers", "Equipment Rental", "Cafe", "WiFi", "Lockers", "First Aid"];

    const extractCoords = (url: string): [number, number] | null => {
        // Pattern 1: /@LAT,LNG (most common when sharing from Maps)
        const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];

        // Pattern 2: ?q=LAT,LNG or &q=LAT,LNG
        const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qMatch) return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];

        // Pattern 3: /place/LAT,LNG
        const placeMatch = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (placeMatch) return [parseFloat(placeMatch[1]), parseFloat(placeMatch[2])];

        // Pattern 4: !3dLAT!4dLNG (embedded/iframe format)
        const embedMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (embedMatch) return [parseFloat(embedMatch[1]), parseFloat(embedMatch[2])];

        // Pattern 5: /search/LAT,LNG — with optional space/+ between coords
        const searchMatch = url.match(/\/search\/(-?\d+\.\d+)[,\s%20+]+(-?\d+\.\d+)/);
        if (searchMatch) return [parseFloat(searchMatch[1]), parseFloat(searchMatch[2])];

        return null;
    };

    const parseGoogleMapsLink = async (url: string) => {
        setMapsLink(url);
        setMapsLinkError(null);
        setGeoLat(null);
        setGeoLng(null);

        if (!url.trim()) return;

        // Validate it's a Google Maps URL
        if (!url.match(/google\.com\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps/i)) {
            setMapsLinkError("Please paste a valid Google Maps link.");
            return;
        }

        // Short links: resolve server-side then re-parse
        if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url)) {
            setIsResolvingMapLink(true);
            try {
                const res = await fetch("/api/resolve-maps-link", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                });
                const data = await res.json();
                if (!res.ok || !data.expandedUrl) {
                    setMapsLinkError("Could not resolve this short link. Try using the full Google Maps share link instead.");
                    return;
                }
                const coords = extractCoords(data.expandedUrl);
                if (coords) {
                    setGeoLat(coords[0]);
                    setGeoLng(coords[1]);
                } else {
                    setMapsLinkError("Link resolved but coordinates couldn't be extracted. Try the full Google Maps link instead.");
                }
            } catch {
                setMapsLinkError("Network error while resolving link. Please try the full Google Maps link instead.");
            } finally {
                setIsResolvingMapLink(false);
            }
            return;
        }

        // Try all regex patterns on the long-form URL
        const coords = extractCoords(url);
        if (coords) {
            setGeoLat(coords[0]);
            setGeoLng(coords[1]);
        } else {
            setMapsLinkError("Could not extract coordinates. Try right-clicking the exact location on Google Maps and selecting \"Copy link\".");
        }
    };

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
            // Normalize amenities: react-hook-form checkbox register() returns
            // `false` when none are checked, or a bare string when only one is
            // checked. The backend expects a string array (List[str]).
            const amenities = Array.isArray(data.amenities)
                ? data.amenities
                : data.amenities ? [data.amenities] : [];

            await venueApiService.createVenue({
                name: data.name,
                description: data.description,
                opening_time: data.opening_time,
                closing_time: data.closing_time,
                phone_contact: data.contact_number,
                city: data.city,
                address: data.address,
                amenities,
                br_document_url: brDocumentUrl,
                geo_lat: geoLat,
                geo_lng: geoLng
            });
            addToast("Venue created successfully! Waiting for admin verification.", "success");

            // Refresh venues list in context so the new venue appears immediately
            refreshVenues();

            // Redirect to dashboard
            setTimeout(() => router.push("/venue-dashboard"), 1000);
        } catch (error: any) {
            console.error(error);
            const detail = error?.response?.data?.detail;
            addToast(detail || "Failed to create venue. Please try again.", "error");
            setIsSubmitting(false);
        }
    };

    if (!mounted || !user) return null;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="w-full max-w-2xl relative z-10">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary mb-2">Register Your Venue</h1>
                    <p className="text-secondary">Step {step === "details" ? 1 : step === "location" ? 2 : step === "amenities" ? 3 : 4} of 4</p>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-6 justify-center">
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "details" || step === "location" || step === "amenities" || step === "document" ? "bg-emerald-500" : "bg-surface-overlay"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "location" || step === "amenities" || step === "document" ? "bg-emerald-500" : "bg-surface-overlay"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "amenities" || step === "document" ? "bg-emerald-500" : "bg-surface-overlay"}`} />
                        <div className={`h-1.5 w-16 rounded-full transition-colors duration-300 ${step === "document" ? "bg-emerald-500" : "bg-surface-overlay"}`} />
                    </div>
                </div>

                <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm shadow-2xl">

                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Step 1: Basic Details */}
                        {step === "details" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-default">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Buildings size={24} weight="fill" className="text-emerald-500" />
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
                                            {...register("contact_email", { required: true })}
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider block">Operating Hours</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <TimePicker
                                            label="Opening Time"
                                            value={openingTime || "06:00"}
                                            onChange={(v) => setValue("opening_time" as any, v)}
                                        />
                                        <TimePicker
                                            label="Closing Time"
                                            value={closingTime || "23:00"}
                                            onChange={(v) => setValue("closing_time" as any, v)}
                                        />
                                    </div>
                                    {openingTime === closingTime && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1">Opening and closing times must differ</p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={async () => {
                                        const valid = await trigger(["name", "contact_number", "contact_email"]);
                                        if (valid) setStep("location");
                                    }}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                >
                                    Next: Location <ArrowRight size={20} weight="bold" className="ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Location */}
                        {step === "location" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-default">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <MapPin size={24} weight="fill" className="text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-primary">Location</h2>
                                </div>

                                {/* Google Maps Link Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                                        <Link size={12} weight="bold" /> Google Maps Location Link <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={mapsLink}
                                            onChange={(e) => parseGoogleMapsLink(e.target.value)}
                                            disabled={isResolvingMapLink}
                                            className={`w-full bg-surface-base/50 border rounded-xl px-4 py-3 text-primary focus:outline-none transition-colors pr-10 ${
                                                mapsLinkError ? "border-red-500/50 focus:border-red-500" :
                                                isResolvingMapLink ? "border-blue-500/50 focus:border-blue-500" :
                                                geoLat ? "border-emerald-500/50 focus:border-emerald-500" :
                                                "border-subtle focus:border-blue-500"
                                            }`}
                                            placeholder="https://maps.google.com/maps?q=..."
                                        />
                                        {isResolvingMapLink && (
                                            <CircleNotch size={20} weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
                                        )}
                                        {!isResolvingMapLink && geoLat && (
                                            <CheckCircle size={20} weight="fill" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                        )}
                                    </div>
                                    {isResolvingMapLink && <p className="text-blue-400 text-xs mt-1 animate-pulse">Resolving short link...</p>}
                                    {!isResolvingMapLink && mapsLinkError && <p className="text-red-400 text-xs mt-1">{mapsLinkError}</p>}
                                    {!isResolvingMapLink && !mapsLink && <p className="text-faint text-[11px] mt-1">Supports full links and short links (maps.app.goo.gl)</p>}
                                </div>

                                {/* Coordinates Display */}
                                {geoLat && geoLng && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                        <CheckCircle size={20} weight="fill" className="text-emerald-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-400">Coordinates detected</p>
                                            <p className="text-xs text-emerald-300/70 font-mono mt-0.5">{geoLat.toFixed(6)}, {geoLng.toFixed(6)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">City <span className="text-red-500">*</span></label>
                                        <input type="hidden" {...register("city", { required: "City is required" })} />
                                        <CityCombobox
                                            cities={availableCities}
                                            value={watch("city")}
                                            onChange={(val) => setValue("city", val, { shouldValidate: true })}
                                            loading={isLoadingCities}
                                            required
                                            error={errors.city?.message as string}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Full Address <span className="text-red-500">*</span></label>
                                        <input
                                            {...register("address", { required: "Address is required" })}
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                            placeholder="Street, Area, etc."
                                        />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message as string}</p>}
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 p-4 rounded-xl flex gap-3 items-start border border-blue-500/20">
                                    <Info size={20} weight="fill" className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-200/80 leading-relaxed">
                                        <span className="font-bold text-blue-400 block mb-1">How to get your Google Maps link</span>
                                        Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex items-center gap-1">Google Maps <ArrowSquareOut size={12} weight="bold" /></a>, search for your venue, right-click the exact location, and select &quot;Share&quot; → &quot;Copy link&quot;. Paste it above to auto-detect your coordinates.
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setStep("details")} className="flex-1 h-12 text-secondary hover:text-primary">
                                        <ArrowLeft size={20} weight="bold" className="mr-2" /> Back
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={isResolvingMapLink}
                                        onClick={async () => {
                                            if (!geoLat || !geoLng) {
                                                setMapsLinkError("Please paste a valid Google Maps link to set your venue location.");
                                                return;
                                            }
                                            const valid = await trigger(["city", "address"]);
                                            if (valid) setStep("amenities");
                                        }}
                                        className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none"
                                    >
                                        Next: Amenities <ArrowRight size={20} weight="bold" className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Amenities & Submit */}
                        {step === "amenities" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-default">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <CheckCircle size={24} weight="fill" className="text-purple-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-primary">Facilities</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {amenitiesList.map((amenity) => (
                                        <label key={amenity} className="flex items-center gap-3 p-3 rounded-xl border border-default bg-surface-base/40 cursor-pointer hover:border-emerald-500/50 hover:bg-surface-raised transition-all group">
                                            <input
                                                type="checkbox"
                                                value={amenity}
                                                {...register("amenities")}
                                                className="w-4 h-4 rounded border-subtle text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black accent-emerald-500"
                                            />
                                            <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">{amenity}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-default mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setStep("location")} className="flex-1 h-12 text-secondary hover:text-primary">
                                        <ArrowLeft size={20} weight="bold" className="mr-2" /> Back
                                    </Button>
                                    <Button type="button" onClick={() => setStep("document")} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        Next: Verification <ArrowRight size={20} weight="bold" className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Document Upload & Submit */}
                        {step === "document" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-default">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Info size={24} weight="fill" className="text-purple-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-primary">Verification</h2>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-primary block">Business Registration Document (PDF)</label>
                                    <p className="text-xs text-secondary">Please upload your official business registration. Only PDF format up to 5MB is allowed. This is strictly required to verify your venue ownership.</p>

                                    <div className="relative group mt-2">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setBrDocument(e.target.files[0]);
                                                }
                                            }}
                                            className="w-full text-sm text-secondary file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 cursor-pointer"
                                        />
                                    </div>

                                    {brDocument && (
                                        <div className="bg-emerald-500/10 text-emerald-500 text-sm px-4 py-2 rounded-xl inline-flex items-center border border-emerald-500/20">
                                            <CheckCircle size={16} weight="fill" className="mr-2" />
                                            "{brDocument.name}" ready to upload
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-default mt-6">
                                    <Button type="button" variant="ghost" onClick={() => setStep("amenities")} className="flex-1 h-12 text-secondary hover:text-primary">
                                        <ArrowLeft size={20} weight="bold" className="mr-2" /> Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !brDocument}
                                        className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {isSubmitting ? <CircleNotch size={20} weight="bold" className="animate-spin mx-auto" /> : "Complete Registration"}
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
