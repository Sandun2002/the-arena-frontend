
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FloppyDisk, CircleNotch, MapPin, Phone, Clock, FileText, Calendar, Globe, WarningCircle, CheckCircle, MagnifyingGlass, Shield, Sun, Lightning, Bank } from "@phosphor-icons/react";
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

    // Payment acceptance state
    const [paymentAcceptance, setPaymentAcceptance] = useState<"card_only" | "cash_only" | "both">("both");
    const [paymentSaving, setPaymentSaving] = useState(false);

    // Peak hours state — new multi-window per-day system
    const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const DAY_FULL_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Local edit state: for each day, an array of {start, end} windows being edited
    const [peakWindows, setPeakWindows] = useState<{ start: string; end: string }[][]>(
        Array.from({ length: 7 }, () => [])
    );
    const [peakLoading, setPeakLoading] = useState(false);
    const [peakSaving, setPeakSaving] = useState(false);
    // Per-day inline add-window form: null = closed, otherwise {start, end}
    const [addingWindow, setAddingWindow] = useState<{ dayIndex: number; start: string; end: string } | null>(null);

    // Bank Details state
    const [bankDetails, setBankDetails] = useState<{
        bank_account_holder_name: string | null;
        bank_name: string | null;
        bank_branch_name: string | null;
        bank_account_number_masked: string | null;
        bank_account_type: "savings" | "current" | null;
        has_bank_details: boolean;
    } | null>(null);
    const [bankForm, setBankForm] = useState({
        bank_account_holder_name: "",
        bank_name: "",
        bank_branch_name: "",
        bank_account_number: "",
        bank_account_type: "savings" as "savings" | "current",
    });
    const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
    const [bankDetailsEdit, setBankDetailsEdit] = useState(false);
    const [bankDetailsSaving, setBankDetailsSaving] = useState(false);
    const BANK_OPTIONS = [
        "Bank of Ceylon", "People's Bank", "Commercial Bank", "Sampath Bank", 
        "HNB", "NDB", "NSB", "Seylan Bank", "DFCC Bank", "Pan Asia Bank", 
        "Union Bank", "Amana Bank", "Cargills Bank", "Nations Trust Bank"
    ];

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
            setPaymentAcceptance(currentVenue.accepted_payment_methods || "both");

            // Fetch detailed profile for schedule
            loadProfile();
            loadPeakHours();
            loadBankDetails();
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
            // Convert 7-day summary into local edit state
            const nextWindows: { start: string; end: string }[][] = Array.from({ length: 7 }, () => []);
            data.days.forEach((day) => {
                nextWindows[day.day_of_week] = day.windows.map((w) => ({ start: w.start_time, end: w.end_time }));
            });
            setPeakWindows(nextWindows);
        } catch (error) {
            console.error("Failed to load peak hours", error);
        } finally {
            setPeakLoading(false);
        }
    };

    const loadBankDetails = async () => {
        if (!currentVenue) return;
        setBankDetailsLoading(true);
        try {
            const data = await centerService.getBankDetails(currentVenue.id);
            setBankDetails(data);
            // Pre-populate form with existing values (but clear account number for security)
            setBankForm({
                bank_account_holder_name: data.bank_account_holder_name || "",
                bank_name: data.bank_name || "",
                bank_branch_name: data.bank_branch_name || "",
                bank_account_number: "", // always cleared for security
                bank_account_type: data.bank_account_type || "savings",
            });
            if (!data.has_bank_details) {
                setBankDetailsEdit(true);
            }
        } catch (error) {
            console.error("Failed to load bank details", error);
        } finally {
            setBankDetailsLoading(false);
        }
    };

    // --- Peak Hours helpers (multi-window) ---

    const savePeakHours = async () => {
        if (!currentVenue) return;
        setPeakSaving(true);
        try {
            const windows: import("@/types").PeakWindowInput[] = [];
            peakWindows.forEach((dayWins, dayIndex) => {
                dayWins.forEach((w) => {
                    windows.push({ day_of_week: dayIndex, start_time: w.start, end_time: w.end });
                });
            });
            const data = await centerService.updatePeakHours({ windows }, currentVenue.id);
            const nextWindows: { start: string; end: string }[][] = Array.from({ length: 7 }, () => []);
            data.days.forEach((day) => {
                nextWindows[day.day_of_week] = day.windows.map((w) => ({ start: w.start_time, end: w.end_time }));
            });
            setPeakWindows(nextWindows);
            addToast("Peak hours updated successfully", "success");
        } catch (e: any) {
            addToast(e?.message || "Failed to save peak hours", "error");
        } finally {
            setPeakSaving(false);
        }
    };

    const clearAllPeakHours = async () => {
        if (!currentVenue) return;
        if (!confirm("Clear all peak windows? All courts will use their base rate.")) return;
        setPeakSaving(true);
        try {
            await centerService.updatePeakHours({ windows: [] }, currentVenue.id);
            setPeakWindows(Array.from({ length: 7 }, () => []));
            addToast("Peak hours cleared", "success");
        } catch (e: any) {
            addToast(e?.message || "Failed to clear peak hours", "error");
        } finally {
            setPeakSaving(false);
        }
    };

    const removeWindow = (dayIndex: number, winIndex: number) => {
        setPeakWindows((prev) => {
            const next = prev.map((d) => [...d]);
            next[dayIndex] = next[dayIndex].filter((_, i) => i !== winIndex);
            return next;
        });
    };

    const confirmAddWindow = () => {
        if (!addingWindow) return;
        const { dayIndex, start, end } = addingWindow;
        if (!start || !end) { addToast("Set both start and end times", "error"); return; }
        if (start === end) { addToast("Start and end cannot be the same", "error"); return; }
        setPeakWindows((prev) => {
            const next = prev.map((d) => [...d]);
            next[dayIndex] = [...next[dayIndex], { start, end }];
            return next;
        });
        setAddingWindow(null);
    };

    const copyDayToAll = (dayIndex: number) => {
        const src = peakWindows[dayIndex];
        setPeakWindows(Array.from({ length: 7 }, () => [...src]));
    };

    const setAllDayPeak = (dayIndex: number) => {
        setPeakWindows((prev) => {
            const next = prev.map((d) => [...d]);
            next[dayIndex] = [{ start: "00:00", end: "00:00" }];
            return next;
        });
    };


    const saveBankDetails = async (e?: React.MouseEvent | React.FormEvent) => {
        if (e) e.preventDefault();
        if (!currentVenue) return;

        if (!bankForm.bank_account_holder_name || !bankForm.bank_name || !bankForm.bank_branch_name || !bankForm.bank_account_number || !bankForm.bank_account_type) {
            addToast("All bank details fields are required", "error");
            return;
        }

        setBankDetailsSaving(true);
        try {
            const res = await centerService.updateBankDetails(bankForm, currentVenue.id);
            setBankDetails(res);
            setBankDetailsEdit(false);
            addToast("Bank details saved successfully", "success");
        } catch (err: any) {
            addToast(err?.message || "Failed to save bank details", "error");
        } finally {
            setBankDetailsSaving(false);
        }
    };

    const savePaymentAcceptance = async (value: "card_only" | "cash_only" | "both") => {
        if (!currentVenue) return;
        const previous = paymentAcceptance;
        setPaymentAcceptance(value);
        setPaymentSaving(true);
        try {
            await venueApiService.updateVenue(currentVenue.id, { accepted_payment_methods: value } as any);
            addToast("Payment methods updated", "success");
            await refreshVenues();
        } catch (e: any) {
            setPaymentAcceptance(previous);
            addToast(e?.message || "Failed to update payment methods", "error");
        } finally {
            setPaymentSaving(false);
        }
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

    const isOwner = user.id === currentVenue.owner_id;

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
                                <Globe size={20} weight="bold" className="text-emerald-500" /> Search Visibility
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-2xl flex gap-3 items-start border ${currentVenue.is_verified ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                    {currentVenue.is_verified ? (
                                        <CheckCircle size={20} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <WarningCircle size={20} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
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
                                        <CheckCircle size={20} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <WarningCircle size={20} weight="fill" className="text-amber-500 flex-shrink-0 mt-0.5" />
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
                                    <WarningCircle size={12} weight="bold" /> Note: Even with GPS set, venues must be verified to appear in the public search.
                                </p>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4 mb-8">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-default pb-2">
                                <FileText size={20} weight="bold" className="text-emerald-500" /> Basic Information
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
                                <MapPin size={20} weight="bold" className="text-blue-500" /> Location & Contact
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                        <Phone size={12} weight="bold" /> Contact Number
                                    </label>
                                    <input
                                        {...register("phone_contact", { required: "Contact number is required" })}
                                        className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="+94 77..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                        <Clock size={12} weight="bold" /> Operating Hours (Summary)
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
                                    <MagnifyingGlass size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-emerald-500 transition-colors" />
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
                                <Shield size={20} weight="bold" className="text-emerald-500" /> Facilities & Amenities
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
                    {/* Peak Hours Configuration — 7-day multi-window */}
                    <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-default pb-2 mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Lightning size={20} weight="fill" className="text-amber-500" /> Peak Hours &amp; Pricing
                            </h2>
                            {peakLoading && <div className="h-2 w-16 rounded-full bg-surface-overlay animate-pulse" />}
                        </div>

                        <p className="text-sm text-secondary mb-6">
                            Configure peak pricing per day. Courts with a peak rate will charge it during peak windows.
                            Add multiple windows per day — useful for lunch rush + evening peaks.
                            <br /><span className="text-amber-400/70 font-medium">All-day peak</span> sets 00:00–00:00 and covers the entire day.
                        </p>

                        <div className="space-y-3">
                            {DAY_LABELS.map((label, dayIndex) => {
                                const dayWins = peakWindows[dayIndex];
                                const isAddingThisDay = addingWindow?.dayIndex === dayIndex;
                                return (
                                    <div
                                        key={dayIndex}
                                        className={`rounded-2xl border transition-all ${dayWins.length > 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-default bg-surface-base/30'}`}
                                    >
                                        {/* Day header */}
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className={`text-xs font-bold w-8 text-center py-1.5 rounded-lg ${dayWins.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-surface-overlay/60 text-muted'}`}>
                                                    {label}
                                                </span>
                                                {dayWins.length === 0 ? (
                                                    <span className="text-xs text-faint">No peak — base rate all day</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {dayWins.map((w, winIndex) => (
                                                            <span key={winIndex} className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-lg px-2.5 py-1 text-xs font-mono text-amber-300">
                                                                {w.start === "00:00" && w.end === "00:00" ? "All Day" : `${w.start}–${w.end}`}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeWindow(dayIndex, winIndex)}
                                                                    className="text-amber-500/60 hover:text-red-400 font-bold ml-0.5 transition-colors"
                                                                    title="Remove window"
                                                                >×</button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Day quick actions */}
                                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                {dayWins.length > 0 && (
                                                    <button
                                                        type="button"
                                                        title="Copy this day's windows to all days"
                                                        onClick={() => copyDayToAll(dayIndex)}
                                                        className="text-[10px] text-faint hover:text-emerald-400 font-bold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-all"
                                                    >
                                                        Copy→All
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    title="Set all-day peak"
                                                    onClick={() => setAllDayPeak(dayIndex)}
                                                    className="text-[10px] text-faint hover:text-amber-400 font-bold uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-amber-500/10 transition-all"
                                                >
                                                    All-day
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAddingWindow(isAddingThisDay ? null : { dayIndex, start: "", end: "" })}
                                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${isAddingThisDay ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-subtle text-muted hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/5'}`}
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline add-window form */}
                                        {isAddingThisDay && (
                                            <div className="px-4 pb-4 pt-1 border-t border-default">
                                                <div className="flex items-end gap-3 flex-wrap">
                                                    <div className="flex-1 min-w-[120px]">
                                                        <TimePicker
                                                            label="Start"
                                                            value={addingWindow!.start}
                                                            onChange={(v) => setAddingWindow((prev) => prev ? { ...prev, start: v } : null)}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-[120px]">
                                                        <TimePicker
                                                            label="End"
                                                            value={addingWindow!.end}
                                                            onChange={(v) => setAddingWindow((prev) => prev ? { ...prev, end: v } : null)}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pb-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={confirmAddWindow}
                                                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                                                        >Add</button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setAddingWindow(null)}
                                                            className="text-muted hover:text-primary text-xs px-3 py-2.5 rounded-xl border border-subtle hover:border-default transition-all"
                                                        >Cancel</button>
                                                    </div>
                                                </div>
                                                {addingWindow?.start && addingWindow?.end && addingWindow.start === addingWindow.end && (
                                                    <p className="text-red-400 text-[11px] mt-2 font-bold">Start and end cannot be the same (use All-day for 24h)</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Save / Clear All bar */}
                        <div className="flex items-center gap-3 pt-6 mt-2 border-t border-default">
                            <Button
                                type="button"
                                onClick={savePeakHours}
                                disabled={peakSaving}
                                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 h-11 rounded-xl disabled:opacity-50"
                            >
                                {peakSaving ? <CircleNotch size={16} weight="bold" className="animate-spin" /> : 'Save Peak Schedule'}
                            </Button>
                            {peakWindows.some((d) => d.length > 0) && (
                                <button
                                    type="button"
                                    onClick={clearAllPeakHours}
                                    disabled={peakSaving}
                                    className="px-4 h-11 text-sm text-red-400 hover:text-red-300 font-bold disabled:opacity-50"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>



                    {/* Payment Methods */}
                    <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-default pb-2 mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Shield size={20} weight="bold" className="text-emerald-500" /> Accepted Payment Methods
                            </h2>
                            {paymentSaving && <CircleNotch size={16} weight="bold" className="animate-spin text-emerald-500" />}
                        </div>

                        <p className="text-sm text-secondary mb-6">
                            Choose how players can pay you for bookings at this venue. Players will only see options you accept.
                            <br />
                            <span className="text-xs text-amber-500 font-bold">⚠️ Online (Card) payments are temporarily disabled platform-wide.</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { value: "both" as const, title: "Card & Cash", desc: "Players choose either method.", disabled: true },
                                { value: "card_only" as const, title: "Card only", desc: "Players pay online by card.", disabled: true },
                                { value: "cash_only" as const, title: "Cash only", desc: "Players pay in cash on arrival.", disabled: false },
                            ].map((opt) => {
                                const selected = paymentAcceptance === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        disabled={paymentSaving || opt.disabled}
                                        onClick={() => !selected && savePaymentAcceptance(opt.value)}
                                        className={`text-left p-5 rounded-2xl border transition-all ${
                                            selected
                                                ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.15)]"
                                                : "bg-surface-base/40 border-default hover:border-subtle hover:bg-surface-raised"
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-emerald-500" : "border-subtle"}`}>
                                                {selected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                            </div>
                                            <span className="font-bold text-primary text-sm">
                                                {opt.title} {opt.disabled && <span className="text-[10px] text-amber-500 font-normal ml-1">(Disabled)</span>}
                                            </span>
                                        </div>
                                        <p className="text-xs text-secondary leading-snug">{opt.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bank Details for Payouts */}
                    {isOwner && (
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between border-b border-default pb-2 mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Bank size={20} weight="bold" className="text-blue-500" /> Bank Details for Payouts
                            </h2>
                            {bankDetailsLoading && <CircleNotch size={16} weight="bold" className="animate-spin text-blue-500" />}
                        </div>

                        <p className="text-sm text-secondary mb-6">
                            These details are used to transfer your venue earnings. Ensure they match your bank records exactly.
                        </p>

                        {!bankDetailsEdit && bankDetails?.has_bank_details ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-surface-base/40 border border-default">
                                        <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Account Holder</p>
                                        <p className="text-sm text-primary font-medium">{bankDetails.bank_account_holder_name}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-surface-base/40 border border-default">
                                        <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Bank & Branch</p>
                                        <p className="text-sm text-primary font-medium">{bankDetails.bank_name} - {bankDetails.bank_branch_name}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-surface-base/40 border border-default">
                                        <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Account Number</p>
                                        <p className="text-sm text-primary font-mono font-medium">{bankDetails.bank_account_number_masked}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-surface-base/40 border border-default flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Account Type</p>
                                            <p className="text-sm text-primary font-medium capitalize">{bankDetails.bank_account_type}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setBankDetailsEdit(true)}
                                            className="text-xs font-bold bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-black px-4 py-2 rounded-lg transition-all border border-blue-500/20"
                                        >
                                            Edit Details
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <Shield size={16} weight="fill" className="text-blue-400 flex-shrink-0" />
                                    <p className="text-xs text-blue-100/70">
                                        Your bank details are encrypted and only visible to The Arena admin team during payout processing.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Account Holder Name</label>
                                        <input
                                            value={bankForm.bank_account_holder_name}
                                            onChange={e => setBankForm(prev => ({ ...prev, bank_account_holder_name: e.target.value }))}
                                            required
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="As registered with the bank"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Bank Name</label>
                                        <select
                                            value={bankForm.bank_name}
                                            onChange={e => setBankForm(prev => ({ ...prev, bank_name: e.target.value }))}
                                            required
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select Bank</option>
                                            {BANK_OPTIONS.map(bank => (
                                                <option key={bank} value={bank}>{bank}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Branch Name</label>
                                        <input
                                            value={bankForm.bank_branch_name}
                                            onChange={e => setBankForm(prev => ({ ...prev, bank_branch_name: e.target.value }))}
                                            required
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="e.g. Colombo 07"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Account Number</label>
                                        <input
                                            value={bankForm.bank_account_number}
                                            onChange={e => setBankForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
                                            required
                                            className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="Full account number"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider">Account Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    value="savings"
                                                    checked={bankForm.bank_account_type === "savings"}
                                                    onChange={() => setBankForm(prev => ({ ...prev, bank_account_type: "savings" }))}
                                                    className="text-blue-500 focus:ring-blue-500 bg-surface-base border-subtle"
                                                />
                                                <span className="text-sm text-secondary group-hover:text-primary transition-colors">Savings</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    value="current"
                                                    checked={bankForm.bank_account_type === "current"}
                                                    onChange={() => setBankForm(prev => ({ ...prev, bank_account_type: "current" }))}
                                                    className="text-blue-500 focus:ring-blue-500 bg-surface-base border-subtle"
                                                />
                                                <span className="text-sm text-secondary group-hover:text-primary transition-colors">Current</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-default">
                                    {bankDetails?.has_bank_details && (
                                        <button
                                            type="button"
                                            onClick={() => setBankDetailsEdit(false)}
                                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-secondary hover:text-primary hover:bg-surface-raised transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={saveBankDetails}
                                        disabled={bankDetailsSaving}
                                        className="bg-blue-500 hover:bg-blue-400 text-black font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    >
                                        {bankDetailsSaving ? <CircleNotch size={16} weight="bold" className="animate-spin mr-2" /> : <FloppyDisk size={16} weight="bold" className="mr-2" />}
                                        Save Bank Details
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    {/* Weekly Schedule */}
                    <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between border-b border-default pb-2 mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Calendar size={20} weight="bold" className="text-purple-500" /> Weekly Schedule
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
                            {isSubmitting ? <CircleNotch size={20} weight="bold" className="animate-spin mr-2" /> : <FloppyDisk size={16} weight="bold" className="mr-2" />}
                            Save All Changes
                        </Button>
                    </div>

                </form>
            </div>
        </main>
    );
}
