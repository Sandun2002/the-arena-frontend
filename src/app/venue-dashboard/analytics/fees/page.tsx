
"use client";

import { useEffect, useState } from "react";
import { Receipt, ArrowLeft, Loader2, DollarSign, Wallet } from "lucide-react";
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
    // RBAC: Only owners can view fee structure
    if (!isVenueOwner) {
        return (
            <main className="min-h-screen bg-black pt-24 px-4 flex items-center justify-center">
                <div className="text-zinc-500">Access Denied: Only venue owners can view fee analytics.</div>
            </main>
        );
    }

    if (!currentVenue) return null;

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
                            <Receipt className="w-8 h-8 text-red-500" /> Fees & Payouts
                        </h1>
                        <p className="text-zinc-400">Platform commissions and net earnings for <span className="text-emerald-500">{currentVenue.name}</span>.</p>
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

                        {/* Net Payout */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm md:col-span-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Wallet className="w-6 h-6 text-emerald-500" />
                                        <p className="text-zinc-400 font-medium">Net Payout</p>
                                    </div>
                                    <h2 className="text-5xl font-bold text-white mb-2">LKR {(data?.net_payout || 0).toLocaleString()}</h2>
                                    <p className="text-zinc-500 text-sm">Earnings after platform fees this {period}.</p>
                                </div>
                                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
                                    Request Payout
                                </Button>
                            </div>
                        </div>

                        {/* Platform Fees */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl">
                                    <Receipt className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">LKR {(data?.total_platform_fees || 0).toLocaleString()}</h3>
                            <p className="text-zinc-500 text-sm">Platform Fees ({period})</p>
                        </div>

                        {/* Pending Payout */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">LKR {(data?.pending_payout || 0).toLocaleString()}</h3>
                            <p className="text-zinc-500 text-sm">Pending Clearance</p>
                        </div>

                        {/* Info Card */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-center">
                            <h4 className="text-white font-bold mb-2">Fee Structure</h4>
                            <ul className="text-sm text-zinc-400 space-y-2">
                                <li className="flex justify-between">
                                    <span>Platform Commission</span>
                                    <span className="text-white">10%</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Processing Fee</span>
                                    <span className="text-white">2.5%</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}
