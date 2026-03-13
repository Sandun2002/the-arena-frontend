"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Send, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { api } from "@/services/api";
import { playerService } from "@/services/playerService";
import { useToast } from "@/components/ui/Toast";
import { Venue } from "@/types";

export default function ReviewPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { addToast } = useToast();
    const venueId = params.id as string;
    const bookingId = searchParams.get("bookingId");

    const [venue, setVenue] = useState<Venue | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.getVenueById(venueId).then((v) => setVenue(v || null)).catch(console.error);
    }, [venueId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            addToast("You must be logged in to review", "error");
            return;
        }
        if (rating === 0) {
            addToast("Please select a rating", "error");
            return;
        }
        if (!bookingId) {
            addToast("Reviews can only be submitted for completed bookings", "error");
            return;
        }

        setSubmitting(true);
        try {
            await playerService.createReview({ venueId, bookingId, rating, comment });
            addToast("Review submitted successfully!", "success");
            setTimeout(() => router.push(`/venues/${venueId}`), 1000);
        } catch (error) {
            addToast("Failed to submit review", "error");
            setSubmitting(false);
        }
    };

    if (!venue) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-2xl">

                <Link href={`/venues/${venueId}`} className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Venue
                </Link>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Review {venue.name}</h1>
                        <p className="text-zinc-500">Share your experience from a completed booking.</p>
                    </div>

                    {!bookingId && (
                        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                            A completed booking is required to submit a review. Open this page from your booking history once a booking is eligible.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Star Rating */}
                        <div className="flex flex-col items-center gap-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rate your experience</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-zinc-700"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-emerald-500 h-5">
                                {rating === 5 && "Excellent!"}
                                {rating === 4 && "Great!"}
                                {rating === 3 && "Good"}
                                {rating === 2 && "Fair"}
                                {rating === 1 && "Poor"}
                            </p>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Write a review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none placeholder:text-zinc-700"
                                placeholder="What did you like or dislike? How were the facilities?"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting || rating === 0 || !bookingId}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Submit Review
                        </Button>

                    </form>
                </div>
            </div>
        </main>
    );
}
