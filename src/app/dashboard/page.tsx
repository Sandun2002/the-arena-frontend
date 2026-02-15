
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    Trophy, Calendar, Clock, MapPin, ChevronRight,
    Activity, TrendingUp, Star, Plus
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { Booking } from "@/types";

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

    useEffect(() => {
        if (user) {
            // 1. Get Stats
            playerService.getStats(user.id).then(setStats);

            // 2. Get Bookings
            playerService.getBookings(user.id).then((allBookings) => {
                const sorted = allBookings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

                const upcoming = sorted.filter(b =>
                    ["confirmed", "payment_pending"].includes(b.status) &&
                    new Date(b.start_time) > new Date()
                );
                const past = sorted.filter(b => b.status === "completed").reverse(); // Most recent first

                setUpcomingBookings(upcoming.slice(0, 3));
                setRecentBookings(past.slice(0, 3));
            });
        }
    }, [user]);

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-5xl">

                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Welcome back, <span className="text-emerald-500">{user.full_name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-zinc-400">Ready to get back on the court?</p>
                    </div>
                    <Link href="/venues">
                        <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 px-8">
                            <Plus className="w-5 h-5 mr-2" /> Book a Court
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <StatsCard
                        icon={<Trophy className="w-5 h-5 text-yellow-500" />}
                        label="Current Level"
                        value={user.level}
                        subtext={`${user.next_level_xp - user.xp} XP to next`}
                    />
                    <StatsCard
                        icon={<Calendar className="w-5 h-5 text-blue-500" />}
                        label="Upcoming"
                        value={upcomingBookings.length}
                        subtext="Active bookings"
                    />
                    <StatsCard
                        icon={<Activity className="w-5 h-5 text-emerald-500" />}
                        label="Hours Played"
                        value={stats?.hours_played || 0}
                        subtext="Total court time"
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
                        label="Total Savings"
                        value={`LKR ${stats?.money_saved || 0}`}
                        subtext="Loyalty rewards"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Upcoming Bookings */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Upcoming Games</h2>
                            <Link href="/bookings" className="text-sm font-bold text-emerald-500 hover:text-emerald-400">View All</Link>
                        </div>

                        {upcomingBookings.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingBookings.map(booking => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-center">
                                <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 text-sm mb-4">No upcoming bookings</p>
                                <Link href="/venues">
                                    <Button variant="outline" size="sm">Find a Court</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity / Recommendations */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                            <Link href="/bookings?filter=past" className="text-sm font-bold text-zinc-500 hover:text-white">History</Link>
                        </div>

                        {recentBookings.length > 0 ? (
                            <div className="space-y-4">
                                {recentBookings.map(booking => (
                                    <div key={booking.id} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 font-bold text-xs uppercase">
                                            {format(new Date(booking.start_time), "MMM dd")}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{booking.sport}</p>
                                            <p className="text-zinc-500 text-xs">{booking.court?.venue_name}</p>
                                        </div>
                                        <div className="ml-auto text-emerald-500 font-bold text-sm">
                                            Completed
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 text-center">
                                <Activity className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-400 text-sm">No recent activity</p>
                            </div>
                        )}

                        {/* Quick Challenge (Mock) */}
                        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Trophy className="w-24 h-24 text-indigo-500 transform rotate-12" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1 relative z-10">Weekly Challenge</h3>
                            <p className="text-indigo-200 text-sm mb-4 relative z-10">Play 3 badminton matches this week to earn 500 XP!</p>
                            <div className="w-full bg-zinc-800/50 rounded-full h-2 mb-2 relative z-10">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full w-1/3"></div>
                            </div>
                            <p className="text-xs text-indigo-300 font-bold relative z-10">1 / 3 Matches Completed</p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

function StatsCard({ icon, label, value, subtext }: any) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm font-bold text-white mb-0.5">{label}</p>
            <p className="text-xs text-zinc-500">{subtext}</p>
        </div>
    )
}

function BookingCard({ booking }: { booking: Booking }) {
    return (
        <Link href={`/bookings/${booking.id}`} className="block group">
            <div className="bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all flex items-center gap-4">

                <div className="w-14 h-14 bg-zinc-950 rounded-lg flex flex-col items-center justify-center border border-zinc-800 group-hover:border-emerald-500/30 transition-colors">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{format(new Date(booking.start_time), "MMM")}</span>
                    <span className="text-xl font-black text-white">{format(new Date(booking.start_time), "dd")}</span>
                </div>

                <div className="flex-grow">
                    <h3 className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                        {booking.sport}
                    </h3>
                    <p className="text-zinc-500 text-xs flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3" /> {booking.court?.venue_name}
                    </p>
                    <p className="text-zinc-400 text-xs flex items-center gap-2 font-mono">
                        <Clock className="w-3 h-3" /> {format(new Date(booking.start_time), "h:mm a")}
                    </p>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />

            </div>
        </Link>
    );
}
