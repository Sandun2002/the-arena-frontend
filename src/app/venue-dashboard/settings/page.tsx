"use client";

import Link from "next/link";
import { ArrowLeft, Save, Building, MapPin, Phone, Mail } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function VenueSettingsPage() {
    const containerRef = useRef<HTMLDivElement>(null);

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
                        disabled
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black uppercase tracking-wider hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="h-4 w-4" /> Save Changes
                    </button>
                </div>

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
                                    <input type="text" defaultValue="Colombo Sports Center" className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors" disabled />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Venue Type</label>
                                    <select className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors" disabled>
                                        <option>Multi-Sport Complex</option>
                                        <option>Indoor Stadium</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                                <textarea rows={4} defaultValue="A premium sports facility located in the heart of Colombo, featuring world-class amenities and professional-grade courts." className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors resize-none" disabled />
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
                                <input type="text" defaultValue="123 Bauddhaloka Mawatha, Colombo 07" className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors" disabled />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Phone className="h-3 w-3" /> Phone</label>
                                    <input type="text" defaultValue="+94 77 123 4567" className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors" disabled />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Mail className="h-3 w-3" /> Email</label>
                                    <input type="email" defaultValue="bookings@colombosports.com" className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors" disabled />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
