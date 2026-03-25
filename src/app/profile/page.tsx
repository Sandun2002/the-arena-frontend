"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    User as UserIcon, Trophy, Calendar, MapPin, Edit2, Shield,
    Activity, TrendingUp, Mail, ChevronRight, Star, Lock, CreditCard, LogOut
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
    const [gamification, setGamification] = useState<{ challenges: Challenge[], achievements: UserAchievement[] } | null>(null);

    useEffect(() => {
        if (user) {
            playerService.getStats().then(setStats);
            playerService.getBookings().then(d => setBookings(d.slice(0, 3))); // Top 3 recent
            playerService.getChallenges().then(setGamification);
        }
    }, [user]);

    if (!user) return null;

    const completedChallengesCount = gamification?.achievements.filter(a => a.is_completed).length || 0;
    const totalChallengesCount = gamification?.challenges.length || 0;
    const verificationStatus = user.verification_status ?? "unverified";
    const level = user.level ?? 1;
    const xp = user.xp ?? 0;
    const nextLevelXp = user.next_level_xp ?? 0;
    const xpProgressPercent = user.xp_progress_percent ?? 0;

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
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-400 text-sm mb-6">
                                <span className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                                    <Mail className="w-3.5 h-3.5" /> {user.email}
                                </span>
                                <span className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                                    <Calendar className="w-3.5 h-3.5" /> Joined {format(new Date(user.created_at), "MMM yyyy")}
                                </span>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${statusColors[verificationStatus]}`}>
                                    {verificationStatus === "verified" && <Shield className="w-3.5 h-3.5" />}
                                    <span className="capitalize">{verificationStatus}</span>
                                </span>
                            </div>

                            {/* XP Progress */}
                            <div className="max-w-md mx-auto md:mx-0">
                                <div className="flex justify-between text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">
                                    <span>Level {level}</span>
                                    <span>{xp} / {nextLevelXp} XP</span>
                                </div>
                                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                                        style={{ width: `${xpProgressPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2 text-right">
                                    {Math.max(nextLevelXp - xp, 0)} XP to next level
                                </p>
                            </div>
                        </div>

                        {/* Quick Edit (Mobile hidden, Desktop visible) */}
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
                                label="Activity"
                                value={stats?.total_bookings || 0}
                                subtext="Bookings"
                            />
                            <StatsCard
                                icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
                                label="Play Time"
                                value={`${stats?.hours_played || 0}h`}
                                subtext="Hours"
                                fullWidth
                            />
                        </div>

                        {/* Menu */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-2 backdrop-blur-sm">
                            <MenuLink href="/profile/settings" icon={<Edit2 className="w-4 h-4" />} label="Edit Profile" />
                            <MenuLink href="/settings/sessions" icon={<Shield className="w-4 h-4" />} label="Security & Sessions" />
                            <MenuLink href="/profile/password" icon={<Lock className="w-4 h-4" />} label="Change Password" />
                            <MenuLink href="/bookings" icon={<CreditCard className="w-4 h-4" />} label="Payment Methods" />
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

                    {/* Right Column: Bio & Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">

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
                                        Complete daily challenges to earn XP, unlock badges, and get exclusive discounts on your bookings.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
                                        View All Challenges <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Recent Activity */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-zinc-400" /> Recent Activity
                            </h3>

                            <div className="space-y-4">
                                {bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <Link href={`/bookings/${booking.id}`} key={booking.id}>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                                                    <Activity className="w-6 h-6 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium truncate group-hover:text-emerald-400 transition-colors">{booking.court?.venue_name || "Unknown Venue"}</h4>
                                                    <p className="text-sm text-zinc-500 truncate">{booking.court?.name} • {booking.court?.sport_type?.name || 'Sport'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-bold text-sm">LKR {booking.total_price}</p>
                                                    <p className="text-xs text-zinc-500">{format(new Date(booking.start_time), "MMM d")}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">
                                        <p>No recent bookings found.</p>
                                        <Link href="/venues">
                                            <Button variant="outline" className="mt-4">Book Now</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            {bookings.length > 0 && (
                                <Link href="/bookings" className="block mt-6 text-center text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                                    View All Bookings
                                </Link>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {user.bio || "No bio added yet."}
                            </p>
                        </div>
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

const statusColors: any = {
    verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    unverified: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};
