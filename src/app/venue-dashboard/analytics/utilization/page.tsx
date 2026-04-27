
"use client";

import { useEffect, useState } from "react";
import { Clock, BarChart2, ArrowLeft, Loader2, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { AnalyticsUtilization } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { useRouter } from "next/navigation";

export default function UtilizationAnalyticsPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const router = useRouter();
    const { addToast } = useToast();

    const [data, setData] = useState<AnalyticsUtilization | null>(null);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentVenue) {
            loadData();
        }
    }, [currentVenue, period]);

    const loadData = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const response = await centerService.getUtilizationAnalytics(period, currentVenue.id);
            setData(response);
        } catch (error) {
            console.error(error);
            addToast("Failed to load utilization data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || !currentVenue) return null;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.back()} className="text-secondary hover:text-primary pl-0">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analytics
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                            <Zap className="w-8 h-8 text-blue-500" /> Utilization Analytics
                        </h1>
                        <p className="text-secondary">Court usage and peak hours for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
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

                {isLoading && !data ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Overall Utilization Card */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted font-medium mb-1">Overall Utilization ({period})</p>
                                    <h2 className="text-4xl font-bold text-primary">{data?.overall_percentage || 0}%</h2>
                                </div>
                                <div className="w-24 h-24 relative flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * (data?.overall_percentage || 0) / 100)}
                                            className="text-blue-500 transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Booking Status Breakdown */}
                            <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-muted" /> Booking Status
                                </h3>
                                <div className="space-y-4">
                                    {data?.status_breakdown && data.status_breakdown.length > 0 ? (
                                        data.status_breakdown.map((slot, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs text-secondary mb-1">
                                                    <span className="font-medium text-primary">{slot.label}</span>
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
                                            No breakdown data available
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 pt-6 border-t border-default/50">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-secondary">Total Booked Hours</span>
                                        <span className="text-primary font-bold">{data?.total_booked_hours || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary">Total Available Hours</span>
                                        <span className="text-primary font-bold">{data?.total_available_hours || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Court Breakdown */}
                            <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-muted" /> By Court
                                </h3>
                                <div className="space-y-4">
                                    {data?.court_breakdown && data.court_breakdown.length > 0 ? (
                                        data.court_breakdown.map((court, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm font-medium text-primary mb-1">
                                                        <span>{court.court_name}</span>
                                                        <span>{court.percentage}%</span>
                                                    </div>
                                                    <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-emerald-500"
                                                            style={{ width: `${court.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-40 flex items-center justify-center text-muted text-sm italic">
                                            No court data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}
