"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User, Mail, Bell, Shield, Camera, Save, LogOut } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

export default function ProfileSettingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2680&auto=format&fit=crop");

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".settings-section",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-8">
                    Account <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text">Settings</span>
                </h1>

                <div className="grid gap-8">

                    {/* 1. Availability / Profile Pic */}
                    <div className="settings-section bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 group-hover:border-emerald-500 transition-colors">
                                <Image src={avatarPreview} alt="Profile" fill className="object-cover" />
                            </div>
                            <button className="absolute bottom-0 right-0 p-3 bg-emerald-500 rounded-full text-black hover:bg-emerald-400 shadow-lg transition-transform hover:scale-110">
                                <Camera className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-white mb-1">Update Profile Photo</h3>
                            <p className="text-zinc-500 text-sm mb-4">Allowed formats: JPG, PNG. Max size: 2MB.</p>
                            <div className="flex gap-2 justify-center md:justify-start">
                                <Button variant="outline" className="text-xs border-zinc-700">Remove</Button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Personal Information */}
                    <div className="settings-section bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="h-5 w-5 text-zinc-500" />
                            <h3 className="text-xl font-bold text-white">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">First Name</label>
                                <input type="text" defaultValue="John" className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Last Name</label>
                                <input type="text" defaultValue="Doe" className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                                <input type="email" defaultValue="john@example.com" disabled className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Phone</label>
                                <input type="tel" defaultValue="+94 77 123 4567" className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* 3. Password Check */}
                    <div className="settings-section bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="h-5 w-5 text-zinc-500" />
                            <h3 className="text-xl font-bold text-white">Security</h3>
                        </div>
                        <div className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Current Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">New Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-lg border-t border-zinc-800 p-4 z-50 flex justify-end gap-4">
                        <Button variant="outline" className="border-red-900/30 text-red-500 hover:bg-red-900/10">
                            Log Out
                        </Button>
                        <Button onClick={handleSave} className="bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] w-32">
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>

                </div>
            </div>
        </main>
    );
}
