
"use client";

import { useEffect, useState } from "react";
import { Receipt, ArrowLeft, CircleNotch, CurrencyDollar, Wallet, TrendUp } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { AnalyticsFees } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { useRouter } from "next/navigation";

export default function FeesAnalyticsPage() {
    const { user, isVenueOwner } = useAuth();
    const { currentVenue } = useVenue();
    const router = useRouter();
    const { addToast } = useToast();

    const [data, setData] = useState<AnalyticsFees | null>(null);
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
            const response = await centerService.getFeesAnalytics(period, currentVenue.id);
            setData(response);
        } catch (error) {
            console.error(error);
            addToast("Failed to load fees data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;
    // RBAC: Only owners can view fees — silently hide for managers
    if (!isVenueOwner) return null;

    if (!currentVenue) return null;

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
                            <Receipt size={32} weight="fill" className="text-red-500" /> Fees &amp; Payouts
                        </h1>
                        <p className="text-secondary">Platform commissions and net earnings for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Net Payout — what The Arena owes the venue from online card payments */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm md:col-span-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Wallet size={24} weight="fill" className="text-emerald-500" />
                                        <p className="text-secondary font-medium">Net Payout</p>
                                    </div>
                                    <h2 className="text-5xl font-bold text-primary mb-2">LKR {(data?.net_payout || 0).toLocaleString()}</h2>
                                    <p className="text-muted text-sm">
                                        Amount owed to venue from online bookings this {period}
                                        {(data?.venue_commission || 0) > 0 && (data?.total_platform_revenue || 0) > 0 && (
                                            <span className="ml-2 text-faint">
                                                (after {Math.round(((data?.venue_commission || 0) / (data?.total_platform_revenue || 1)) * 100)}% commission deducted)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <Button disabled className="bg-surface-overlay text-muted font-bold cursor-not-allowed border border-subtle" title="Payout requests coming soon">
                                    Request Payout
                                </Button>
                            </div>
                        </div>

                        {/* Platform Revenue — booking value that flowed through the platform */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <TrendUp size={24} weight="bold" className="text-emerald-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-1">LKR {(data?.total_platform_revenue || 0).toLocaleString()}</h3>
                            <p className="text-muted text-sm">Platform Booking Revenue ({period})</p>
                            <p className="text-faint text-xs mt-1">Total court value from online bookings before deductions</p>
                        </div>

                        {/* Arena commission deducted from venue */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl">
                                    <Receipt size={24} weight="fill" className="text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-1">LKR {(data?.venue_commission || 0).toLocaleString()}</h3>
                            <p className="text-muted text-sm">Arena Commission ({period})</p>
                            <p className="text-faint text-xs mt-1">Platform commission deducted from your payout</p>
                        </div>

                        {/* Pending Payout — online paid but not yet settled */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <CurrencyDollar size={24} weight="fill" className="text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-1">LKR {(data?.pending_payout || 0).toLocaleString()}</h3>
                            <p className="text-muted text-sm">Pending Clearance</p>
                            <p className="text-faint text-xs mt-1">Earned but not yet transferred to your account</p>
                        </div>

                        {/* Booking Breakdown */}
                        <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-center md:col-span-3">
                            <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                                <Receipt size={20} weight="bold" className="text-muted" /> Booking Breakdown
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-surface-base/30 p-4 rounded-2xl border border-default/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-primary">Online Bookings</span>
                                        <span className="text-xs font-bold text-emerald-500">
                                            {data?.breakdown?.platform_bookings?.count || 0} Bookings
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted mb-2">Booked via player app/website (card payment)</p>
                                    <div className="flex justify-between text-xs text-secondary mb-1">
                                        <span>Arena Commission: LKR {(data?.venue_commission || 0).toLocaleString()}</span>
                                        <span>Net Payout: LKR {(data?.breakdown?.platform_bookings?.venue_payout || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="bg-surface-base/30 p-4 rounded-2xl border border-default/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-primary">Cash Walk-ins</span>
                                        <span className="text-xs font-bold text-blue-500">
                                            {data?.breakdown?.manual_bookings?.count || 0} Bookings
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted mb-2">Manual bookings added by venue staff (cash collected on-site)</p>
                                    <div className="flex justify-between text-xs text-secondary">
                                        <span>Cash Revenue: LKR {(data?.breakdown?.manual_bookings?.revenue || 0).toLocaleString()}</span>
                                        <span className="text-muted italic">Collected on-site</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}
