
import apiClient from "./apiClient";
import {
    DashboardStats, Booking, VenueProfile, RecurringBooking,
    UpcomingBooking, Court, Closure, GalleryImage,
    AnalyticsRevenue, AnalyticsUtilization, AnalyticsFees, AnalyticsCancellations
} from "@/types";
import { normalizeBooking, normalizeVenue, normalizeCourt } from "./normalizers";

export const centerService = {
    // === Dashboard ===
    getStats: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<any>('/center/stats', { params });
        return {
            total_bookings: Number(response.data.todays_bookings ?? 0),
            today_bookings: Number(response.data.todays_bookings ?? 0),
            revenue: response.data.revenue ?? null,
            active_courts: Number(response.data.active_courts ?? 0),
            total_courts: Number(response.data.active_courts ?? 0),
            bookings_trend: response.data.bookings_trend !== undefined ? Number(response.data.bookings_trend) : undefined,
            revenue_trend: response.data.revenue_trend !== undefined ? Number(response.data.revenue_trend) : undefined,
            pending_payments: Number(response.data.pending_payments ?? 0),
            new_customers: Number(response.data.new_customers ?? 0),
        } satisfies DashboardStats;
    },

    getUpcoming: async (venueId?: string, limit = 5) => {
        const params = venueId ? { venue_id: venueId, limit } : { limit };
        const response = await apiClient.get<UpcomingBooking[]>('/center/schedule/upcoming', { params });
        return response.data;
    },

    getProfile: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<any>('/center/profile', { params });
        return {
            ...normalizeVenue(response.data),
            operating_schedule: Array.isArray(response.data.operating_hours)
                ? response.data.operating_hours.map((hour: any) => ({
                    day: String(hour.day_of_week),
                    open: hour.open_time ?? "",
                    close: hour.close_time ?? "",
                    is_closed: Boolean(hour.is_closed),
                }))
                : [],
        } as VenueProfile;
    },

    updateSchedule: async (venueId: string, hours: VenueProfile['operating_schedule']) => {
        await apiClient.put('/center/schedule', { operating_schedule: hours }, { params: { venue_id: venueId } });
    },

    // === Bookings ===
    getBookingsByDate: async (targetDate: string, venueId?: string) => {
        const params = { target_date: targetDate, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<any>('/center/bookings', { params });
        return (response.data.bookings || []).map(normalizeBooking);
    },

    getBookingsList: async (params: { venue_id?: string, date?: string, search?: string, status?: string, skip?: number, limit?: number }) => {
        const response = await apiClient.get<{ items: any[]; total: number; page: number; per_page: number }>('/center/bookings/list', {
            params: {
                venue_id: params.venue_id,
                search: params.search,
                status_filter: params.status,
                skip: params.skip,
                limit: params.limit,
            }
        });
        return {
            data: (response.data.items || []).map(normalizeBooking),
            total: response.data.total,
            page: response.data.page,
            per_page: response.data.per_page,
        };
    },

    createManualBooking: async (data: any) => {
        const response = await apiClient.post<any>('/center/bookings/manual', data);
        return normalizeBooking(response.data);
    },

    confirmBooking: async (id: string) => {
        await apiClient.post(`/center/bookings/${id}/confirm`);
    },

    cancelBooking: async (id: string, reason?: string) => {
        await apiClient.post(`/center/bookings/${id}/cancel`, null, { params: { reason } });
    },

    markBookingPaid: async (id: string) => {
        await apiClient.post(`/center/bookings/${id}/confirm`, null, { params: { payment_method: 'cash' } });
    },

    toggleNoShow: async (id: string) => {
        await apiClient.post(`/center/bookings/${id}/no-show`);
    },

    // === Courts (Read Only / Center View) ===
    getCourts: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<any[]>('/center/courts', { params });
        return (response.data || []).map(normalizeCourt);
    },

    uploadCourtImage: async (courtId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
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
        formData.append('file', file);
        if (venueId) formData.append('venue_id', venueId);

        const response = await apiClient.post<GalleryImage>('/center/gallery', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteGalleryImage: async (imageId: string) => {
        await apiClient.delete(`/center/gallery/${imageId}`);
    },

    // setCoverImage logic was removed because there is no PUT /gallery/{imageId}/cover on the server

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
        const response = await apiClient.get<{ items: Closure[] }>('/center/closures', { params });
        return response.data.items || [];
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
        const response = await apiClient.get<any>('/center/analytics/revenue', { params });
        const points = response.data.labels.map((label: string, index: number) => ({
            date: label,
            amount: Number(response.data.data[index] ?? 0),
        }));

        return {
            total: Number(response.data.total ?? 0),
            trend_percentage: 0,
            breakdown: {
                daily: period === 'daily' ? points : [],
                weekly: period === 'weekly' ? points : [],
                monthly: period === 'monthly' ? points : [],
            },
        } satisfies AnalyticsRevenue;
    },

    getUtilizationAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<any>('/center/analytics/utilization', { params });
        return {
            overall_percentage: Number(response.data.utilization_percentage ?? 0),
            peak_hours: [
                { time: 'Confirmed', percentage: Number(response.data.breakdown?.confirmed_hours ?? 0) },
                { time: 'Pending', percentage: Number(response.data.breakdown?.payment_pending_hours ?? 0) },
            ],
            court_breakdown: response.data.court_name
                ? [{ court_id: String(response.data.court_id ?? 'all'), court_name: response.data.court_name, percentage: Number(response.data.utilization_percentage ?? 0) }]
                : [{ court_id: 'all', court_name: 'All Courts', percentage: Number(response.data.utilization_percentage ?? 0) }],
        } satisfies AnalyticsUtilization;
    },

    getFeesAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<any>('/center/analytics/fees', { params });
        return {
            total_platform_fees: Number(response.data.platform_fees ?? 0),
            net_payout: Number(response.data.venue_payout ?? 0),
            pending_payout: 0,
            venue_commission: Number(response.data.venue_commission ?? 0),
            total_revenue: Number(response.data.total_revenue ?? 0),
        } satisfies AnalyticsFees;
    },

    getCancellationAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<AnalyticsCancellations>('/center/analytics/cancellations', { params });
        return response.data;
    },
};
