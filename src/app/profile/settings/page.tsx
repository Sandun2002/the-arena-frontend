"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { USER_PROFILE } from "@/services/userData";
import { ArrowLeft, Save, User, Lock, Bell, LogOut, Upload } from "lucide-react";
import gsap from "gsap";

export default function ProfileSettingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: USER_PROFILE.name,
        email: USER_PROFILE.email,
        phone: "+94 77 123 4567", // Mock data
        avatar: USER_PROFILE.avatar,
        bio: "Passionate about football and weekend tennis. Always chasing the next level and breaking personal records.",
    });

    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailBookings: true,
        smsReminders: true,
        pushUpdates: false,
        marketingEmails: true,
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
            gsap.fromTo(".settings-section",
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

    const handleNotificationToggle = (field: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setHasChanges(false);
        // In real app, would call API to update user profile
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">

                {/* Back Link */}
                <Link href="/profile" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                </Link>

                {/* Header */}
                <div className="page-header flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
                            Profile <span className="text-emerald-500">Settings</span>
                        </h1>
                        <p className="text-zinc-400">Manage your account preferences and personal information.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-wider hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Account Section */}
                <div className="settings-section rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Account Information</h2>
                            <p className="text-sm text-zinc-500">Update your personal details and profile picture.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6">
                            <div className="relative h-24 w-24 shrink-0">
                                <Image
                                    src={formData.avatar}
                                    alt="Profile"
                                    fill
                                    className="rounded-full object-cover border-4 border-black ring-4 ring-emerald-500/50"
                                />
                            </div>
                            <div>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all text-sm font-bold">
                                    <Upload className="h-4 w-4" /> Upload New Photo
                                </button>
                                <p className="text-xs text-zinc-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bio</label>
                            <textarea
                                rows={3}
                                value={formData.bio}
                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="settings-section rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Security</h2>
                            <p className="text-sm text-zinc-500">Manage your password and account security.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <button className="px-6 py-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold hover:bg-purple-500/20 transition-all text-sm">
                            Update Password
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="settings-section rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Bell className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Notifications</h2>
                            <p className="text-sm text-zinc-500">Choose how you want to receive updates.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { key: "emailBookings", label: "Email Booking Confirmations", desc: "Receive confirmation emails for all bookings" },
                            { key: "smsReminders", label: "SMS Reminders", desc: "Get text reminders 1 hour before booking" },
                            { key: "pushUpdates", label: "Push Notifications", desc: "Real-time updates on your mobile device" },
                            { key: "marketingEmails", label: "Marketing Emails", desc: "Receive promotional offers and updates" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
                                <div>
                                    <p className="text-white font-bold text-sm">{item.label}</p>
                                    <p className="text-zinc-500 text-xs">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleNotificationToggle(item.key as keyof typeof notifications)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications]
                                            ? "bg-emerald-500"
                                            : "bg-zinc-700"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifications[item.key as keyof typeof notifications]
                                                ? "translate-x-6"
                                                : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="settings-section rounded-[2rem] border border-red-900/50 bg-red-900/10 p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                            <LogOut className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Danger Zone</h2>
                            <p className="text-sm text-zinc-500">Irreversible actions - proceed with caution.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 transition-all">
                            Deactivate Account
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 transition-all">
                            Delete Account Permanently
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}
