// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { playerService } from "@/services/playerService";
import { useAuth } from "@/services/authContext";
import { useToast } from "@/components/ui/Toast";

interface ReviewFormModalProps {
    venueId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReviewFormModal({ venueId, onClose, onSuccess }: ReviewFormModalProps) {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check Eligibility on mount
    useEffect(() => {
        const checkEligibility = async () => {
            if (!user) return;
            const result = await playerService.checkReviewEligibility(user.id, venueId);
            if (!result.eligible) {
                setError(result.reason || "You cannot review this venue.");
            }
            setIsChecking(false);
        };
        checkEligibility();
    }, [user, venueId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            addToast("Please give a rating", "warning");
            return;
        }
        if (!user) return;

        setIsSubmitting(true);
        try {
            await playerService.createReview({
                userId: user.id,
                venueId,
                rating,
                comment
            });
            addToast("Review submitted successfully", "success");
            onSuccess();
            onClose();
        } catch (error) {
            addToast("Failed to submit review", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isChecking) {
        return <div className="p-8 text-center text-zinc-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Checking eligibility...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-400 font-bold mb-1">Cannot Submit Review</p>
                <p className="text-red-200/70 text-sm mb-4">{error}</p>
                <Button variant="ghost" onClick={onClose} className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">Close</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <p className="text-zinc-400 text-sm mb-4">How was your experience?</p>
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`w-8 h-8 ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Comment (Optional)</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us what you liked..."
                />
            </div>

            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Review"}
            </Button>
        </div>
    );
}
