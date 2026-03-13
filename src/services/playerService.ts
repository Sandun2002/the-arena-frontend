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
        return { eligible: true };
    }

    async deleteReview(reviewId: string): Promise<void> {
        await apiClient.delete(`/reviews/${reviewId}`);
    }

    // === Gamification ===
    async getChallenges(): Promise<{ challenges: Challenge[], achievements: UserAchievement[] }> {
        const response = await apiClient.get<{ challenges: Challenge[], achievements: UserAchievement[] }>('/player/challenges');
        return response.data;
    }

    // === Dashboard Stats ===
    async getStats(): Promise<any> {
        const response = await apiClient.get<any>('/player/stats');
        return response.data;
    }
}

export const playerService = new PlayerService();
