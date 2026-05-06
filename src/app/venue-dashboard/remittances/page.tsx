"use client";

import { useEffect, useState, useRef } from "react";
import {
  Money, ArrowLeft, ArrowClockwise, CheckCircle,
  XCircle, Clock, Warning, Upload, X, CalendarBlank,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useVenue } from "@/components/venue/VenueContext";
import { useToast } from "@/components/ui/Toast";
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
    open: { label: "Open", cls: "bg-blue-500/15 text-blue-400" },
    submitted: { label: "Submitted", cls: "bg-yellow-500/15 text-yellow-400" },
    confirmed: { label: "Confirmed", cls: "bg-green-500/15 text-green-400" },
    rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-400" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-default rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-default">
          <h2 className="text-lg font-bold text-primary">Submit Cash Payout</h2>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary */}
          <div className="bg-surface-overlay rounded-xl p-4 space-y-1">
            <p className="text-xs text-muted">Reference</p>
            <p className="text-sm font-semibold text-primary">{remittance.remittance_reference}</p>
            <p className="text-xs text-muted mt-2">Period</p>
            <p className="text-sm text-secondary">
              {fmtDate(remittance.period_start)} — {fmtDate(remittance.period_end)}
            </p>
            <p className="text-xs text-muted mt-2">Amount Due</p>
            <p className="text-xl font-bold text-accent">{fmtLKR(remittance.total_amount)}</p>
          </div>

          {/* Rejection notice */}
          {remittance.status === "rejected" && remittance.rejection_reason && (
            <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Warning size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">{remittance.rejection_reason}</p>
            </div>
          )}

          {/* Bank reference */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Bank / Transfer Reference <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              placeholder="e.g. TRN-20260506-001"
              className="w-full rounded-xl border border-default bg-surface px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Transfer date */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Transfer Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="w-full rounded-xl border border-default bg-surface px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>

          {/* Slip upload */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Payment Slip <span className="text-red-400">*</span>
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
              className="w-full rounded-xl border-2 border-dashed border-default hover:border-accent transition-colors py-6 flex flex-col items-center gap-2 text-muted hover:text-secondary"
            >
              <Upload size={24} />
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

export default function RemittancesPage() {
  const { currentVenue } = useVenue();
  const router = useRouter();
  const { addToast } = useToast();

  const [summary, setSummary] = useState<VenueRemittanceSummary | null>(null);
  const [items, setItems] = useState<CashRemittance[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedRemittance, setSelectedRemittance] = useState<CashRemittance | null>(null);

  const PER_PAGE = 10;

  const load = async () => {
    if (!currentVenue) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentVenue, page, statusFilter]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-background text-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-surface-overlay transition-colors text-muted hover:text-primary"
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Cash Payouts</h1>
            <p className="text-sm text-muted mt-0.5">
              Pay your weekly cash commission to Arena.lk
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="ml-auto p-2 rounded-xl hover:bg-surface-overlay transition-colors text-muted hover:text-primary disabled:opacity-40"
          >
            <ArrowClockwise size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-surface border border-default rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">Balance Owed</p>
              <p className="text-xl font-bold text-accent">{fmtLKR(summary.cash_commission_balance)}</p>
            </div>
            <div className="bg-surface border border-default rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">Open Batches</p>
              <p className="text-xl font-bold text-blue-400">{summary.open_count}</p>
              <p className="text-xs text-muted">{fmtLKR(summary.open_total)}</p>
            </div>
            <div className="bg-surface border border-default rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">Submitted</p>
              <p className="text-xl font-bold text-yellow-400">{summary.submitted_count}</p>
              <p className="text-xs text-muted">{fmtLKR(summary.submitted_total)}</p>
            </div>
            <div className="bg-surface border border-default rounded-2xl p-4">
              <p className="text-xs text-muted mb-1">Confirmed</p>
              <p className="text-xl font-bold text-green-400">{summary.confirmed_count}</p>
              <p className="text-xs text-muted">{fmtLKR(summary.confirmed_total)}</p>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
          <p className="text-sm font-semibold text-blue-400 mb-2">How cash payouts work</p>
          <ol className="text-xs text-blue-300 space-y-1 list-decimal list-inside">
            <li>Every Monday, your previous week's cash commission is grouped into a batch.</li>
            <li>Transfer the amount to our bank account and upload your slip here.</li>
            <li>Our team will confirm receipt within 1–2 business days.</li>
          </ol>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 flex-wrap">
          {(["", "open", "submitted", "confirmed", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                statusFilter === s
                  ? "bg-accent/20 border-accent text-accent"
                  : "border-default text-muted hover:text-primary hover:border-primary/40"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface border border-default rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
              <ArrowClockwise size={18} className="animate-spin" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
              <Money size={40} weight="thin" />
              <p className="text-sm">No cash payouts found</p>
              {statusFilter && (
                <button onClick={() => setStatusFilter("")} className="text-xs text-accent hover:underline">
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default text-xs text-muted uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Reference</th>
                    <th className="px-5 py-3 text-left">Period</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-center">Bookings</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-b border-default/50 hover:bg-surface-overlay/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-secondary">{r.remittance_reference}</td>
                      <td className="px-5 py-3.5 text-xs text-secondary">
                        <div className="flex items-center gap-1.5">
                          <CalendarBlank size={12} className="text-muted" />
                          {fmtDate(r.period_start)} — {fmtDate(r.period_end)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-primary">{fmtLKR(r.total_amount)}</td>
                      <td className="px-5 py-3.5 text-center text-secondary">{r.total_bookings}</td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex justify-center">
                          <StatusBadge status={r.status} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {(r.status === "open" || r.status === "rejected") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRemittance(r)}
                          >
                            Pay Now
                          </Button>
                        )}
                        {r.status === "submitted" && (
                          <span className="text-xs text-yellow-400 flex items-center gap-1 justify-end">
                            <Clock size={12} /> Pending review
                          </span>
                        )}
                        {r.status === "confirmed" && (
                          <span className="text-xs text-green-400 flex items-center gap-1 justify-end">
                            <CheckCircle size={12} weight="fill" /> Done
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
            <div className="flex items-center justify-between px-5 py-3 border-t border-default text-xs text-muted">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded-lg border border-default disabled:opacity-30 hover:border-primary/40 transition-colors"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded-lg border border-default disabled:opacity-30 hover:border-primary/40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit modal */}
      {selectedRemittance && (
        <SubmitModal
          remittance={selectedRemittance}
          onClose={() => setSelectedRemittance(null)}
          onSuccess={() => { setSelectedRemittance(null); load(); }}
        />
      )}
    </div>
  );
}
