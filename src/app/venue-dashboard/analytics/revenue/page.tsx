
"use client";

import { useEffect, useState } from "react";
import { CurrencyDollar, TrendUp, ChartBar, ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { AnalyticsRevenue } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { useRouter } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";

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
    // RBAC: Only owners can view revenue — silently hide for managers
    if (!isVenueOwner) return null;

    if (!currentVenue) return null;

    const chartData = data?.breakdown?.[period] || [];

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => router.back()} className="text-secondary hover:text-primary pl-0">
                        <ArrowLeft size={16} weight="bold" className="mr-2" /> Back to Analytics
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                            <CurrencyDollar size={32} weight="fill" className="text-emerald-500" /> Revenue Analytics
                        </h1>
                        <p className="text-secondary">Detailed revenue breakdown for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
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
                        <CircleNotch size={32} weight="bold" className="animate-spin text-muted" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted font-medium mb-1">Total Revenue ({period})</p>
                                    <h2 className="text-4xl font-bold text-primary">LKR {(data?.total || 0).toLocaleString()}</h2>
                                </div>
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${(data?.trend_percentage || 0) >= 0
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-red-500/10 text-red-500"
                                    }`}>
                                    <TrendUp size={20} weight="bold" className={`${(data?.trend_percentage || 0) < 0 ? "rotate-180" : ""}`} />
                                    <span className="font-bold text-lg">{Math.abs(data?.trend_percentage || 0)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                <ChartBar size={20} weight="bold" className="text-muted" /> Revenue Trend
                            </h3>
                            {chartData.length > 0 ? (
                                <div className="h-80 flex items-end justify-between gap-4 px-2">
                                    {chartData.map((point: any, i: number) => {
                                        const maxVal = Math.max(...chartData.map((d: any) => d.amount));
                                        const heightPct = maxVal > 0 ? (point.amount / maxVal) * 100 : 0;

                                        return (
                                            <div key={i} className="w-full bg-emerald-500/10 hover:bg-emerald-500/30 rounded-t-lg relative group transition-colors flex flex-col justify-end" style={{ height: `100%` }}>
                                                <div className="w-full bg-emerald-500/60 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(heightPct, 2)}%` }}></div>

                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-raised border border-subtle text-primary text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-xl">
                                                    <span className="font-bold">LKR {point.amount.toLocaleString()}</span>
                                                    <br />
                                                    <span className="text-secondary text-[10px]">
                                                        {(() => {
                                                            const d = parseISO(point.date);
                                                            return isValid(d) ? format(d, "MMM dd, yyyy") : point.date;
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-muted text-xs whitespace-nowrap">
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
                                <div className="h-80 flex items-center justify-center text-muted italic">
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
