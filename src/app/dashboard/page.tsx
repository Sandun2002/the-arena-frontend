"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Activity, Calendar, Clock, Trophy, Star, ChevronRight, Zap, Flame, User, Play
} from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const PLAYER_STATS = {
    total_bookings: 42,
    hours_played: 86,
    xp: 2450,
    level: 7,
    level_name: "Pro Athlete",
    xp_to_next_level: 550
};

const PLAYER_CHALLENGES = [
    { id: 1, title: "Weekend Warrior", desc: "Play 5 weekend games", completed_count: 3, total_count: 5, xp_reward: 200, icon: Flame, color: "orange" },
    { id: 2, title: "Early Bird", desc: "Book 3 morning slots (6AM-9AM)", completed_count: 1, total_count: 3, xp_reward: 150, icon: Zap, color: "yellow" },
    { id: 3, title: "Loyalist", desc: "Visit the same venue 5 times", completed_count: 5, total_count: 5, xp_reward: 300, icon: Trophy, color: "emerald", completed: true },
];

const UPCOMING_BOOKINGS = [
    {
        id: "b-123",
        venue_name: "Emerald Turf Arena",
        date: "2026-02-14",
        time: "18:00 - 19:00",
        court: "Court A - Futsal",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop"
    }
];

export default function PlayerDashboard() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".dashboard-header",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".stat-card",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.3 }
            );
            gsap.fromTo(".widget-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.5 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Calculate progress for level bar
    const progressPercent = (PLAYER_STATS.xp % 1000) / 10;

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">

                {/* -- Header / Level Progress -- */}
                <div className="dashboard-header mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                                Player <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">Hub</span>
                            </h1>
                            <p className="text-zinc-400">Welcome back, Champion. Ready for your next match?</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Current Level</span>
                            <div className="flex items-center gap-2 justify-end">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                    {PLAYER_STATS.level}
                                </div>
                                <span className="text-2xl font-black text-white">{PLAYER_STATS.level_name}</span>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[65%]"
                            style={{ width: `${progressPercent}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                            {PLAYER_STATS.xp} XP / Next Level in {PLAYER_STATS.xp_to_next_level} XP
                        </div>
                    </div>
                </div>

                {/* -- Stats Grid -- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="stat-card p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm group hover:border-emerald-500/30 transition-colors">
                        <Trophy className="h-6 w-6 text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-white">{PLAYER_STATS.total_bookings}</p>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Matches Booked</p>
                    </div>
                    <div className="stat-card p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm group hover:border-emerald-500/30 transition-colors">
                        <Clock className="h-6 w-6 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-white">{PLAYER_STATS.hours_played}h</p>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Time on Court</p>
                    </div>
                    <div className="stat-card p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm group hover:border-emerald-500/30 transition-colors">
                        <Star className="h-6 w-6 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-white">4.9</p>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Avg Rating</p>
                    </div>
                    <div className="stat-card p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm group hover:border-emerald-500/30 transition-colors">
                        <Flame className="h-6 w-6 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-3xl font-black text-white">3</p>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Active Streak</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* -- Left: Upcoming Matches -- */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-500" /> Upcoming Matches
                            </h2>
                            <Link href="/bookings" className="text-sm font-bold text-emerald-500 hover:text-emerald-400 flex items-center">
                                View All <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {UPCOMING_BOOKINGS.length > 0 ? (
                            UPCOMING_BOOKINGS.map(booking => (
                                <div key={booking.id} className="widget-card group relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/30 transition-all p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 rounded-2xl overflow-hidden border border-zinc-700">
                                        <Image src={booking.image} alt={booking.venue_name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{booking.venue_name}</h3>
                                        <p className="text-zinc-400 text-sm mb-4">{booking.court}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <span className="bg-black/40 border border-zinc-700 rounded-lg px-3 py-1 text-xs font-bold text-white flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-emerald-500" /> {booking.date}
                                            </span>
                                            <span className="bg-black/40 border border-zinc-700 rounded-lg px-3 py-1 text-xs font-bold text-white flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-emerald-500" /> {booking.time}
                                            </span>
                                        </div>
                                    </div>
                                    <Button className="shrink-0 bg-white text-black font-bold hover:bg-emerald-400 transition-colors">
                                        View Details
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 rounded-[2rem] border border-dashed border-zinc-800 text-center">
                                <p className="text-zinc-500 mb-4">No upcoming matches scheduled.</p>
                                <Link href="/venues"><Button variant="outline">Find a Court</Button></Link>
                            </div>
                        )}

                        {/* Challenges Section */}
                        <div className="widget-card pt-8 border-t border-zinc-800">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" /> Active Challenges
                            </h2>
                            <div className="space-y-4">
                                {PLAYER_CHALLENGES.map(challenge => (
                                    <div key={challenge.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 
                                            ${challenge.color === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                                                challenge.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-emerald-500/10 text-emerald-500'}`}
                                        >
                                            <challenge.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <h4 className="font-bold text-white text-sm">{challenge.title}</h4>
                                                <span className="text-xs font-bold text-emerald-400">+{challenge.xp_reward} XP</span>
                                            </div>
                                            <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${challenge.completed ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                                                    style={{ width: `${(challenge.completed_count / challenge.total_count) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-1">{challenge.desc} ({challenge.completed_count}/{challenge.total_count})</p>
                                        </div>
                                        {challenge.completed ? (
                                            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-full">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <div className="text-xs font-bold text-zinc-600">{Math.round((challenge.completed_count / challenge.total_count) * 100)}%</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* -- Right: Quick Actions -- */}
                    <div className="widget-card lg:col-span-1">
                        <div className="sticky top-24 p-6 rounded-[2rem] border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link href="/venues">
                                    <button className="w-full p-4 rounded-xl bg-emerald-500 text-black font-bold flex items-center justify-between group hover:bg-emerald-400 transition-all">
                                        <span>Book a Court</span>
                                        <div className="bg-black/20 p-2 rounded-lg group-hover:bg-black/10"><Play className="h-4 w-4 fill-black" /></div>
                                    </button>
                                </Link>
                                <Link href="/profile">
                                    <button className="w-full p-4 rounded-xl bg-zinc-800 text-white font-bold flex items-center justify-between group hover:bg-zinc-700 transition-all border border-zinc-700">
                                        <span>Edit Profile</span>
                                        <User className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                                    </button>
                                </Link>
                                <Link href="/bookings">
                                    <button className="w-full p-4 rounded-xl bg-zinc-800 text-white font-bold flex items-center justify-between group hover:bg-zinc-700 transition-all border border-zinc-700">
                                        <span>History</span>
                                        <Clock className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                                    </button>
                                </Link>
                            </div>

                            {/* Promo Box */}
                            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-lg mb-2">Invite Friends</h4>
                                    <p className="text-xs text-blue-100 mb-4">Get 500 XP for every friend who joins Arena.</p>
                                    <button className="text-xs font-bold bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50">Copy Invite Link</button>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-20">
                                    <User className="h-32 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function Check(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
