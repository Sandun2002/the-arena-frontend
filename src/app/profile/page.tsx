"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    User as UserIcon, Trophy, Calendar, MapPin, Edit2, Shield,
    Activity, TrendingUp, Mail, ChevronRight, Star, Lock, LogOut,
    Clock, Plus, Zap
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { format } from "date-fns";
import { Booking, Challenge, UserAchievement } from "@/types";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [gamification, setGamification] = useState<{ challenges: Challenge[], achievements: UserAchievement[] } | null>(null);

    useEffect(() => {
        if (user) {
            playerService.getStats().then(setStats);
            playerService.getBookings().then(all => {
                // Sort newest first for recent activity
                const sorted = [...all].sort(
                    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
                );
                // Upcoming: confirmed/pending future bookings
                const upcoming = all
                    .filter(b =>
                        ["confirmed", "payment_pending"].includes(b.status) &&
                        new Date(b.start_time) > new Date()
                    )
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

                setUpcomingBookings(upcoming.slice(0, 3));
                setBookings(sorted.slice(0, 3));
            });
            playerService.getChallenges().then(setGamification);
        }
    }, [user]);

    if (!user) return null;

    const completedChallengesCount = gamification?.achievements.filter(a => a.is_completed).length || 0;
    const totalChallengesCount = gamification?.challenges.length || 0;
    const level = stats?.level ?? (user.level ?? 1);
    const xp = stats?.xp ?? (user.xp ?? 0);
    const tier = stats?.tier ?? "Rookie";
    const nextTier = stats?.next_tier ?? null;
    const xpToNextTier = stats?.xp_to_next_tier ?? 0;
    // Compute progress percent from tier thresholds embedded in stats
    const tierXpProgress = nextTier && xpToNextTier > 0
        ? Math.min(100, Math.round(((xp) / (xp + xpToNextTier)) * 100))
        : 100;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-5xl">

                {/* Header / Cover */}
                <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-20 bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-800 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>

                {/* Profile Header (Overlapping) */}
                <div className="relative -mt-32 px-4 md:px-8 mb-12">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6">

                        {/* Avatar & Level */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-zinc-800 overflow-hidden shadow-2xl relative z-10">
                                {user.profile_image ? (
                                    <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-16 h-16 text-zinc-500 m-auto mt-8 md:mt-10" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 md:bottom-2 md:right-0 z-20 bg-black rounded-full p-1.5">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-zinc-800 text-black font-extrabold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                    {level}
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 pb-2 w-full text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">{user.full_name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-zinc-400 text-sm mb-5">
                                <span className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                                    <Mail className="w-3.5 h-3.5" /> {user.email}
                                </span>
                                <span className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                                    <Calendar className="w-3.5 h-3.5" /> Joined {format(new Date(user.created_at), "MMM yyyy")}
                                </span>
                                {/* Tier Badge */}
                                <span className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-400">
                                    <Zap className="w-3.5 h-3.5" /> {tier}
                                </span>
                            </div>

                            {/* XP → Next Tier Progress */}
                            <div className="max-w-md mx-auto md:mx-0">
                                <div className="flex justify-between text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">
                                    <span>Level {level} · <span className="text-emerald-400">{tier}</span></span>
                                    <span>{xp} XP</span>
                                </div>
                                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                                        style={{ width: `${tierXpProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2 text-right">
                                    {nextTier
                                        ? <>{xpToNextTier} XP to reach <span className="text-zinc-400">{nextTier}</span></>
                                        : <span className="text-yellow-500">Max tier reached!</span>
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Quick Edit (Desktop) */}
                        <div className="hidden md:block">
                            <Link href="/profile/settings">
                                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Actions */}
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <StatsCard
                                icon={<Trophy className="w-5 h-5 text-yellow-500" />}
                                label="Challenges"
                                value={`${completedChallengesCount}/${totalChallengesCount}`}
                                subtext="Completed"
                            />
                            <StatsCard
                                icon={<Activity className="w-5 h-5 text-emerald-500" />}
                                label="Bookings"
                                value={stats?.total_bookings || 0}
                                subtext="Total games"
                            />
                            <StatsCard
                                icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
                                label="Play Time"
                                value={`${stats?.hours_played || 0}h`}
                                subtext="Hours on court"
                                fullWidth
                            />
                        </div>

                        {/* Menu */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-2 backdrop-blur-sm">
                            <MenuLink href="/profile/settings" icon={<Edit2 className="w-4 h-4" />} label="Edit Profile" />
                            <MenuLink href="/settings/sessions" icon={<Shield className="w-4 h-4" />} label="Security & Sessions" />
                            <MenuLink href="/profile/password" icon={<Lock className="w-4 h-4" />} label="Change Password" />
                            <MenuLink href="/reviews" icon={<Star className="w-4 h-4" />} label="My Reviews" />
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-between p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <span className="flex items-center gap-3 font-medium">
                                    <LogOut className="w-4 h-4" /> Log Out
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Upcoming Games — merged from /dashboard */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-400" /> Upcoming Games
                                </h3>
                                <Link href="/venues">
                                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-8 px-4 text-xs">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Book
                                    </Button>
                                </Link>
                            </div>

                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingBookings.map(booking => (
                                        <Link href={`/bookings/${booking.id}`} key={booking.id} className="block group">
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800/50 transition-all">
                                                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex flex-col items-center justify-center shrink-0 border border-zinc-700 group-hover:border-emerald-500/30 transition-colors">
                                                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{format(new Date(booking.start_time), "MMM")}</span>
                                                    <span className="text-lg font-black text-white leading-none">{format(new Date(booking.start_time), "dd")}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">
                                                        {booking.court?.sport_type?.name || booking.sport || "Sport"}
                                                    </h4>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 truncate">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" />{booking.court?.venue_name}
                                                    </p>
                                                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono mt-0.5">
                                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                                        {format(new Date(booking.start_time), "h:mm a")}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                                    booking.status === "confirmed"
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                    {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-400 mb-4">No upcoming bookings.</p>
                                    <Link href="/venues">
                                        <Button variant="outline" size="sm">Find a Court</Button>
                                    </Link>
                                </div>
                            )}
                            {upcomingBookings.length > 0 && (
                                <Link href="/bookings" className="block mt-5 text-center text-sm font-bold text-zinc-500 hover:text-white transition-colors">
                                    View All Bookings
                                </Link>
                            )}
                        </div>

                        {/* Gamification Teaser */}
                        <Link href="/challenges">
                            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors cursor-pointer">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy className="w-32 h-32 text-emerald-500" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-emerald-500" />
                                        Achievements & Challenges
                                    </h3>
                                    <p className="text-zinc-400 mb-4 max-w-md">
                                        Complete daily challenges to earn XP, unlock badges, and climb the tiers.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
                                        View All Challenges <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Recent Activity */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-zinc-400" /> Recent Activity
                            </h3>

                            <div className="space-y-3">
                                {bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <Link href={`/bookings/${booking.id}`} key={booking.id}>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                                                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-[10px] font-bold uppercase shrink-0 group-hover:bg-zinc-700 transition-colors">
                                                    {format(new Date(booking.start_time), "MMM dd")}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium text-sm truncate group-hover:text-emerald-400 transition-colors">
                                                        {booking.court?.venue_name || "Venue"}
                                                    </h4>
                                                    <p className="text-xs text-zinc-500 truncate">
                                                        {booking.court?.name} · {booking.court?.sport_type?.name || booking.sport || "Sport"}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-white font-bold text-sm">LKR {booking.total_price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">
                                        <p>No recent activity.</p>
                                    </div>
                                )}
                            </div>
                            {bookings.length > 0 && (
                                <Link href="/bookings" className="block mt-5 text-center text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                                    View All Bookings
                                </Link>
                            )}
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
                                <p className="text-zinc-400 leading-relaxed">{user.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatsCard({ icon, label, value, subtext, fullWidth }: any) {
    return (
        <div className={`bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800/50 transition-colors ${fullWidth ? 'col-span-2' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
            <p className="text-xs font-bold text-white mb-0.5 opacity-80">{label}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">{subtext}</p>
        </div>
    )
}

function MenuLink({ href, icon, label }: any) {
    return (
        <Link href={href} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors group">
            <span className="flex items-center gap-3 font-medium">
                <span className="group-hover:text-emerald-500 transition-colors">{icon}</span>
                {label}
            </span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </Link>
    )
}
