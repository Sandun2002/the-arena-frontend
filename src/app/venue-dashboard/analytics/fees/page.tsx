
"use client";

import { useEffect, useState, useRef } from "react";
import { 
    Receipt, ArrowLeft, CircleNotch, CurrencyDollar, Wallet, TrendUp,
    Money, ArrowClockwise, CheckCircle, XCircle, Clock, Warning, Upload, X, CalendarBlank
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { AnalyticsFees } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";
import { useRouter } from "next/navigation";
import {
  remittanceService,
  CashRemittance,
  VenueRemittanceSummary,
} from "@/services/remittanceService";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtLKR(amount: number) {
  return `LKR ${amount.toLocaleString("en-LK")}`;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: CashRemittance["status"] }) {
  const map: Record<CashRemittance["status"], { label: string; cls: string }> = {
    open: { label: "Open", cls: "bg-blue-500/15 text-blue-500" },
    submitted: { label: "Submitted", cls: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
    confirmed: { label: "Confirmed", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
    settled_via_card: { label: "Auto-Settled", cls: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  };
  const { label, cls } = map[status] ?? map.open;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// ─── Submit Modal ────────────────────────────────────────────────────────────

interface SubmitModalProps {
  remittance: CashRemittance;
  onClose: () => void;
  onSuccess: () => void;
}

function SubmitModal({ remittance, onClose, onSuccess }: SubmitModalProps) {
  const { addToast } = useToast();
  const [bankRef, setBankRef] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { addToast("Please attach a payment slip", "error"); return; }
    if (!bankRef.trim()) { addToast("Bank reference is required", "error"); return; }
    if (!transferDate) { addToast("Transfer date is required", "error"); return; }
    setSubmitting(true);
    try {
      await remittanceService.submit(remittance.id, {
        bank_reference: bankRef.trim(),
        transfer_date: transferDate,
        slip: file,
      });
      addToast("Payment submitted successfully", "success");
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to submit payment";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-base border border-default rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-default">
          <h2 className="text-lg font-bold text-primary">Submit Cash Payout</h2>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary */}
          <div className="bg-surface-raised rounded-xl p-4 space-y-1">
            <p className="text-xs text-muted">Reference</p>
            <p className="text-sm font-semibold text-primary">{remittance.remittance_reference}</p>
            <p className="text-xs text-muted mt-2">Period</p>
            <p className="text-sm text-secondary">
              {fmtDate(remittance.period_start)} — {fmtDate(remittance.period_end)}
            </p>
            <p className="text-xs text-muted mt-2">Amount Due</p>
            <p className="text-xl font-bold text-primary">{fmtLKR(remittance.total_amount)}</p>
          </div>

          {/* Rejection notice */}
          {remittance.status === "rejected" && remittance.rejection_reason && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Warning size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{remittance.rejection_reason}</p>
            </div>
          )}

          {/* Bank reference */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Bank / Transfer Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              placeholder="e.g. TRN-20260506-001"
              className="w-full rounded-xl border border-default bg-surface-raised px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Transfer date */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Transfer Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="w-full rounded-xl border border-default bg-surface-raised px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Slip upload */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Payment Slip <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-default hover:border-emerald-500 transition-colors py-6 flex flex-col items-center gap-2 text-muted hover:text-secondary bg-surface-raised"
            >
              <Upload size={24} className={file ? "text-emerald-500" : ""} />
              <span className="text-sm">
                {file ? file.name : "Click to upload JPG, PNG, WebP or PDF (max 10 MB)"}
              </span>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FeesAnalyticsPage() {
    const { user, isVenueOwner } = useAuth();
    const { currentVenue } = useVenue();
    const router = useRouter();
    const { addToast } = useToast();

    // Tabs
    const [activeTab, setActiveTab] = useState<'overview' | 'remittances'>('overview');

    // Analytics State
    const [data, setData] = useState<AnalyticsFees | null>(null);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    // Remittances State
    const [summary, setSummary] = useState<VenueRemittanceSummary | null>(null);
    const [items, setItems] = useState<CashRemittance[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [loadingRemittances, setLoadingRemittances] = useState(false);
    const [selectedRemittance, setSelectedRemittance] = useState<CashRemittance | null>(null);

    const PER_PAGE = 10;

    // Load Analytics
    useEffect(() => {
        if (currentVenue && activeTab === 'overview') {
            loadAnalytics();
        }
    }, [currentVenue, period, activeTab]);

    const loadAnalytics = async () => {
        if (!currentVenue) return;
        setIsLoadingAnalytics(true);
        try {
            const response = await centerService.getFeesAnalytics(period, currentVenue.id);
            setData(response);
        } catch (error) {
            console.error(error);
            addToast("Failed to load fees data", "error");
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    // Load Remittances
    const loadRemittances = async () => {
        if (!currentVenue) return;
        setLoadingRemittances(true);
        try {
            const [sumRes, listRes] = await Promise.all([
                remittanceService.getSummary(currentVenue.id),
                remittanceService.list(currentVenue.id, {
                    status: statusFilter || undefined,
                    page,
                    per_page: PER_PAGE,
                }),
            ]);
            setSummary(sumRes);
            setItems(listRes.items);
            setTotal(listRes.total);
        } catch {
            addToast("Failed to load cash payouts", "error");
        } finally {
            setLoadingRemittances(false);
        }
    };

    useEffect(() => {
        if (currentVenue && activeTab === 'remittances') {
            loadRemittances();
        }
    }, [currentVenue, page, statusFilter, activeTab]);

    if (!user) return null;
    if (!isVenueOwner) return null;
    if (!currentVenue) return null;

    const totalPages = Math.ceil(total / PER_PAGE);

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4 relative">
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

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-default pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                            <Receipt size={32} weight="fill" className="text-emerald-500" /> Fees &amp; Payouts
                        </h1>
                        <p className="text-secondary">Platform commissions, net earnings, and cash payouts for <span className="text-emerald-500 font-medium">{currentVenue.name}</span>.</p>
                    </div>

                    <div className="flex p-1 bg-surface-raised rounded-xl border border-default">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                activeTab === 'overview'
                                    ? "bg-surface-overlay text-primary shadow-sm"
                                    : "text-muted hover:text-secondary"
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('remittances')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                activeTab === 'remittances'
                                    ? "bg-surface-overlay text-primary shadow-sm"
                                    : "text-muted hover:text-secondary"
                            }`}
                        >
                            Cash Payouts
                            {summary && summary.open_count > 0 && activeTab !== 'remittances' && (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end mb-6">
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

                        {isLoadingAnalytics && !data ? (
                            <div className="h-64 flex items-center justify-center">
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
                                <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
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
                                <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm hover:border-red-500/30 transition-colors">
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
                                <div className="bg-surface-raised/40 border border-default rounded-3xl p-8 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Card (online) bookings */}
                                        <div className="bg-surface-base/30 p-4 rounded-2xl border border-default/50">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-primary">Card Bookings</span>
                                                <span className="text-xs font-bold text-emerald-500">
                                                    {data?.breakdown?.card_bookings?.count || 0} Bookings
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted mb-2">Online bookings paid by card through the player app</p>
                                            <div className="flex justify-between text-xs text-secondary mb-1">
                                                <span>Commission: LKR {(data?.breakdown?.card_bookings?.venue_commission || 0).toLocaleString()}</span>
                                                <span>Net Payout: LKR {(data?.breakdown?.card_bookings?.venue_payout || 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Cash (Pay at Venue) bookings */}
                                        <div className="bg-surface-base/30 p-4 rounded-2xl border border-yellow-500/20">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-primary">Pay at Venue</span>
                                                <span className="text-xs font-bold text-yellow-500">
                                                    {data?.breakdown?.cash_bookings?.count || 0} Bookings
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted mb-2">Cash reservations — commission deducted from next card payout</p>
                                            <div className="flex justify-between text-xs text-secondary">
                                                <span>Collected: {data?.breakdown?.cash_bookings?.collected_count || 0} / {data?.breakdown?.cash_bookings?.count || 0}</span>
                                                <span className="text-yellow-500">LKR {(data?.breakdown?.cash_bookings?.collected_revenue || 0).toLocaleString()} in</span>
                                            </div>
                                        </div>

                                        {/* Manual (walk-in) bookings */}
                                        <div className="bg-surface-base/30 p-4 rounded-2xl border border-default/50">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-primary">Walk-in Bookings</span>
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
                )}

                {activeTab === 'remittances' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 mt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-primary">Cash Payouts</h2>
                                <p className="text-sm text-muted mt-0.5">
                                    Pay your weekly cash commission to Arena.lk
                                </p>
                            </div>
                            <button
                                onClick={loadRemittances}
                                disabled={loadingRemittances}
                                className="p-2 rounded-xl bg-surface-raised border border-default hover:bg-surface-overlay transition-colors text-muted hover:text-primary disabled:opacity-40"
                            >
                                <ArrowClockwise size={20} className={loadingRemittances ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {/* Summary cards */}
                        {summary && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-surface-raised border border-default rounded-2xl p-4 relative overflow-hidden hover:border-emerald-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Money size={48} weight="fill" className="text-primary" />
                                    </div>
                                    <p className="text-xs text-muted mb-1 relative z-10">Balance Owed</p>
                                    <p className="text-2xl font-bold text-primary relative z-10">{fmtLKR(summary.cash_commission_balance)}</p>
                                </div>
                                <div className="bg-surface-raised border border-default rounded-2xl p-4 hover:border-blue-500/30 transition-colors">
                                    <p className="text-xs text-muted mb-1">Open Batches</p>
                                    <p className="text-xl font-bold text-blue-500">{summary.open_count}</p>
                                    <p className="text-xs text-muted">{fmtLKR(summary.open_total)}</p>
                                </div>
                                <div className="bg-surface-raised border border-default rounded-2xl p-4 hover:border-yellow-500/30 transition-colors">
                                    <p className="text-xs text-muted mb-1">Submitted</p>
                                    <p className="text-xl font-bold text-yellow-500">{summary.submitted_count}</p>
                                    <p className="text-xs text-muted">{fmtLKR(summary.submitted_total)}</p>
                                </div>
                                <div className="bg-surface-raised border border-default rounded-2xl p-4 hover:border-emerald-500/30 transition-colors">
                                    <p className="text-xs text-muted mb-1">Confirmed</p>
                                    <p className="text-xl font-bold text-emerald-500">{summary.confirmed_count}</p>
                                    <p className="text-xs text-muted">{fmtLKR(summary.confirmed_total)}</p>
                                </div>
                            </div>
                        )}

                        {/* How it works */}
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex gap-4 items-start">
                            <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                                <Clock size={24} weight="fill" className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-blue-500 mb-2">How cash payouts work</p>
                                <ol className="text-xs text-secondary space-y-1.5 list-decimal list-inside">
                                    <li>Every Monday, your previous week's cash commission is grouped into a batch.</li>
                                    <li>Transfer the amount to our bank account and upload your slip here.</li>
                                    <li>Our team will confirm receipt within 1–2 business days.</li>
                                </ol>
                            </div>
                        </div>

                        {/* Filter bar */}
                        <div className="flex gap-2 flex-wrap">
                            {(["", "open", "submitted", "confirmed", "rejected"] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setStatusFilter(s); setPage(1); }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
                                        statusFilter === s
                                            ? "bg-surface-overlay border-emerald-500/50 text-emerald-500 shadow-sm"
                                            : "bg-surface-raised border-default text-muted hover:text-primary"
                                    }`}
                                >
                                    {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="bg-surface-raised border border-default rounded-2xl overflow-hidden shadow-sm">
                            {loadingRemittances ? (
                                <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
                                    <ArrowClockwise size={18} className="animate-spin" /> Loading…
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
                                    <Money size={48} weight="thin" className="opacity-50" />
                                    <p className="text-sm">No cash payouts found</p>
                                    {statusFilter && (
                                        <button onClick={() => setStatusFilter("")} className="text-xs text-emerald-500 hover:underline">
                                            Clear filter
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-default text-xs text-muted uppercase tracking-wider bg-surface-base/50">
                                                <th className="px-5 py-4 text-left font-semibold">Reference</th>
                                                <th className="px-5 py-4 text-left font-semibold">Period</th>
                                                <th className="px-5 py-4 text-right font-semibold">Amount</th>
                                                <th className="px-5 py-4 text-center font-semibold">Bookings</th>
                                                <th className="px-5 py-4 text-center font-semibold">Status</th>
                                                <th className="px-5 py-4 text-right font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((r) => (
                                                <tr key={r.id} className="border-b border-default/50 hover:bg-surface-overlay/50 transition-colors">
                                                    <td className="px-5 py-4 font-mono text-xs text-secondary">{r.remittance_reference}</td>
                                                    <td className="px-5 py-4 text-xs text-secondary">
                                                        <div className="flex items-center gap-1.5">
                                                            <CalendarBlank size={14} className="text-muted" />
                                                            {fmtDate(r.period_start)} — {fmtDate(r.period_end)}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-bold text-primary">{fmtLKR(r.total_amount)}</td>
                                                    <td className="px-5 py-4 text-center text-secondary">{r.total_bookings}</td>
                                                    <td className="px-5 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            <StatusBadge status={r.status} />
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        {(r.status === "open" || r.status === "rejected") && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => setSelectedRemittance(r)}
                                                            >
                                                                Pay Now
                                                            </Button>
                                                        )}
                                                        {r.status === "submitted" && (
                                                            <span className="text-xs text-yellow-500 flex items-center gap-1 justify-end font-medium">
                                                                <Clock size={14} /> Pending
                                                            </span>
                                                        )}
                                                        {r.status === "confirmed" && (
                                                            <span className="text-xs text-emerald-500 flex items-center gap-1 justify-end font-medium">
                                                                <CheckCircle size={14} weight="fill" /> Paid
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t border-default text-xs text-muted bg-surface-base/50">
                                    <span>Page <span className="font-medium text-secondary">{page}</span> of {totalPages}</span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                            className="px-4 py-1.5 rounded-lg border border-default disabled:opacity-30 hover:bg-surface-overlay hover:text-primary transition-colors font-medium"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={page === totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-4 py-1.5 rounded-lg border border-default disabled:opacity-30 hover:bg-surface-overlay hover:text-primary transition-colors font-medium"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Submit modal */}
            {selectedRemittance && (
                <SubmitModal
                    remittance={selectedRemittance}
                    onClose={() => setSelectedRemittance(null)}
                    onSuccess={() => { setSelectedRemittance(null); loadRemittances(); }}
                />
            )}
        </main>
    );
}
