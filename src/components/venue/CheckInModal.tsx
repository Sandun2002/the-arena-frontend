"use client";

import { useState } from "react";
import { CircleNotch, CheckCircle, WarningCircle, ShieldCheck } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { centerService } from "@/services/centerService";
import { useToast } from "@/components/ui/Toast";

interface CheckInModalProps {
    venueId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CheckInModal({ venueId, onClose, onSuccess }: CheckInModalProps) {
    const { addToast } = useToast();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<any | null>(null);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (val.length <= 5) {
            setCode(val);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 5) {
            setError("Check-in code must be exactly 5 alphanumeric characters");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await centerService.checkInByCode(code, venueId);
            setSuccessData(data);
            addToast("Player checked in successfully!", "success");
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || err.message || "Invalid check-in code";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setCode("");
        setError(null);
        setSuccessData(null);
    };

    return (
        <div className="space-y-6">
            {!successData ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-secondary mb-4">
                            Enter the 5-digit check-in code shown on the player's booking page to confirm their arrival.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <input
                                type="text"
                                value={code}
                                onChange={handleCodeChange}
                                placeholder="XXXXX"
                                className="w-56 text-center text-4xl font-mono font-black tracking-[0.3em] uppercase bg-surface-base border-2 border-subtle focus:border-emerald-500 rounded-2xl py-4 text-primary placeholder:text-muted focus:outline-none transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 justify-center text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                                <WarningCircle size={16} weight="fill" className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-default">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-secondary hover:text-primary hover:bg-surface-raised transition-all border border-transparent"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={isLoading || code.length !== 5}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-xl"
                        >
                            {isLoading ? (
                                <CircleNotch size={18} weight="bold" className="animate-spin" />
                            ) : (
                                "Verify Arrival"
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    {/* Success verified banner */}
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.05)] animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-500 text-black rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            <ShieldCheck size={36} weight="bold" />
                        </div>
                        <h3 className="text-xl font-black text-emerald-400 uppercase tracking-wide">Player Arrived!</h3>
                        <p className="text-xs text-secondary mt-1">Arrival verified and marked successfully.</p>
                    </div>

                    {/* Booking Details Card */}
                    <div className="bg-surface-base border border-default p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-start border-b border-default/50 pb-3">
                            <div>
                                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Booking Reference</span>
                                <span className="text-sm font-mono text-primary font-bold">{successData.booking.booking_reference}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Code Verified</span>
                                <span className="text-xs text-emerald-500 font-bold tracking-wide uppercase">Active Check-In</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Player Name</span>
                                <span className="font-bold text-primary">{successData.booking.user?.full_name || successData.booking.customer_name || "Guest"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Phone Number</span>
                                <span className="text-secondary font-medium">{successData.booking.user?.phone_number || successData.booking.customer_phone || "—"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Court</span>
                                <span className="font-bold text-primary">{successData.booking.court?.name || "—"}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-0.5">Sport</span>
                                <span className="text-secondary font-medium capitalize">{successData.booking.court?.sport_type?.name || "—"}</span>
                            </div>
                        </div>

                        <div className="border-t border-default/50 pt-3">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Booked Time Slot</span>
                            <div className="flex justify-between items-center bg-surface-raised/40 p-3 rounded-xl border border-default">
                                <span className="text-xs text-primary font-bold">
                                    {new Date(successData.booking.start_time).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2..5 py-1 rounded-md border border-emerald-500/20 font-mono">
                                    {new Date(successData.booking.start_time).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })} - {new Date(successData.booking.end_time).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-default">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-secondary hover:text-primary hover:bg-surface-raised transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm transition-all"
                        >
                            Check In Another Player
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
