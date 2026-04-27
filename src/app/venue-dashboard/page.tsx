
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2, Users, Receipt, Calendar, CalendarCheck,
    AlertTriangle, Clock, Plus, ArrowUpRight, ArrowDownRight,
    Globe, UserPlus, Repeat, Hammer
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService as venueService } from "@/services/centerService";
import { DashboardStats, UpcomingBooking, ScheduleData } from "@/types";
import { useVenue } from "@/components/venue/VenueContext";
import { format } from "date-fns";
import { fmtTime } from "@/lib/utils";
import VenuePendingVerification from "@/components/venue/VenuePendingVerification";

export default function VenueDashboardPage() {
    const { user, isVenueOwner, isVenueManager } = useAuth();
    const { currentVenue, isLoading: isVenueLoading } = useVenue();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [upcoming, setUpcoming] = useState<UpcomingBooking[]>([]);
    const [todaySchedule, setTodaySchedule] = useState<ScheduleData | null>(null);
    const [upcomingClosures, setUpcomingClosures] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (currentVenue && currentVenue.is_verified) {
            loadDashboardData(currentVenue.id);
        }
    }, [currentVenue]);

    const loadDashboardData = async (venueId: string) => {
        setLoadingStats(true);
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const [statsData, upcomingData, scheduleData, closuresData] = await Promise.all([
                venueService.getStats(venueId),
                venueService.getUpcoming(venueId),
                venueService.getBookingsByDate(today, venueId),
                venueService.getClosures(venueId, true),
            ]);
            setStats(statsData);
            setUpcoming(upcomingData);
            setTodaySchedule(scheduleData);
            setUpcomingClosures(closuresData);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (isVenueLoading) return <div className="min-h-screen bg-surface-base flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    // If no venue selected (and not loading), show empty state or create prompt
    if (!currentVenue && !isVenueLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">No Venue Selected</h2>
                <p className="text-secondary mb-6">Create a venue to get started managing your facility.</p>
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

    // Verification Guard
    if (currentVenue && !currentVenue.is_verified) {
        return <VenuePendingVerification venue={currentVenue} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary uppercase tracking-tight mb-1">
                        Overview
                    </h1>
                    <p className="text-secondary">Welcome back, {user?.full_name?.split(' ')[0]}</p>
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
                        <h3 className="text-lg font-bold text-primary mb-1">Verification Pending</h3>
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
                        <h3 className="text-lg font-bold text-primary mb-1">Venue {currentVenue?.status === "suspended" ? "Suspended" : "Blocked"}</h3>
                        <p className="text-red-200/70 text-sm">Action required. Please check your email or contact support.</p>
                    </div>
                </div>
            )}

            {/* Active Upcoming Closure Banner */}
            {upcomingClosures.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-orange-500/20 rounded-xl flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-bold text-primary mb-0.5">Upcoming Venue Closure{upcomingClosures.length > 1 ? `s (${upcomingClosures.length})` : ""}</h3>
                        <p className="text-orange-200/70 text-xs truncate">
                            {upcomingClosures[0].reason || "Closed"} — {upcomingClosures[0].closure_date ?? upcomingClosures[0].start_date ?? ""}
                        </p>
                    </div>
                    <Link href="/venue-dashboard/closures" className="text-xs font-bold text-orange-400 hover:text-orange-300 flex-shrink-0">Manage</Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bookings Today */}
                <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-2xl"><Calendar className="w-6 h-6 text-blue-500" /></div>
                        {stats?.bookings_trend ? (
                            <div className={`flex items-center text-xs font-bold ${stats.bookings_trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stats.bookings_trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {Math.abs(stats.bookings_trend)}%
                            </div>
                        ) : null}
                    </div>
                    <p className="text-4xl font-black text-primary mb-1">{loadingStats ? "..." : stats?.today_bookings || 0}</p>
                    <p className="text-sm font-bold text-muted uppercase tracking-wide">Bookings Today</p>
                </div>

                {/* Revenue */}
                <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl"><Receipt className="w-6 h-6 text-emerald-500" /></div>
                        {stats?.revenue_trend ? (
                            <div className={`flex items-center text-xs font-bold ${stats.revenue_trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stats.revenue_trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {Math.abs(stats.revenue_trend)}%
                            </div>
                        ) : null}
                    </div>
                    <p className="text-4xl font-black text-primary mb-1">
                        {loadingStats ? "..." : stats?.revenue !== null ? `LKR ${stats?.revenue?.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-sm font-bold text-muted uppercase tracking-wide">Total Revenue</p>
                    {stats?.revenue === null && <p className="text-[10px] text-faint mt-2 font-medium bg-surface-overlay/50 inline-block px-2 py-1 rounded">Owner Access Only</p>}
                </div>

                {/* Active Courts */}
                <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-2xl"><Building2 className="w-6 h-6 text-purple-500" /></div>
                    </div>
                    <p className="text-4xl font-black text-primary mb-1">{loadingStats ? "..." : stats?.active_courts || 0}<span className="text-xl text-faint font-bold">/{stats?.total_courts || 0}</span></p>
                    <p className="text-sm font-bold text-muted uppercase tracking-wide">Active Courts</p>
                </div>

                {/* All Time Bookings */}
                <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between mb-6">
                        <div className="p-3 bg-orange-500/10 rounded-2xl"><Users className="w-6 h-6 text-orange-500" /></div>
                    </div>
                    <p className="text-4xl font-black text-primary mb-1">{loadingStats ? "..." : stats?.total_bookings || 0}</p>
                    <p className="text-sm font-bold text-muted uppercase tracking-wide">Total Bookings</p>
                </div>
            </div>

            {/* Today's Schedule Summary */}
            {todaySchedule && !loadingStats && (
                <div className="bg-surface-raised/50 border border-default rounded-3xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-primary">Today's Schedule</h2>
                        <Link href="/venue-dashboard/booking-manager" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider">Open Manager</Link>
                    </div>
                    {todaySchedule.isClosed ? (
                        <p className="text-red-400/70 text-sm font-medium">Venue is closed today{todaySchedule.closureReason ? ` — ${todaySchedule.closureReason}` : ""}.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                {
                                    label: "Platform",
                                    count: todaySchedule.bookings.filter(b => !b.is_manual && b.status !== "blocked" && b.status !== "maintenance").length,
                                    icon: <Globe className="w-4 h-4 text-blue-400" />,
                                    color: "text-blue-400",
                                    bg: "bg-blue-500/10 border-blue-500/20",
                                },
                                {
                                    label: "Walk-ins",
                                    count: todaySchedule.bookings.filter(b => b.is_manual && b.status !== "blocked" && b.status !== "maintenance").length,
                                    icon: <UserPlus className="w-4 h-4 text-orange-400" />,
                                    color: "text-orange-400",
                                    bg: "bg-orange-500/10 border-orange-500/20",
                                },
                                {
                                    label: "Recurring",
                                    count: todaySchedule.recurringBlocks.length,
                                    icon: <Repeat className="w-4 h-4 text-indigo-400" />,
                                    color: "text-indigo-400",
                                    bg: "bg-indigo-500/10 border-indigo-500/20",
                                },
                                {
                                    label: "Blocked",
                                    count: todaySchedule.bookings.filter(b => b.status === "blocked" || b.status === "maintenance").length,
                                    icon: <Hammer className="w-4 h-4 text-secondary" />,
                                    color: "text-secondary",
                                    bg: "bg-surface-overlay/50 border-subtle/50",
                                },
                            ].map(({ label, count, icon, color, bg }) => (
                                <div key={label} className={`rounded-2xl border p-4 flex flex-col gap-2 ${bg}`}>
                                    <div className="flex items-center gap-2">
                                        {icon}
                                        <span className="text-xs font-bold text-muted uppercase tracking-wider">{label}</span>
                                    </div>
                                    <p className={`text-3xl font-black ${color}`}>{count}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-primary mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/venue-dashboard/booking-manager">
                            <div className="group h-full p-6 bg-surface-base/40 border border-default rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary mb-1">Booking Manager</h3>
                                    <p className="text-xs text-secondary">Schedule & Walk-ins</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/venue-dashboard/bookings">
                            <div className="group h-full p-6 bg-surface-base/40 border border-default rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <CalendarCheck className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary mb-1">All Bookings</h3>
                                    <p className="text-xs text-secondary">View transactions</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/venue-dashboard/courts">
                            <div className="group h-full p-6 bg-surface-base/40 border border-default rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <Building2 className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary mb-1">Manage Courts</h3>
                                    <p className="text-xs text-secondary">Update pricing & status</p>
                                </div>
                            </div>
                        </Link>
                        {isVenueOwner && (
                            <Link href="/venue-dashboard/managers">
                                <div className="group h-full p-6 bg-surface-base/40 border border-default rounded-2xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer flex items-center gap-4">
                                    <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <Users className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary mb-1">Staff Access</h3>
                                        <p className="text-xs text-secondary">Invite & manage team</p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Upcoming Activity Widget */}
                <div className="bg-surface-raised/50 border border-default rounded-3xl p-8 backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-primary">Upcoming</h2>
                        <Link href="/venue-dashboard/booking-manager" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider">
                            View All
                        </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar space-y-4 pr-2">
                        {loadingStats ? (
                            <p className="text-muted text-sm text-center py-4">Loading schedule...</p>
                        ) : upcoming.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted text-sm mb-2">No upcoming bookings</p>
                                <Button variant="outline" className="text-xs h-8">Add Booking</Button>
                            </div>
                        ) : (
                            upcoming.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-base/40 border border-default/50 hover:border-subtle transition-colors">
                                    <div className={`w-2 h-full min-h-[40px] rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500' :
                                        booking.status === 'payment_pending' ? 'bg-yellow-500' : 'bg-zinc-600'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-primary truncate">{booking.customer_name}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-muted truncate">{booking.court_name}</p>
                                            <p className="text-xs font-mono font-medium text-secondary bg-surface-overlay px-1.5 py-0.5 rounded">
                                                {fmtTime(booking.start_time)}
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
