import { User, Booking, Review, Challenge, UserAchievement } from "@/types";
import apiClient from "./apiClient";
import { normalizeBooking, normalizeReview, normalizeUser } from "./normalizers";

class PlayerService {
    // === Profile ===
    async getProfile(): Promise<User> {
        const response = await apiClient.get<User>('/player/profile');
        return normalizeUser(response.data);
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await apiClient.put<User>('/player/profile', {
            full_name: data.full_name,
            phone_number: data.phone_number,
            bio: data.bio
        });
        return normalizeUser(response.data);
    }

    async updateAvatar(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<{ url: string }>('/player/avatar', formData);
        return response.data.url;
    }

    async changePassword(current: string, newPw: string): Promise<boolean> {
        await apiClient.put('/player/password', {
            current_password: current,
            new_password: newPw
        });
        return true;
    }

    // === Bookings ===
    async getBookings(): Promise<Booking[]> {
        const response = await apiClient.get<any[]>('/bookings/me');
        return response.data.map(normalizeBooking);
    }

    async getBookingById(bookingId: string): Promise<Booking> {
        const response = await apiClient.get<any>(`/bookings/${bookingId}`);
        return normalizeBooking(response.data);
    }

    async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
        await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
        return true;
    }

    // === Reviews ===
    async getMyReviews(): Promise<Review[]> {
        const response = await apiClient.get<any>('/me/reviews');
        return (response.data.reviews || []).map((review: any) => normalizeReview(review));
    }

    async createReview(data: { venueId: string; bookingId: string; rating: number; comment: string; title?: string }): Promise<Review> {
        const response = await apiClient.post<Review>(`/venues/${data.venueId}/reviews`, {
            booking_id: data.bookingId,
            rating: data.rating,
            title: data.title,
            comment: data.comment
        });
        return normalizeReview(response.data);
    }

    async checkReviewEligibility(userId: string, venueId: string): Promise<{ eligible: boolean; reason?: string }> {
        const response = await apiClient.get(`/venues/${venueId}/reviews/eligibility`);
        return response.data;
    }

    async deleteReview(reviewId: string): Promise<void> {
        await apiClient.delete(`/reviews/${reviewId}`);
    }

    // === Gamification ===
    async getChallenges(): Promise<{ challenges: Challenge[], achievements: UserAchievement[] }> {
        const response = await apiClient.get<any>('/player/challenges');
        const rawChallenges = response.data.challenges || [];

        // Fallback: infer category from challenge_type when backend meta is null
        const TYPE_TO_CAT: Record<string, string> = {
            weekly_bookings: "weekly",
            multi_sport: "explorer", multi_venue: "explorer", multi_city: "explorer",
            venue_loyalty: "loyalty",
            streak: "streak",
            peak_hour: "timing", off_peak: "timing", night_owl: "timing", early_bird: "timing",
            total_bookings: "milestone", total_hours: "milestone",
        };
        
        const challenges: Challenge[] = rawChallenges.map((c: any) => {
            const cat = (c.category && c.category !== "general")
                ? c.category
                : (TYPE_TO_CAT[c.challenge_type] || "general");
            return {
                id: c.id,
                slug: c.slug || "",
                title: c.name,
                description: c.description,
                xp_reward: c.xp_reward,
                icon: c.icon || "🏆",
                type: cat,
                category: cat,
                target_count: c.target_value,
                is_permanent: c.is_permanent ?? false,
            };
        });

        const achievements: UserAchievement[] = rawChallenges.map((c: any) => ({
            id: `ach_${c.id}`,
            user_id: "",
            challenge_id: c.id,
            progress: c.current_progress,
            is_completed: c.is_completed,
            completed_at: c.completed_at
        }));

        return { challenges, achievements };
    }

    // === Dashboard Stats ===
    async getStats(): Promise<any> {
        const response = await apiClient.get<any>('/player/stats');
        return response.data;
    }
}

export const playerService = new PlayerService();
