"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { USER_PROFILE } from "@/services/userData";
import { Trophy, Clock, Activity, Sun, Moon, Heart, Star, Settings, LogOut } from "lucide-react";
import gsap from "gsap";

// Helper to render icons dynamically
const IconMap: Record<string, React.ElementType> = { Sun, Moon, Heart, Trophy };

export default function ProfilePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".profile-header",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );

            gsap.fromTo(".stat-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)", delay: 0.3 }
            );

            gsap.fromTo(".achievement-card",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.6 }
            );
            gsap.fromTo(".cta-card",
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.75)", delay: 0.8 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                {/* 1. Profile Header Card */}
                <div className="profile-header relative mb-12 overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 md:p-12 backdrop-blur-xl group hover:border-emerald-500/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Glow behind avatar */}
                    <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Avatar */}
                        <div className="relative h-32 w-32 md:h-40 md:w-40 shrink-0">
                            <Image
                                src={USER_PROFILE.avatar}
                                alt={USER_PROFILE.name}
                                fill
                                className="rounded-full object-cover border-4 border-black ring-4 ring-emerald-500/50 shadow-2xl"
                            />
                            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg animate-bounce-slow">
                                <Star className="h-5 w-5 fill-black" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight uppercase flex flex-col md:block">
                                <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
                                    {USER_PROFILE.name.split(" ")[0]}
                                </span>{" "}
                                {USER_PROFILE.name.split(" ").slice(1).join(" ")}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                                <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                    {USER_PROFILE.tier}
                                </span>
                                <span className="rounded-full bg-zinc-800/50 px-4 py-1.5 text-xs text-zinc-400 border border-zinc-700">
                                    Member since {USER_PROFILE.memberSince}
                                </span>
                            </div>
                            <p className="text-zinc-400 text-base max-w-lg leading-relaxed">
                                Passionate about football and weekend tennis. Always chasing the next level and breaking personal records.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Link href="/profile/settings">
                                <button className="group p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-emerald-500 hover:bg-zinc-800 transition-all duration-300">
                                    <Settings className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </Link>
                            <button className="group p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-red-400 hover:text-red-300 hover:border-red-900/50 hover:bg-red-900/10 transition-all duration-300">
                                <LogOut className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                    {[
                        { label: "Matches Played", value: USER_PROFILE.stats.matchesPlayed, icon: Activity },
                        { label: "Hours Booked", value: USER_PROFILE.stats.hoursBooked, icon: Clock },
                        { label: "Favorite Sport", value: USER_PROFILE.stats.favoriteSport, icon: Star },
                        { label: "Reliability", value: USER_PROFILE.stats.reliabilityScore, icon: Trophy },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card group p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm">
                            <stat.icon className="h-8 w-8 text-zinc-600 group-hover:text-emerald-500 mb-4 transition-colors duration-300" />
                            <p className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:translate-x-1 transition-transform">{stat.value}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold group-hover:text-emerald-400/70 transition-colors">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

                    {/* 3. Achievements Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">🏆</span> Achievements
                            </h2>
                            <span className="text-emerald-500 text-sm font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                3/4 Unlocked
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {USER_PROFILE.achievements.map((badge) => {
                                const Icon = IconMap[badge.icon];
                                return (
                                    <div
                                        key={badge.id}
                                        className={`achievement-card relative overflow-hidden flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 group
                      ${badge.unlocked
                                                ? "bg-zinc-900/60 border-zinc-800 hover:border-emerald-500/50"
                                                : "bg-black/40 border-zinc-900 opacity-60 grayscale"
                                            }
                    `}
                                    >
                                        <div className={`
                      h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all
                      ${badge.unlocked
                                                ? "bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                                : "bg-zinc-900 border-zinc-800 text-zinc-600"}
                    `}>
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg mb-0.5 group-hover:text-emerald-400 transition-colors">{badge.name}</h4>
                                            <p className="text-xs text-zinc-500 font-medium">{badge.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Quick Link to Bookings - CTA Style */}
                    <div className="cta-card relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-center text-center group">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-8 w-8 text-black" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Your Schedule</h3>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                Ready for your next match? Check your upcoming sessions and court details.
                            </p>
                            <Link href="/bookings">
                                <button className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-wider hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-300">
                                    View Bookings
                                </button>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
