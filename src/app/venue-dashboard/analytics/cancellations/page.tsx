
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CircleNotch, XCircle, UserMinus, Warning, Prohibit, WarningCircle } from "@phosphor-icons/react";
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
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px]" />
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
                            <XCircle size={32} weight="fill" className="text-red-500" /> Cancellations & No-Shows
                        </h1>
                        <p className="text-secondary">Booking cancellation stats for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Cancellation Count */}
                            <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-red-500/10 rounded-xl">
                                        <XCircle size={24} weight="fill" className="text-red-500" />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-bold text-primary mb-1">{data?.total_cancellations || 0}</h3>
                                <p className="text-muted text-sm">Total Cancellations ({period})</p>
                            </div>

                            {/* Cancellation Rate */}
                            <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-orange-500/10 rounded-xl">
                                        <Warning size={24} weight="fill" className="text-orange-500" />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-bold text-primary mb-1">{data?.cancellation_rate || 0}%</h3>
                                <p className="text-muted text-sm">Cancellation Rate</p>
                                <p className="text-xs text-faint mt-2">Percentage of total bookings cancelled.</p>
                            </div>

                            {/* No Shows */}
                            <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-surface-overlay rounded-xl">
                                        <UserMinus size={24} weight="fill" className="text-secondary" />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-bold text-primary mb-1">{data?.no_show_count || 0}</h3>
                                <p className="text-muted text-sm">No-Shows ({period})</p>
                                <p className="text-xs text-faint mt-2">Bookings where customer didn't arrive.</p>
                            </div>

                            {/* Rejected */}
                            <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-yellow-500/10 rounded-xl">
                                        <Prohibit size={24} weight="fill" className="text-yellow-500" />
                                    </div>
                                </div>
                                <h3 className="text-4xl font-bold text-primary mb-1">{data?.rejected_bookings || 0}</h3>
                                <p className="text-muted text-sm">Rejected Bookings</p>
                                <p className="text-xs text-faint mt-2">Unpaid holds that expired automatically.</p>
                            </div>

                        </div>

                        {/* Reasons Breakdown */}
                        {data?.cancellation_reasons && Object.keys(data.cancellation_reasons).length > 0 && (
                            <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                                    <WarningCircle size={20} weight="bold" className="text-muted" /> Cancellation Reasons
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(data.cancellation_reasons).map(([reason, count], i) => {
                                        const percentage = data.total_cancellations > 0 
                                            ? Math.round((count / data.total_cancellations) * 100) 
                                            : 0;
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-2 text-secondary">
                                                    <span className="capitalize">{reason.replace(/_/g, " ")}</span>
                                                    <span className="font-bold text-primary">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-red-500"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
