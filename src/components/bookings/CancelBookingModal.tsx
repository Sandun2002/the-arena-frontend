"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface CancelBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
}

export default function CancelBookingModal({ isOpen, onClose, booking }: CancelBookingModalProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setReason("");
        }
    }, [isOpen]);

    if (!isOpen || !booking) return null;

    const handleConfirm = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>

                {!isSuccess ? (
                    <>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Cancel Booking?</h3>
                            <p className="text-zinc-400 text-sm">
                                Are you sure you want to cancel your booking at <span className="text-white font-bold">{booking.venue}</span> on <span className="text-white font-bold">{booking.date}</span>?
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <label className="block text-xs font-bold text-zinc-500 uppercase">Reason for Cancellation</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
                            >
                                <option value="" disabled>Select a reason</option>
                                <option value="change_of_plans">Change of plans</option>
                                <option value="weather">Weather conditions</option>
                                <option value="medical">Medical emergency</option>
                                <option value="other">Other</option>
                            </select>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-500 text-xs">
                                <strong>Note:</strong> Cancellations made less than 24 hours before the booking time may not be eligible for a full refund.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onClose} className="flex-1 border-zinc-700 hover:bg-zinc-800">Keep Booking</Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={!reason || isSubmitting}
                                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                            >
                                {isSubmitting ? "Cancelling..." : "Confirm Cancel"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center py-8">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-500 animate-scale-in">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Booking Cancelled</h3>
                        <p className="text-zinc-400 text-sm">Your booking has been successfully cancelled. A refund will be processed within 3-5 business days.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
