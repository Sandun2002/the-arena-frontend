
"use client";

import { useEffect, useState } from "react";
import { XCircle, ArrowLeft, Loader2, AlertTriangle, UserX } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { AnalyticsCancellations } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { useRouter } from "next/navigation";

export default function CancellationsAnalyticsPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const router = useRouter();
    const { addToast } = useToast();

    const [data, setData] = useState<AnalyticsCancellations | null>(null);
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
            const response = await centerService.getCancellationAnalytics(period, currentVenue.id);
            setData(response);
        } catch (error) {
            console.error(error);
            addToast("Failed to load cancellation data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || !currentVenue) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px]" />
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
                            <XCircle className="w-8 h-8 text-red-500" /> Cancellations & No-Shows
                        </h1>
                        <p className="text-zinc-400">Booking cancellation stats for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Cancellation Count */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl">
                                    <XCircle className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-1">{data?.total_cancellations || 0}</h3>
                            <p className="text-zinc-500 text-sm">Total Cancellations ({period})</p>
                        </div>

                        {/* Cancellation Rate */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-1">{data?.cancellation_rate || 0}%</h3>
                            <p className="text-zinc-500 text-sm">Cancellation Rate</p>
                            <p className="text-xs text-zinc-600 mt-2">Percentage of total bookings cancelled.</p>
                        </div>

                        {/* No Shows */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-zinc-800 rounded-xl">
                                    <UserX className="w-6 h-6 text-zinc-400" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-1">{data?.no_show_count || 0}</h3>
                            <p className="text-zinc-500 text-sm">No-Shows ({period})</p>
                            <p className="text-xs text-zinc-600 mt-2">Bookings where customer didn't arrive.</p>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}
