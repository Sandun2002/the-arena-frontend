
"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp, TrendingDown, DollarSign, Calendar, Users,
    BarChart2, PieChart, Clock
} from "lucide-react";
import { useAuth } from "@/services/authContext";
import { venueService } from "@/services/venueService";
import { Venue, DashboardStats } from "@/types";
import { format, subDays } from "date-fns";

export default function AnalyticsPage() {
    const { user, isVenueOwner } = useAuth();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>("");
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        if (user && isVenueOwner) {
            venueService.getMyVenues(user.id).then((data) => {
                setVenues(data);
                if (data.length > 0) setSelectedVenueId(data[0].id);
            });
        }
    }, [user, isVenueOwner]);

    useEffect(() => {
        if (selectedVenueId) {
            venueService.getDashboardStats(selectedVenueId, true).then(setStats);
        }
    }, [selectedVenueId]);

    if (!user || !isVenueOwner) return <div className="p-8 text-center text-zinc-500">Access Denied</div>;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
                        <p className="text-zinc-400">Financial performance and booking trends.</p>
                    </div>

                    {venues.length > 1 && (
                        <select
                            value={selectedVenueId}
                            onChange={(e) => setSelectedVenueId(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <DollarSign className="w-6 h-6 text-emerald-500" />
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12%
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">LKR {stats?.revenue?.toLocaleString() || 0}</p>
                        <p className="text-zinc-500 text-sm">Total Revenue</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Calendar className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +5%
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stats?.total_bookings || 0}</p>
                        <p className="text-zinc-500 text-sm">Total Bookings</p>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">4.8</p>
                        <p className="text-zinc-500 text-sm">Average Rating</p>
                    </div>
                </div>

                {/* Charts Mockup */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Revenue Chart */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-zinc-500" /> Revenue (Last 7 Days)
                        </h3>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[45, 60, 35, 70, 85, 65, 90].map((h, i) => (
                                <div key={i} className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-sm relative group transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        LKR {(h * 1000).toLocaleString()}
                                    </div>
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-zinc-500 text-[10px] whitespace-nowrap">
                                        {format(subDays(new Date(), 6 - i), "MMM dd")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Times (Heatmap Mock) */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-zinc-500" /> Peak Hours
                        </h3>
                        <div className="space-y-3">
                            {[
                                { time: "18:00 - 19:00", value: 95 },
                                { time: "19:00 - 20:00", value: 90 },
                                { time: "20:00 - 21:00", value: 85 },
                                { time: "17:00 - 18:00", value: 70 },
                                { time: "06:00 - 07:00", value: 40 },
                            ].map((slot, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                        <span>{slot.time}</span>
                                        <span>{slot.value}% Utilization</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${i < 3 ? "bg-red-500" : "bg-blue-500"}`}
                                            style={{ width: `${slot.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
}
