
"use client";

import { useEffect, useState } from "react";
import {
    TrendUp, CurrencyDollar, Calendar, Users,
    ChartBar, CircleNotch, ArrowRight, Receipt, XCircle, Lightning
} from "@phosphor-icons/react";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { DashboardStats, AnalyticsRevenue, AnalyticsUtilization } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { format, parseISO, isValid } from "date-fns";
import Link from "next/link";

export default function AnalyticsPage() {
    const { user, isVenueOwner } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();

    // Data States
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<AnalyticsRevenue | null>(null);
    const [utilizationData, setUtilizationData] = useState<AnalyticsUtilization | null>(null);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentVenue) {
            loadData();
        }
    }, [currentVenue, period]); // Reload when venue or period changes

    const loadData = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            // Revenue endpoint is owner-only — only call it for owners
            const baseRequests = [
                centerService.getStats(currentVenue.id),
                centerService.getUtilizationAnalytics(period, currentVenue.id),
            ] as const;

            const [statsRes, utilizationRes] = await Promise.all(baseRequests);
            setStats(statsRes);
            setUtilizationData(utilizationRes);

            if (isVenueOwner) {
                const revenueRes = await centerService.getRevenueAnalytics(period, currentVenue.id);
                setRevenueData(revenueRes);
            }
        } catch (error) {
            console.error(error);
            addToast("Failed to load analytics data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-24 text-muted">
                Please select a venue to view analytics.
            </div>
        );
    }

    // Prepare Chart Data
    const chartData = revenueData?.breakdown?.[period] || [];

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">Analytics</h1>
                        <p className="text-secondary">Financial performance and booking trends for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-surface-raised border border-default rounded-lg p-1">
                        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${period === p
                                    ? "bg-surface-overlay text-primary shadow-sm"
                                    : "text-muted hover:text-secondary"
                                    } capitalization`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && !stats ? (
                    <div className="h-96 flex items-center justify-center">
                        <CircleNotch size={32} weight="bold" className="animate-spin text-muted" />
                    </div>
                ) : (
                    <>
                        {/* Detailed Reports Navigation */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {isVenueOwner && (
                                <Link href="/venue-dashboard/analytics/revenue" className="bg-surface-raised/40 border border-default hover:border-emerald-500/50 p-4 rounded-xl backdrop-blur-sm transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                            <ChartBar size={20} weight="fill" className="text-emerald-500" />
                                        </div>
                                        <ArrowRight size={16} weight="bold" className="text-faint group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <h3 className="text-primary font-bold text-sm">Revenue Report</h3>
                                    <p className="text-muted text-xs mt-1">Detailed sales breakdown</p>
                                </Link>
                            )}

                            <Link href="/venue-dashboard/analytics/utilization" className="bg-surface-raised/40 border border-default hover:border-blue-500/50 p-4 rounded-xl backdrop-blur-sm transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                        <Lightning size={20} weight="fill" className="text-blue-500" />
                                    </div>
                                    <ArrowRight size={16} weight="bold" className="text-faint group-hover:text-blue-500 transition-colors" />
                                </div>
                                <h3 className="text-primary font-bold text-sm">Utilization Report</h3>
                                <p className="text-muted text-xs mt-1">Occupancy & peak hours</p>
                            </Link>

                            {isVenueOwner && (
                                <Link href="/venue-dashboard/analytics/fees" className="bg-surface-raised/40 border border-default hover:border-red-500/50 p-4 rounded-xl backdrop-blur-sm transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                            <Receipt size={20} weight="fill" className="text-red-500" />
                                        </div>
                                        <ArrowRight size={16} weight="bold" className="text-faint group-hover:text-red-500 transition-colors" />
                                    </div>
                                    <h3 className="text-primary font-bold text-sm">Fees & Payouts</h3>
                                    <p className="text-muted text-xs mt-1">Commissions & earnings</p>
                                </Link>
                            )}

                            <Link href="/venue-dashboard/analytics/cancellations" className="bg-surface-raised/40 border border-default hover:border-orange-500/50 p-4 rounded-xl backdrop-blur-sm transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                        <XCircle size={20} weight="fill" className="text-orange-500" />
                                    </div>
                                    <ArrowRight size={16} weight="bold" className="text-faint group-hover:text-orange-500 transition-colors" />
                                </div>
                                <h3 className="text-primary font-bold text-sm">Cancellations</h3>
                                <p className="text-muted text-xs mt-1">No-shows & refunds</p>
                            </Link>
                        </div>


                        {/* Key Metrics Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-surface-raised/40 border border-default rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                                        <CurrencyDollar size={24} weight="fill" className="text-emerald-500" />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${(revenueData?.trend_percentage || 0) >= 0
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-red-500/10 text-red-500"
                                        }`}>
                                        <TrendUp size={12} weight="bold" className={`${(revenueData?.trend_percentage || 0) < 0 ? "rotate-180" : ""}`} />
                                        {Math.abs(revenueData?.trend_percentage || 0)}%
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-primary mb-1">
                                    {isVenueOwner ? `LKR ${(revenueData?.total || 0).toLocaleString()}` : "—"}
                                </p>
                                <p className="text-muted text-sm">Total Revenue ({period})</p>
                            </div>

                            <div className="bg-surface-raised/40 border border-default rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <Calendar size={24} weight="fill" className="text-blue-500" />
                                    </div>
                                    <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <TrendUp size={12} weight="bold" /> --
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-primary mb-1">{stats?.today_bookings || 0}</p>
                                <p className="text-muted text-sm">Bookings Today</p>
                            </div>

                            <div className="bg-surface-raised/40 border border-default rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <Users size={24} weight="fill" className="text-purple-500" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-primary">{utilizationData?.overall_percentage || 0}%</p>
                                <p className="text-muted text-sm">Overall Utilization ({period})</p>
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-surface-raised/40 border border-default rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <ChartBar size={20} weight="bold" className="text-muted" /> Revenue Trend
                                </h3>
                                {isVenueOwner ? (
                                    chartData.length > 0 ? (
                                        <div className="h-64 flex items-end justify-between gap-2 px-2">
                                            {chartData.map((point: any, i: number) => {
                                                const maxVal = Math.max(...chartData.map((d: any) => d.amount));
                                                const heightPct = maxVal > 0 ? (point.amount / maxVal) * 100 : 0;
                                                return (
                                                    <div key={i} className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-sm relative group transition-colors flex flex-col justify-end" style={{ height: `100%` }}>
                                                        <div className="w-full bg-emerald-500/50 rounded-t-sm" style={{ height: `${Math.max(heightPct, 5)}%` }}></div>
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-base border border-default text-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                                                            LKR {point.amount.toLocaleString()}
                                                        </div>
                                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-muted text-[10px] whitespace-nowrap">
                                                            {(() => {
                                                                const d = parseISO(point.date);
                                                                return isValid(d) ? format(d, "MMM dd") : point.date;
                                                            })()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="h-64 flex items-center justify-center text-muted text-sm italic">
                                            No revenue data
                                        </div>
                                    )
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted text-sm">
                                        Access Restricted
                                    </div>
                                )}
                            </div>

                            <div className="bg-surface-raised/40 border border-default rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <ChartBar size={20} weight="bold" className="text-muted" /> Booking Status
                                </h3>
                                <div className="space-y-4">
                                    {utilizationData?.status_breakdown && utilizationData.status_breakdown.length > 0 ? (
                                        utilizationData.status_breakdown.map((slot, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs text-secondary mb-1">
                                                    <span>{slot.label}</span>
                                                    <span>{slot.percentage}% ({slot.hours} hours)</span>
                                                </div>
                                                <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${i < 1 ? "bg-emerald-500" : "bg-yellow-500"}`}
                                                        style={{ width: `${slot.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-40 flex items-center justify-center text-muted text-sm italic">
                                            No utilization data available
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </>
                )}

            </div>
        </main>
    );
}
