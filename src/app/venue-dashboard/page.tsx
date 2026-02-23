
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2, Users, Receipt, Calendar, CalendarCheck,
    AlertTriangle, Clock, Plus, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService as venueService } from "@/services/centerService";
import { DashboardStats, UpcomingBooking } from "@/types";
import { useVenue } from "@/components/venue/VenueContext";
import { format } from "date-fns";

export default function VenueDashboardPage() {
    const { user, isVenueOwner, isVenueManager } = useAuth();
    const { currentVenue, isLoading: isVenueLoading } = useVenue();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (currentVenue) {
            loadDashboardData(currentVenue.id);
        }
    }, [currentVenue]);

    const loadDashboardData = async (venueId: string) => {
        setLoadingStats(true);
        try {
            const [statsData, upcomingData] = await Promise.all([
                venueService.getStats(venueId),
                venueService.getUpcoming(venueId)
            ]);
            setStats(statsData);
            setUpcoming(upcomingData);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (isVenueLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    // If no venue selected (and not loading), show empty state or create prompt
    if (!currentVenue && !isVenueLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400 mb-6">Create a venue to get started managing your facility.</p>
                {isVenueOwner && (
                    <Link href="/venue-dashboard/create">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold">
                            Create First Venue
                        </Button>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
                        Overview
                    </h1>
                    <p className="text-zinc-400">Welcome back, {user?.full_name?.split(' ')[0]}</p>
                </div>
                {isVenueOwner && (
                    <Link href="/venue-dashboard/create">
                        <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                            <Plus className="w-4 h-4 mr-2" /> Add Venue
                        </Button>
                    </Link>
                )}
            </div>

            {/* Status Banners */}
            {currentVenue?.status === "pending" && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                        <Clock className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-white mb-1">Verification Pending</h3>
                        <p className="text-yellow-200/70 text-sm">
                            Your venue is currently under review. Bookings will be enabled once approved.
                        </p>
                    </div>
                </div>
            )}

            {(currentVenue?.status === "suspended" || currentVenue?.status === "blocked") && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-white mb-1">Venue {currentVenue?.status === "suspended" ? "Suspended" : "Blocked"}</h3>
                        <p className="text-red-200/70 text-sm">Action required. Please check your email or contact support.</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bookings Today */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-2xl"><Calendar className="w-6 h-6 text-blue-500" /></div>
                        {stats?.bookings_trend ? (
                            <div className={`flex items-center text-xs font-bold ${stats.bookings_trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stats.bookings_trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {Math.abs(stats.bookings_trend)}%
                            </div>
                        ) : null}
                    </div>
                    <p className="text-4xl font-black text-white mb-1">{loadingStats ? "..." : stats?.today_bookings || 0}</p>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Bookings Today</p>
                </div>

                {/* Revenue */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl"><Receipt className="w-6 h-6 text-emerald-500" /></div>
                        {stats?.revenue_trend ? (
                            <div className={`flex items-center text-xs font-bold ${stats.revenue_trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stats.revenue_trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {Math.abs(stats.revenue_trend)}%
                            </div>
                        ) : null}
                    </div>
                    <p className="text-4xl font-black text-white mb-1">
                        {loadingStats ? "..." : stats?.revenue !== null ? `LKR ${stats?.revenue?.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Total Revenue</p>
                    {stats?.revenue === null && <p className="text-[10px] text-zinc-600 mt-2 font-medium bg-zinc-800/50 inline-block px-2 py-1 rounded">Owner Access Only</p>}
                </div>

                {/* Active Courts */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-2xl"><Building2 className="w-6 h-6 text-purple-500" /></div>
                    </div>
                    <p className="text-4xl font-black text-white mb-1">{loadingStats ? "..." : stats?.active_courts || 0}<span className="text-xl text-zinc-600 font-bold">/{stats?.total_courts || 0}</span></p>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Active Courts</p>
                </div>

                {/* All Time Bookings */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-orange-500/10 rounded-2xl"><Users className="w-6 h-6 text-orange-500" /></div>
                    </div>
                    <p className="text-4xl font-black text-white mb-1">{loadingStats ? "..." : stats?.total_bookings || 0}</p>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Total Bookings</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/venue-dashboard/booking-manager">
                            <div className="group h-full p-6 bg-black/40 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Booking Manager</h3>
                                    <p className="text-xs text-zinc-400">Schedule & Walk-ins</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/venue-dashboard/bookings">
                            <div className="group h-full p-6 bg-black/40 border border-zinc-800 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <CalendarCheck className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">All Bookings</h3>
                                    <p className="text-xs text-zinc-400">View transactions</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/venue-dashboard/courts">
                            <div className="group h-full p-6 bg-black/40 border border-zinc-800 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Building2 className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Manage Courts</h3>
                                    <p className="text-xs text-zinc-400">Update pricing & status</p>
                                </div>
                            </div>
                        </Link>
                        {isVenueOwner && (
                            <Link href="/venue-dashboard/managers">
                                <div className="group h-full p-6 bg-black/40 border border-zinc-800 rounded-2xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer flex items-center gap-4">
                                    <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <Users className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-1">Staff Access</h3>
                                        <p className="text-xs text-zinc-400">Invite & manage team</p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Upcoming Activity Widget */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Upcoming</h2>
                        <Link href="/venue-dashboard/booking-manager" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider">
                            View All
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar space-y-4 pr-2">
                        {loadingStats ? (
                            <p className="text-zinc-500 text-sm text-center py-4">Loading schedule...</p>
                        ) : upcoming.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-zinc-500 text-sm mb-2">No upcoming bookings</p>
                                <Button variant="outline" className="text-xs h-8">Add Booking</Button>
                            </div>
                        ) : (
                            upcoming.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                    <div className={`w-2 h-full min-h-[40px] rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500' :
                                        booking.status === 'payment_pending' ? 'bg-yellow-500' : 'bg-zinc-600'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{booking.customer_name}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-zinc-500 truncate">{booking.court_name}</p>
                                            <p className="text-xs font-mono font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                                {format(new Date(booking.start_time), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
