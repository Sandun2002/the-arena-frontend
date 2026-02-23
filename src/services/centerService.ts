
import apiClient from "./apiClient";
import {
    DashboardStats, Booking, VenueProfile, RecurringBooking,
    UpcomingBooking, Court, Closure, GalleryImage,
    AnalyticsRevenue, AnalyticsUtilization, AnalyticsFees, AnalyticsCancellations
} from "@/types";

export const centerService = {
    // === Dashboard ===
    getStats: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<DashboardStats>('/center/stats', { params });
        return response.data;
    },

    getUpcoming: async (venueId?: string, limit = 5) => {
        const params = venueId ? { venue_id: venueId, limit } : { limit };
        const response = await apiClient.get<UpcomingBooking[]>('/center/schedule/upcoming', { params });
        return response.data;
    },

    getProfile: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<VenueProfile>('/center/profile', { params });
        return response.data;
    },

    updateSchedule: async (venueId: string, hours: VenueProfile['operating_schedule']) => {
        await apiClient.put('/center/schedule', { operating_schedule: hours }, { params: { venue_id: venueId } });
    },

    // === Bookings ===
    getBookingsByDate: async (targetDate: string, venueId?: string) => {
        const params = { target_date: targetDate, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<Booking[]>('/center/bookings', { params });
        return response.data;
    },

    getBookingsList: async (params: { venue_id?: string, date?: string, search?: string, status?: string, skip?: number, limit?: number }) => {
        const response = await apiClient.get<{ data: Booking[], total: number }>('/center/bookings/list', { params });
        return response.data;
    },

    createManualBooking: async (data: any) => {
        const response = await apiClient.post<Booking>('/center/bookings/manual', data);
        return response.data;
    },

    confirmBooking: async (id: string) => {
        await apiClient.post(`/center/bookings/${id}/confirm`);
    },

    cancelBooking: async (id: string, reason?: string) => {
        await apiClient.post(`/center/bookings/${id}/cancel`, { reason });
    },

    markBookingPaid: async (id: string) => {
        await apiClient.post(`/center/bookings/${id}/pay`);
    },

    toggleNoShow: async (id: string) => {
        await apiClient.post(`/center/bookings/${id}/no-show`);
    },

    // === Courts (Read Only / Center View) ===
    getCourts: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<Court[]>('/center/courts', { params });
        return response.data;
    },

    uploadCourtImage: async (courtId: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await apiClient.post(`/center/courts/${courtId}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // === Gallery ===
    getGallery: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<GalleryImage[]>('/center/gallery', { params });
        return response.data;
    },

    uploadGalleryImage: async (file: File, venueId?: string) => {
        const formData = new FormData();
        formData.append('image', file);
        if (venueId) formData.append('venue_id', venueId);

        const response = await apiClient.post<GalleryImage>('/center/gallery', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteGalleryImage: async (imageId: string) => {
        await apiClient.delete(`/center/gallery/${imageId}`);
    },

    setCoverImage: async (imageId: string) => {
        await apiClient.put(`/center/gallery/${imageId}/cover`);
    },

    // === Recurring ===
    getRecurringBookings: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<RecurringBooking[]>('/center/recurring-bookings', { params });
        return response.data;
    },

    createRecurringBooking: async (data: any) => {
        const response = await apiClient.post<RecurringBooking>('/center/recurring-bookings', data);
        return response.data;
    },

    updateRecurringBooking: async (id: string, data: any) => {
        const response = await apiClient.put<RecurringBooking>(`/center/recurring-bookings/${id}`, data);
        return response.data;
    },

    pauseRecurringBooking: async (id: string) => {
        await apiClient.post(`/center/recurring-bookings/${id}/pause`);
    },

    resumeRecurringBooking: async (id: string) => {
        await apiClient.post(`/center/recurring-bookings/${id}/resume`);
    },

    deleteRecurringBooking: async (id: string) => {
        await apiClient.delete(`/center/recurring-bookings/${id}`);
    },

    // === Closures ===
    getClosures: async (venueId?: string, upcomingOnly = false) => {
        const params = { ...(venueId ? { venue_id: venueId } : {}), upcoming_only: upcomingOnly };
        const response = await apiClient.get<Closure[]>('/center/closures', { params });
        return response.data;
    },

    createClosure: async (data: any) => {
        const response = await apiClient.post<Closure>('/center/closures', data);
        return response.data;
    },

    deleteClosure: async (id: string) => {
        await apiClient.delete(`/center/closures/${id}`);
    },

    // === Analytics ===
    getRevenueAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<AnalyticsRevenue>('/center/analytics/revenue', { params });
        return response.data;
    },

    getUtilizationAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<AnalyticsUtilization>('/center/analytics/utilization', { params });
        return response.data;
    },

    getFeesAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<AnalyticsFees>('/center/analytics/fees', { params });
        return response.data;
    },

    getCancellationAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<AnalyticsCancellations>('/center/analytics/cancellations', { params });
        return response.data;
    },
};
