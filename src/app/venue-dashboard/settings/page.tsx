
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Save, Loader2, MapPin, Phone, Clock, FileText, Calendar, Globe, AlertCircle, CheckCircle2, Search, Shield, Sun, Zap } from "lucide-react";
import Script from "next/script";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { venueApiService } from "@/services/venueApiService";
import { centerService } from "@/services/centerService";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { api } from "@/services/api";
import { Venue, VenueProfile, City } from "@/types";
import CityCombobox from "@/components/ui/CityCombobox";
import TimePicker from "@/components/ui/TimePicker";

export default function VenueSettingsPage() {
    const { user } = useAuth();
    const { currentVenue, refreshVenues } = useVenue();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [geoLat, setGeoLat] = useState<number | null>(null);
    const [geoLng, setGeoLng] = useState<number | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // Detailed profile state for schedule
    const [profile, setProfile] = useState<VenueProfile | null>(null);
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [mounted, setMounted] = useState(false);
    const amenitiesList = ["Parking", "A/C", "Showers", "Equipment Rental", "Cafe", "WiFi", "Lockers", "First Aid"];

    // Peak hours state
    const [peakHours, setPeakHours] = useState<{
        peak_start_time: string | null;
        peak_end_time: string | null;
        peak_days: string | null;
        has_peak_config: boolean;
    }>({ peak_start_time: null, peak_end_time: null, peak_days: null, has_peak_config: false });
    const [peakEdit, setPeakEdit] = useState(false);
    const [peakForm, setPeakForm] = useState({ start: "", end: "", days: [] as number[] });
    const [peakSaving, setPeakSaving] = useState(false);
    const [peakLoading, setPeakLoading] = useState(false);
    const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            description: "",
            phone_contact: "",
            operating_hours_summary: "", // Summary string
            address: "",
            city: "",
            amenities: [] as string[],
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

    const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2).toString().padStart(2, "0");
        const min = (i % 2 === 0 ? "00" : "30");
        return `${hour}:${min}`;
    });

    const formatTimeForDisplay = (timeStr: string) => {
        if (!timeStr) return "Select time";
        const [hours, mins] = timeStr.split(":").map(Number);
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
    };

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
            setValue("phone_contact", currentVenue.phone_contact ?? "");
            setValue("operating_hours_summary", formatOperatingHoursSummary(currentVenue.operating_hours));
            setValue("address", currentVenue.address ?? "");
            setValue("city", currentVenue.city);
            setValue("amenities", currentVenue.amenities.map((a) => a.name));
            
            setGeoLat(currentVenue.geo_lat);
            setGeoLng(currentVenue.geo_lng);

            // Fetch detailed profile for schedule
            loadProfile();
            loadPeakHours();
        }
    }, [currentVenue, setValue]);

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

    const initAutocomplete = () => {
        if (!(window as any).google || !searchInputRef.current) return;

        const autocomplete = new (window as any).google.maps.places.Autocomplete(searchInputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'lk' } // Restrict to Sri Lanka
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setGeoLat(lat);
            setGeoLng(lng);
            setValue("address", place.formatted_address || "");

            // Extract city if possible
            const cityComp = place.address_components?.find((c: any) => 
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            );
            if (cityComp) {
                setValue("city", cityComp.long_name);
            }

            addToast("Location updated from map search", "success");
        });
    };

    useEffect(() => {
        if (mapLoaded && searchInputRef.current) {
            initAutocomplete();
        }
    }, [mapLoaded]);

    const loadPeakHours = async () => {
        if (!currentVenue) return;
        setPeakLoading(true);
        try {
            const data = await centerService.getPeakHours(currentVenue.id);
            setPeakHours(data);
        } catch (error) {
            console.error("Failed to load peak hours", error);
        } finally {
            setPeakLoading(false);
        }
    };

    const openPeakEdit = () => {
        setPeakForm({
            start: peakHours.peak_start_time || "",
            end: peakHours.peak_end_time || "",
            days: peakHours.peak_days ? peakHours.peak_days.split(",").map(Number) : [],
        });
        setPeakEdit(true);
    };

    const savePeakHours = async () => {
        if (!currentVenue) return;
        setPeakSaving(true);
        try {
            const payload = {
                peak_start_time: peakForm.start || null,
                peak_end_time: peakForm.end || null,
                peak_days: peakForm.days.length > 0 ? peakForm.days.sort().join(",") : null,
            };
            const res = await centerService.updatePeakHours(payload, currentVenue.id);
            setPeakHours(res);
            setPeakEdit(false);
            addToast("Peak hours updated successfully", "success");
        } catch (e: any) {
            addToast(e?.message || "Failed to save peak hours", "error");
        } finally {
            setPeakSaving(false);
        }
    };

    const clearPeakHours = async () => {
        if (!currentVenue) return;
        if (!confirm("Clear peak hours? All courts will use base rate only.")) return;
        setPeakSaving(true);
        try {
            const res = await centerService.updatePeakHours({
                peak_start_time: null,
                peak_end_time: null,
                peak_days: null,
            }, currentVenue.id);
            setPeakHours(res);
            setPeakEdit(false);
            addToast("Peak hours cleared", "success");
        } catch (e: any) {
            addToast(e?.message || "Failed to clear peak hours", "error");
        } finally {
            setPeakSaving(false);
        }
    };

    const togglePeakDay = (day: number) => {
        setPeakForm(prev => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
        }));
    };

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
                phone_contact: data.phone_contact,
                address: data.address,
                city: data.city,
                geo_lat: geoLat,
                geo_lng: geoLng,
                amenities: data.amenities,
            } as any);

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

    if (!mounted || !user) return null;

    if (!currentVenue) {
        return (
            <div className="min-h-screen bg-surface-base pt-24 pb-12 px-4 flex items-center justify-center text-muted">
                Please select a venue to edit settings.
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-20 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Venue Settings</h1>
                    <p className="text-secondary">Update your venue information, contact details, and operating hours.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                        {/* Visibility Status */}
                        <div className="mb-10 pb-8 border-b border-default">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                                <Globe className="w-5 h-5 text-emerald-500" /> Search Visibility
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-2xl flex gap-3 items-start border ${currentVenue.is_verified ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                    {currentVenue.is_verified ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="font-bold text-primary text-sm">Verification Status</p>
                                        <p className="text-xs text-secondary mt-1">
                                            {currentVenue.is_verified 
                                                ? 'Your venue is verified and eligible for public search.' 
                                                : 'Verification pending. Your venue is currently hidden from public search results.'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className={`p-4 rounded-2xl flex gap-3 items-start border ${(geoLat && geoLng) ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                    {(geoLat && geoLng) ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="font-bold text-primary text-sm">Location Data</p>
                                        <p className="text-xs text-secondary mt-1">
                                            {(geoLat && geoLng) 
                                                ? 'GPS coordinates are set. Your venue will appear in "Near Me" searches.' 
                                                : 'Missing GPS coordinates. Your venue may be hidden from location-based searches.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!currentVenue.is_verified && (
                                <p className="mt-4 text-xs text-muted italic flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> Note: Even with GPS set, venues must be verified to appear in the public search.
                                </p>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4 mb-8">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
                                <FileText className="w-5 h-5 text-emerald-500" /> Basic Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Venue Name</label>
                                    <input
                                        {...register("name", { required: "Name is required" })}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="e.g. Arena Sports Complex"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">City</label>
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
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider">Description</label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Tell players about your venue..."
                                />
                            </div>
                        </div>

                        {/* Contact & Location */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
                                <MapPin className="w-5 h-5 text-blue-500" /> Location & Contact
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> Contact Number
                                    </label>
                                    <input
                                        {...register("phone_contact", { required: "Contact number is required" })}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="+94 77..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Operating Hours (Summary)
                                    </label>
                                    <input
                                        {...register("operating_hours_summary")}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="e.g. 6:00 AM - 10:00 PM"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center justify-between">
                                    <span>Search Location (Google Maps)</span>
                                    <span className="text-[10px] text-faint">Syncs address & Coordinates</span>
                                </label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search for your venue on Google Maps..."
                                        className="w-full bg-surface-base/60 border border-subtle focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-4 text-primary placeholder:text-faint transition-all outline-none shadow-xl"
                                    />
                                    {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
                                            API Key Missing
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Address</label>
                                    <textarea
                                        {...register("address", { required: "Address is required" })}
                                        rows={1}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                                        placeholder="Full street address..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center justify-between">
                                        <span>GPS Coordinates</span>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition((pos) => {
                                                        setGeoLat(pos.coords.latitude);
                                                        setGeoLng(pos.coords.longitude);
                                                        addToast("Current GPS captured!", "success");
                                                    });
                                                }
                                            }}
                                            className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold underline"
                                        >
                                            Use Current GPS
                                        </button>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-surface-base/80 border border-default rounded-xl px-4 py-3 text-secondary text-xs truncate">
                                            LAT: {geoLat?.toFixed(6) || 'None'}
                                        </div>
                                        <div className="bg-surface-base/80 border border-default rounded-xl px-4 py-3 text-secondary text-xs truncate">
                                            LNG: {geoLng?.toFixed(6) || 'None'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Script 
                        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                        onLoad={() => setMapLoaded(true)}
                    />

                    {/* Amenities */}
                    <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                        <div className="border-b border-default pb-2 mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-500" /> Facilities & Amenities
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    </div>

                    {/* Peak Hours Configuration */}
                    <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-default pb-2 mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" /> Peak Hours & Pricing
                            </h2>
                            {peakLoading && <div className="h-2 w-16 rounded-full bg-surface-overlay animate-pulse" />}
                        </div>

                        <p className="text-sm text-secondary mb-6">Set peak hours when demand is high. Courts with a peak rate configured will automatically charge that rate during these hours. Leave peak days empty to apply every day.</p>

                        {peakEdit ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TimePicker
                                        label="Peak Start Time"
                                        value={peakForm.start}
                                        onChange={(v) => setPeakForm(prev => ({ ...prev, start: v }))}
                                    />
                                    <TimePicker
                                        label="Peak End Time"
                                        value={peakForm.end}
                                        onChange={(v) => setPeakForm(prev => ({ ...prev, end: v }))}
                                    />
                                </div>

                                {peakForm.start && peakForm.end && peakForm.start === peakForm.end && (
                                    <p className="text-red-500 text-xs font-bold">Start and end time cannot be the same</p>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Peak Days</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPeakForm(prev => ({ ...prev, days: [] }))}
                                                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider"
                                            >
                                                All days
                                            </button>
                                            <span className="text-faint">|</span>
                                            <button
                                                type="button"
                                                onClick={() => setPeakForm(prev => ({ ...prev, days: [0, 1, 2, 3, 4] }))}
                                                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider"
                                            >
                                                Weekdays
                                            </button>
                                            <span className="text-faint">|</span>
                                            <button
                                                type="button"
                                                onClick={() => setPeakForm(prev => ({ ...prev, days: [5, 6] }))}
                                                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider"
                                            >
                                                Weekends
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {DAY_LABELS.map((label, i) => {
                                            const isSelected = peakForm.days.includes(i);
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => togglePeakDay(i)}
                                                    className={`relative py-3 rounded-xl text-sm font-bold border transition-all ${
                                                        isSelected
                                                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                                                            : 'bg-surface-base/40 border-subtle text-muted hover:text-secondary hover:border-subtle'
                                                    }`}
                                                >
                                                    {label}
                                                    {isSelected && (
                                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[11px] text-faint">
                                        {peakForm.days.length === 0
                                            ? "Peak pricing applies every day of the week."
                                            : `Peak pricing applies on ${peakForm.days.length} selected day${peakForm.days.length > 1 ? 's' : ''}.`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-2 border-t border-default">
                                    <Button
                                        type="button"
                                        onClick={savePeakHours}
                                        disabled={peakSaving || !peakForm.start || !peakForm.end || peakForm.start === peakForm.end}
                                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 h-11 rounded-xl disabled:opacity-50"
                                    >
                                        {peakSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Peak Hours'}
                                    </Button>
                                    {peakHours.has_peak_config && (
                                        <button type="button" onClick={clearPeakHours} disabled={peakSaving} className="px-4 h-11 text-sm text-red-400 hover:text-red-300 font-bold">
                                            Clear All
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setPeakEdit(false)} className="px-4 h-11 text-sm text-muted hover:text-primary font-medium">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : peakHours.has_peak_config ? (
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                                    <div className="space-y-3 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Sun className="w-4 h-4 text-amber-400" />
                                            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Active</span>
                                            <span className="text-primary font-bold">
                                                {peakHours.peak_start_time} &ndash; {peakHours.peak_end_time}
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {DAY_LABELS.map((label, i) => {
                                                const isActive = !peakHours.peak_days || peakHours.peak_days.split(",").map(Number).includes(i);
                                                return (
                                                    <span
                                                        key={i}
                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                                            isActive
                                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                                : 'bg-surface-overlay/60 text-faint border border-default'
                                                        }`}
                                                    >
                                                        {label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openPeakEdit}
                                        className="text-xs font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black px-4 py-2 rounded-lg transition-all border border-amber-500/20"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-4 p-5 bg-surface-overlay/20 rounded-2xl border border-dashed border-subtle">
                                <div>
                                    <p className="text-sm text-secondary font-medium">No peak hours configured</p>
                                    <p className="text-xs text-faint mt-1">All courts use their base hourly rate for every booking.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={openPeakEdit}
                                    className="text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-lg transition-all whitespace-nowrap"
                                >
                                    Configure
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Weekly Schedule */}
                    <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-default pb-2 mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-500" /> Weekly Schedule
                            </h2>
                            {isLoadingProfile && <div className="h-2 w-16 rounded-full bg-surface-overlay animate-pulse" />}
                        </div>

                        <div className="space-y-4">
                            {scheduleFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-4 items-center bg-surface-raised/50 p-4 rounded-xl border border-default/50">
                                    <div className="col-span-4">
                                        <span className="text-sm font-bold text-primary capitalize">{field.day}</span>
                                    </div>
                                    <div className="col-span-3">
                                        <select
                                            {...register(`schedule.${index}.open`)}
                                            className="w-full bg-surface-base border border-subtle rounded-lg px-3 py-2 text-primary text-sm focus:border-purple-500 focus:outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Opening Time</option>
                                            {TIME_OPTIONS.map(time => (
                                                <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-1 text-center text-muted">-</div>
                                    <div className="col-span-3">
                                        <select
                                            {...register(`schedule.${index}.close`)}
                                            className="w-full bg-surface-base border border-subtle rounded-lg px-3 py-2 text-primary text-sm focus:border-purple-500 focus:outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Closing Time</option>
                                            {TIME_OPTIONS.map(time => (
                                                <option key={time} value={time}>{formatTimeForDisplay(time)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Removed Closed checkbox as per user request */}
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
