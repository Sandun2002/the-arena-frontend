
"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, BarChart2, ArrowLeft, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { AnalyticsRevenue } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

export default function RevenueAnalyticsPage() {
    const { user, isVenueOwner } = useAuth();
    const { currentVenue } = useVenue();
    const router = useRouter();
    const { addToast } = useToast();

    const [data, setData] = useState<AnalyticsRevenue | null>(null);
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
            const response = await centerService.getRevenueAnalytics(period, currentVenue.id);
            setData(response);
        } catch (error) {
            console.error(error);
            addToast("Failed to load revenue data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;
    // RBAC: Only owners can view revenue
    if (!isVenueOwner) {
        return (
            <main className="min-h-screen bg-black pt-24 px-4 flex items-center justify-center">
                <div className="text-zinc-500">Access Denied: Only venue owners can view revenue analytics.</div>
            </main>
        );
    }

    if (!currentVenue) return null;

    const chartData = data?.breakdown?.[period] || [];

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white pl-0">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analytics
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                            <DollarSign className="w-8 h-8 text-emerald-500" /> Revenue Analytics
                        </h1>
                        <p className="text-zinc-400">Detailed revenue breakdown for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${period === p
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                    } capitalization`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && !data ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500 font-medium mb-1">Total Revenue ({period})</p>
                                    <h2 className="text-4xl font-bold text-white">LKR {(data?.total || 0).toLocaleString()}</h2>
                                </div>
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${(data?.trend_percentage || 0) >= 0
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-red-500/10 text-red-500"
                                    }`}>
                                    <TrendingUp className={`w-5 h-5 ${(data?.trend_percentage || 0) < 0 ? "rotate-180" : ""}`} />
                                    <span className="font-bold text-lg">{Math.abs(data?.trend_percentage || 0)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-zinc-500" /> Revenue Trend
                            </h3>
                            {chartData.length > 0 ? (
                                <div className="h-80 flex items-end justify-between gap-4 px-2">
                                    {chartData.map((point: any, i: number) => {
                                        const maxVal = Math.max(...chartData.map((d: any) => d.amount));
                                        const heightPct = maxVal > 0 ? (point.amount / maxVal) * 100 : 0;

                                        return (
                                            <div key={i} className="w-full bg-emerald-500/10 hover:bg-emerald-500/30 rounded-t-lg relative group transition-colors flex flex-col justify-end" style={{ height: `100%` }}>
                                                <div className="w-full bg-emerald-500/60 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(heightPct, 2)}%` }}></div>

                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-xl">
                                                    <span className="font-bold">LKR {point.amount.toLocaleString()}</span>
                                                    <br />
                                                    <span className="text-zinc-400 text-[10px]">{format(parseISO(point.date), "MMM dd, yyyy")}</span>
                                                </div>
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-zinc-500 text-xs whitespace-nowrap">
                                                    {format(parseISO(point.date), "MMM dd")}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-zinc-500 italic">
                                    No data available for this period
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
