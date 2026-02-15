
import {
    User, Booking, Review, BookingStatus,
    ReviewStats, UserRole, Challenge, UserAchievement
} from "@/types";
import { MOCK_USERS, MOCK_BOOKINGS, MOCK_REVIEWS, MOCK_VENUES, MOCK_CHALLENGES, MOCK_ACHIEVEMENTS } from "./mockData";
import { format } from "date-fns";

// Simple UUID alternative for mock
const uuidv4 = () => Math.random().toString(36).substring(2, 15);

class PlayerService {

    // === Profile ===
    async getProfile(): Promise<User> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = MOCK_USERS[0];
                resolve(user);
            }, 500);
        });
    }

    async updateProfile(userId: string, data: Partial<User>): Promise<User> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...data, updated_at: new Date().toISOString() };
                    resolve(MOCK_USERS[userIndex]);
                } else {
                    resolve(MOCK_USERS[0]); // Fallback
                }
            }, 800);
        });
    }

    async updateAvatar(userId: string, file: File): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real app, this would upload to S3/Cloudinary and return URL
                // Here we just return a fake URL or blob URL
                const fakeUrl = URL.createObjectURL(file);
                const user = MOCK_USERS.find(u => u.id === userId);
                if (user) {
                    user.profile_image = fakeUrl;
                }
                resolve(fakeUrl);
            }, 1000);
        });
    }

    async changePassword(userId: string, current: string, newPw: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock validation
                if (current === "wrong") {
                    reject(new Error("Incorrect current password"));
                    return;
                }
                resolve(true);
            }, 800);
        });
    }

    // === Bookings ===
    async getBookings(userId: string): Promise<Booking[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const bookings = MOCK_BOOKINGS.filter(b => b.user_id === userId);
                resolve(bookings);
            }, 600);
        });
    }

    async getBookingById(bookingId: string): Promise<Booking | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                resolve(booking || null);
            }, 400);
        });
    }

    async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                if (booking) {
                    booking.status = "cancelled";
                    booking.cancellation_reason = reason;
                    booking.cancelled_at = new Date().toISOString();
                }
                resolve(true);
            }, 800);
        });
    }

    // === Reviews ===
    async getMyReviews(userId: string): Promise<Review[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reviews = MOCK_REVIEWS.filter(r => r.user_id === userId);
                resolve(reviews);
            }, 500);
        });
    }

    async checkReviewEligibility(userId: string, venueId: string): Promise<{ eligible: boolean; reason?: string }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const hasCompletedBooking = MOCK_BOOKINGS.some(
                    b => b.user_id === userId && b.court?.venue_id === venueId && b.status === "completed"
                );

                if (!hasCompletedBooking) {
                    resolve({ eligible: true, reason: "Mock: Always eligible for dev" }); // Relaxed for dev
                    // resolve({ eligible: false, reason: "You must complete a booking at this venue first." });
                    return;
                }

                const alreadyReviewed = MOCK_REVIEWS.some(
                    r => r.user_id === userId && r.venue_id === venueId
                );

                if (alreadyReviewed) {
                    resolve({ eligible: false, reason: "You have already reviewed this venue." });
                    return;
                }

                resolve({ eligible: true });
            }, 400);
        });
    }

    async createReview(data: { userId: string; venueId: string; rating: number; comment: string }): Promise<Review> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const venue = MOCK_VENUES.find(v => v.id === data.venueId);
                const user = MOCK_USERS.find(u => u.id === data.userId);

                const newReview: Review = {
                    id: `rev-${uuidv4()}`,
                    venue_id: data.venueId,
                    venue_name: venue?.name || "Unknown Venue",
                    venue_image: venue?.image || "",
                    user_id: data.userId,
                    user_name: user?.full_name || "Anonymous",
                    user_avatar: user?.profile_image || null,
                    rating: data.rating,
                    comment: data.comment,
                    created_at: new Date().toISOString()
                };

                MOCK_REVIEWS.push(newReview);
                resolve(newReview);
            }, 1000);
        });
    }

    // === Gamification ===
    async getChallenges(userId: string): Promise<{ challenges: Challenge[], achievements: UserAchievement[] }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userAchievements = MOCK_ACHIEVEMENTS.filter(ua => ua.user_id === userId);
                // Reduce achievements to associate with challenge data
                const enrichedAchievements = userAchievements.map(ua => ({
                    ...ua,
                    challenge: MOCK_CHALLENGES.find(c => c.id === ua.challenge_id)
                }));

                resolve({
                    challenges: MOCK_CHALLENGES,
                    achievements: enrichedAchievements
                });
            }, 600);
        });
    }

    // === Dashboard Stats ===
    async getStats(userId: string): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    bookings_completed: MOCK_BOOKINGS.filter(b => b.user_id === userId && b.status === 'completed').length,
                    hours_played: 24, // Mock
                    money_saved: 4500, // Mock
                    upcoming_count: MOCK_BOOKINGS.filter(b => b.user_id === userId && ['confirmed', 'payment_pending'].includes(b.status)).length
                });
            }, 500);
        });
    }
    async submitReview(userId: string, venueId: string, rating: number, comment: string): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const venue = MOCK_VENUES.find(v => v.id === venueId);
                const newReview: Review = {
                    id: `rv-${Math.random().toString(36).substring(7)}`,
                    venue_id: venueId,
                    venue_name: venue?.name || "Unknown Venue",
                    venue_image: venue?.image || "",
                    user_id: userId,
                    rating,
                    comment,
                    created_at: new Date().toISOString(),
                    user_name: MOCK_USERS.find(u => u.id === userId)?.full_name || "Anonymous",
                    user_avatar: MOCK_USERS.find(u => u.id === userId)?.profile_image || null
                };
                MOCK_REVIEWS.unshift(newReview);
                resolve(true);
            }, 800);
        });
    }
}

export const playerService = new PlayerService();
