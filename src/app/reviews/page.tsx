"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Star, Trash2, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import { Review } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function MyReviewsPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            playerService.getMyReviews().then((data) => {
                setReviews(data);
                setIsLoading(false);
            }).catch(() => {
                setReviews([]);
                setIsLoading(false);
            });
        }
    }, [user]);

    const handleDelete = async (reviewId: string) => {
        try {
            await playerService.deleteReview(reviewId);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            addToast("Review deleted", "success");
        } catch {
            addToast("Failed to delete review", "error");
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-surface-base pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-primary mb-8">My Reviews</h1>

                <div className="space-y-4">
                    {isLoading ? (
                        [1, 2].map(i => <div key={i} className="h-32 bg-surface-raised/50 rounded-2xl animate-pulse" />)
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-surface-raised/50 border border-default rounded-2xl p-6 group">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface-overlay rounded-xl overflow-hidden">
                                            {review.venue_image ? (
                                                <img src={review.venue_image} alt={review.venue_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-surface-overlay"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-primary">{review.venue_name}</h3>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-faint"}`} />
                                                ))}
                                                <span className="text-xs text-muted ml-2">{format(new Date(review.created_at), "MMM dd, yyyy")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" className="text-secondary hover:text-red-400" onClick={() => handleDelete(review.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-surface-base/30 p-4 rounded-xl text-secondary text-sm leading-relaxed border border-default/50">
                                    "{review.comment}"
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-surface-raised/30 rounded-3xl border border-default">
                            <MessageSquare className="w-12 h-12 text-faint mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-primary mb-2">No reviews yet</h3>
                            <p className="text-muted mb-6">Book a court and share your experience!</p>
                            <Link href="/venues">
                                <Button className="bg-emerald-500 text-black font-bold">Explore Venues</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
