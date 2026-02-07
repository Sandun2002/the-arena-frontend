"use client";

import Link from "next/link";
import { ArrowLeft, Save, Building, MapPin, Phone, Mail, Clock, CheckSquare, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const AVAILABLE_AMENITIES = [
    "Parking Available",
    "Changing Rooms",
    "Showers",
    "Equipment Rental",
    "Café/Refreshments",
    "First Aid",
    "Air Conditioning",
    "Floodlights",
    "Spectator Seating",
    "WiFi"
];

export default function VenueSettingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        venueName: "Colombo Sports Center",
        venueType: "Multi-Sport Complex",
        description: "A premium sports facility located in the heart of Colombo, featuring world-class amenities and professional-grade courts.",
        address: "123 Bauddhaloka Mawatha, Colombo 07",
        phone: "+94 77 123 4567",
        email: "bookings@colombosports.com",
    });

    const [operatingHours, setOperatingHours] = useState({
        weekday: { open: "06:00", close: "23:00" },
        weekend: { open: "07:00", close: "22:00" },
    });

    const [selectedAmenities, setSelectedAmenities] = useState([
        "Parking Available",
        "Changing Rooms",
        "Equipment Rental",
        "Floodlights"
    ]);

    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
            gsap.fromTo(".settings-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleHoursChange = (dayType: "weekday" | "weekend", timeType: "open" | "close", value: string) => {
        setOperatingHours(prev => ({
            ...prev,
            [dayType]: { ...prev[dayType], [timeType]: value }
        }));
        setHasChanges(true);
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setHasChanges(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">

                <Link href="/venue-dashboard" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>

                <div className="page-header flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Venue <span className="text-purple-500">Settings</span></h1>
                        <p className="text-zinc-400">Manage your venue profile and operational preferences.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black uppercase tracking-wider hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Success Toast */}
                {showSuccess && (
                    <div className="fixed top-24 right-4 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg z-50 animate-fade-in">
                        ✓ Settings saved successfully!
                    </div>
                )}

                <div className="grid gap-8">

                    {/* General Info Card */}
                    <div className="settings-card rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Building className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">General Information</h2>
                                <p className="text-sm text-zinc-500">Basic details about your sports complex.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Venue Name</label>
                                    <input
                                        type="text"
                                        value={formData.venueName}
                                        onChange={(e) => handleInputChange("venueName", e.target.value)}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Venue Type</label>
                                    <select
                                        value={formData.venueType}
                                        onChange={(e) => handleInputChange("venueType", e.target.value)}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    >
                                        <option>Multi-Sport Complex</option>
                                        <option>Indoor Stadium</option>
                                        <option>Outdoor Courts</option>
                                        <option>Swimming Pool</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Card */}
                    <div className="settings-card rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Location & Contact</h2>
                                <p className="text-sm text-zinc-500">How customers can find and reach you.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Phone className="h-3 w-3" /> Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Mail className="h-3 w-3" /> Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="settings-card rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Operating Hours</h2>
                                <p className="text-sm text-zinc-500">Set your venue's opening and closing times.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800">
                                <p className="text-sm font-bold text-white mb-4">Weekdays (Mon - Fri)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Opens At</label>
                                        <input
                                            type="time"
                                            value={operatingHours.weekday.open}
                                            onChange={(e) => handleHoursChange("weekday", "open", e.target.value)}
                                            className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Closes At</label>
                                        <input
                                            type="time"
                                            value={operatingHours.weekday.close}
                                            onChange={(e) => handleHoursChange("weekday", "close", e.target.value)}
                                            className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-black/40 border border-zinc-800">
                                <p className="text-sm font-bold text-white mb-4">Weekends (Sat - Sun)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Opens At</label>
                                        <input
                                            type="time"
                                            value={operatingHours.weekend.open}
                                            onChange={(e) => handleHoursChange("weekend", "open", e.target.value)}
                                            className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Closes At</label>
                                        <input
                                            type="time"
                                            value={operatingHours.weekend.close}
                                            onChange={(e) => handleHoursChange("weekend", "close", e.target.value)}
                                            className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="settings-card rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <CheckSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Amenities</h2>
                                <p className="text-sm text-zinc-500">Select the facilities available at your venue.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {AVAILABLE_AMENITIES.map((amenity) => {
                                const isSelected = selectedAmenities.includes(amenity);
                                return (
                                    <button
                                        key={amenity}
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${isSelected
                                                ? "bg-purple-500/10 border-purple-500/50 text-white"
                                                : "bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                            }`}
                                    >
                                        {isSelected ? (
                                            <CheckSquare className="h-5 w-5 text-purple-500 shrink-0" />
                                        ) : (
                                            <Square className="h-5 w-5 text-zinc-600 shrink-0" />
                                        )}
                                        <span className="font-bold text-sm">{amenity}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
