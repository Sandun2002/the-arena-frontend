
"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Booking } from "@/types";
import { playerService } from "@/services/playerService";
import { useToast } from "@/components/ui/Toast";

interface CancelBookingModalProps {
    booking: Booking;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CancelBookingModal({ booking, onClose, onSuccess }: CancelBookingModalProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const handleConfirm = async () => {
        if (!reason) {
            addToast("Please select a reason", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            await playerService.cancelBooking(booking.id, reason);
            addToast("Booking cancelled successfully", "success");
            onSuccess();
            onClose();
        } catch (error) {
            addToast("Failed to cancel booking", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-sm font-bold text-red-500 mb-1">Cancellation Policy</h3>
                    <p className="text-xs text-red-200/70 leading-relaxed">
                        Cancellations made less than 24 hours before the booking time may not be eligible for a full refund.
                        Please check the venue&apos;s policy for more details.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-bold text-secondary uppercase">Reason for Cancellation</label>
                <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-surface-base/50 border border-subtle rounded-xl px-4 py-3 text-primary focus:border-emerald-500 focus:outline-none transition-colors appearance-none"
                >
                    <option value="" disabled>Select a reason...</option>
                    <option value="Change of plans">Change of plans</option>
                    <option value="Found another venue">Found another venue</option>
                    <option value="Duplicate booking">Duplicate booking</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-default">
                <Button variant="ghost" onClick={onClose} className="flex-1">Keep Booking</Button>
                <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-primary border-none"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancellation"}
                </Button>
            </div>
        </div>
    );
}
