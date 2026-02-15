
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2, Users, Receipt, Calendar,
    AlertTriangle, Clock, Activity, Plus
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { DashboardStats, Venue } from "@/types";
import VenueSwitcher from "@/components/venue/VenueSwitcher";

export default function VenueDashboardPage() {
    const { user, isVenueOwner, isVenueManager } = useAuth();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        if (user && (isVenueOwner || isVenueManager)) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) {
                    // Default to first venue for now
                    setSelectedVenue(data[0]);
                }
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedVenue) {

            venueService.getDashboardStats(selectedVenue.id, isVenueOwner).then(setStats);
        }
    }, [selectedVenue, isVenueOwner]);

    if (!user || (!isVenueOwner && !isVenueManager)) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Venue Dashboard</h1>
                        <p className="text-zinc-400">Manage your facility, bookings, and staff.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {venues.length > 0 && selectedVenue && (
                            <div className="md:hidden">
                                {/* Mobile helper: VenueSwitcher is in Header, but we might want explicit control here too if needed */}
                            </div>
                        )}
                        {isVenueOwner && (
                            <Link href="/venue-dashboard/create">
                                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10">
                                    <Plus className="w-4 h-4 mr-2" /> Add Venue
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Pending Banner */}
                {selectedVenue?.status === "pending" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4 mb-8">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-lg font-bold text-white mb-1">Verification Pending</h3>
                            <p className="text-yellow-200/70 text-sm">
                                Your venue is currently under review. Bookings will be enabled once an admin approves your listing.
                            </p>
                        </div>
                        <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase">Pending</span>
                    </div>
                )}

                {/* Suspended/Blocked Banner */}
                {(selectedVenue?.status === "suspended" || selectedVenue?.status === "blocked") && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4 mb-8">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Venue {selectedVenue?.status === "suspended" ? "Suspended" : "Blocked"}</h3>
                            <p className="text-red-200/70 text-sm">
                                Please contact support to resolve this issue.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg"><Calendar className="w-5 h-5 text-blue-500" /></div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.today_bookings || 0}</p>
                        <p className="text-sm text-zinc-500">Bookings Today</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg"><Receipt className="w-5 h-5 text-emerald-500" /></div>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {stats?.revenue !== null ? `LKR ${stats?.revenue?.toLocaleString()}` : "—"}
                        </p>
                        <p className="text-sm text-zinc-500">Total Revenue</p>
                        {stats?.revenue === null && <p className="text-[10px] text-zinc-600 mt-1">(Owner Access Only)</p>}
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg"><Building2 className="w-5 h-5 text-purple-500" /></div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.active_courts || 0}</p>
                        <p className="text-sm text-zinc-500">Active Courts</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg"><Users className="w-5 h-5 text-orange-500" /></div>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats?.total_bookings || 0}</p>
                        <p className="text-sm text-zinc-500">All-time Bookings</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/venue-dashboard/walk-in">
                                <Button variant="outline" className="w-full h-24 flex-col gap-2 border-zinc-700 hover:bg-zinc-800">
                                    <Plus className="w-6 h-6 text-emerald-500" />
                                    Record Walk-in
                                </Button>
                            </Link>
                            <Link href="/venue-dashboard/calendar">
                                <Button variant="outline" className="w-full h-24 flex-col gap-2 border-zinc-700 hover:bg-zinc-800">
                                    <Calendar className="w-6 h-6 text-blue-500" />
                                    View Calendar
                                </Button>
                            </Link>
                            <Link href="/venue-dashboard/courts">
                                <Button variant="outline" className="w-full h-24 flex-col gap-2 border-zinc-700 hover:bg-zinc-800">
                                    <Building2 className="w-6 h-6 text-purple-500" />
                                    Manage Courts
                                </Button>
                            </Link>
                            {isVenueOwner && (
                                <Link href="/venue-dashboard/managers">
                                    <Button variant="outline" className="w-full h-24 flex-col gap-2 border-zinc-700 hover:bg-zinc-800">
                                        <Users className="w-6 h-6 text-orange-500" />
                                        Manage Staff
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-sm text-white font-medium">New booking for Futsal Pitch</p>
                                    <p className="text-xs text-zinc-500">2 minutes ago • KAMAL P.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-sm text-white font-medium">Review received (5 Stars)</p>
                                    <p className="text-xs text-zinc-500">1 hour ago • John Doe</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <div>
                                    <p className="text-sm text-white font-medium">Court B Marked as Maintenance</p>
                                    <p className="text-xs text-zinc-500">3 hours ago • Manager</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
