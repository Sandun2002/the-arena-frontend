"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Booking } from "@/types";

interface CancelBookingModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const CANCELLATION_REASONS = [
    "Schedule conflict",
    "Weather concerns",
    "Found another venue",
    "Personal emergency",
    "Booking error",
    "Other"
];

export default function CancelBookingModal({ booking, isOpen, onClose, onConfirm }: CancelBookingModalProps) {
    const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !booking) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        onConfirm(selectedReason);
        setIsSubmitting(false);
        setSelectedReason(CANCELLATION_REASONS[0]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
                        Cancel <span className="text-red-500">Booking</span>
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        Are you sure you want to cancel this booking?
                    </p>
                </div>

                {/* Booking Details */}
                <div className="mb-8 p-6 rounded-xl bg-black/40 border border-zinc-800">
                    <h3 className="text-lg font-bold text-white mb-4">{booking.court?.venue_name || 'Arena Venue'}</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Date</span>
                            <span className="text-white font-bold">{new Date(booking.start_time).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Time</span>
                            <span className="text-white font-bold">{`${new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Amount</span>
                            <span className="text-emerald-400 font-bold">LKR {(booking.total_price || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Cancellation Reason */}
                <div className="mb-8">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                        Reason for Cancellation
                    </label>
                    <select
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-red-500/50 focus:outline-none transition-colors"
                    >
                        {CANCELLATION_REASONS.map((reason) => (
                            <option key={reason} value={reason}>
                                {reason}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Refund Policy */}
                <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Refund Policy
                    </p>
                    <p className="text-yellow-200/80 text-sm">
                        Full refund if cancelled <span className="font-bold">24 hours</span> before booking time.
                        50% refund if cancelled within 24 hours.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Keep Booking
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                    >
                        {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}
