import { User, Booking, Review, Challenge, UserAchievement } from "@/types";
import apiClient from "./apiClient";

class PlayerService {
    // === Profile ===
    async getProfile(): Promise<User> {
        const response = await apiClient.get<User>('/player/profile');
        return response.data;
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await apiClient.put<User>('/player/profile', {
            full_name: data.full_name,
            phone_number: data.phone_number,
            bio: data.bio
        });
        return response.data;
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
        const response = await apiClient.get<Booking[]>('/bookings/me');
        return response.data;
    }

    async getBookingById(bookingId: string): Promise<Booking> {
        const response = await apiClient.get<Booking>(`/bookings/${bookingId}`);
        return response.data;
    }

    async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
        await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
        return true;
    }

    // === Reviews ===
    async getMyReviews(): Promise<Review[]> {
        const response = await apiClient.get<Review[]>('/me/reviews');
        return response.data;
    }

    async createReview(data: { venueId: string; rating: number; comment: string }): Promise<Review> {
        const response = await apiClient.post<Review>(`/venues/${data.venueId}/reviews`, {
            rating: data.rating,
            comment: data.comment
        });
        return response.data;
    }

    async checkReviewEligibility(userId: string, venueId: string): Promise<{ eligible: boolean; reason?: string }> {
        try {
            const response = await apiClient.get<{ eligible: boolean; reason?: string }>(`/venues/${venueId}/reviews/eligibility`);
            return response.data;
        } catch (error) {
            // Fallback to true if endpoint doesn't exist yet, let the createReview call handle authorization natively
            return { eligible: true };
        }
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
