
import apiClient from "./apiClient";
import {
    DashboardStats, Booking, VenueProfile, RecurringBooking,
    UpcomingBooking, Court, Closure, GalleryImage,
    AnalyticsRevenue, AnalyticsUtilization, AnalyticsFees, AnalyticsCancellations,
    RecurringBlock, ScheduleData
} from "@/types";
import { normalizeBooking, normalizeVenue, normalizeCourt, normalizeGalleryImage, normalizeRecurringBooking } from "./normalizers";

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
                ? response.data.operating_hours.map((hour: any) => {
                    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                    return {
                        day: days[hour.day_of_week] || String(hour.day_of_week),
                        open: hour.opening_time ? hour.opening_time.substring(0, 5) : "",
                        close: hour.closing_time ? hour.closing_time.substring(0, 5) : "",
                        is_closed: Boolean(hour.is_closed),
                    };
                })
                : [],
        } as VenueProfile;
    },

    updateSchedule: async (venueId: string, hours: VenueProfile['operating_schedule']) => {
        const dayMap: Record<string, number> = {
            monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6
        };
        const formattedHours = hours.map((h) => {
            let dayOfWeek = 0;
            if (!isNaN(Number(h.day))) {
                dayOfWeek = Number(h.day);
            } else {
                dayOfWeek = dayMap[h.day.toLowerCase()] ?? 0;
            }
            const isReallyClosed = (h.is_closed === true || String(h.is_closed) === "true") && !h.open && !h.close;
            return {
                day_of_week: dayOfWeek,
                opening_time: isReallyClosed ? null : (h.open ? (h.open.length === 5 ? `${h.open}:00` : h.open) : null),
                closing_time: isReallyClosed ? null : (h.close ? (h.close.length === 5 ? `${h.close}:00` : h.close) : null),
                is_closed: isReallyClosed,
            };
        });
        await apiClient.put('/center/operating-hours', { hours: formattedHours }, { params: { venue_id: venueId } });
    },

    // === Bookings ===
    getBookingsByDate: async (targetDate: string, venueId?: string): Promise<ScheduleData> => {
        const params = { target_date: targetDate, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<any>('/center/bookings', { params });
        return {
            bookings: (response.data.bookings || []).map(normalizeBooking),
            recurringBlocks: (response.data.recurring_blocks || []) as RecurringBlock[],
            isClosed: Boolean(response.data.is_closed),
            closureReason: response.data.closure_reason ?? null,
        };
    },

    getBookingsList: async (params: { venue_id?: string, date?: string, search?: string, status?: string, skip?: number, limit?: number }) => {
        const response = await apiClient.get<{ items: any[]; total: number; page: number; per_page: number }>('/center/bookings/list', {
            params: {
                venue_id: params.venue_id,
                search: params.search,
                status: params.status,
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

    createManualBooking: async (data: any, venueId?: string) => {
        const response = await apiClient.post<any>(
            '/center/bookings/manual',
            data,
            { params: venueId ? { venue_id: venueId } : {} }
        );
        return normalizeBooking(response.data);
    },

    confirmBooking: async (id: string, paymentMethod?: "cash" | "card" | "bank_transfer") => {
        await apiClient.post(
            `/center/bookings/${id}/confirm`,
            null,
            paymentMethod ? { params: { payment_method: paymentMethod } } : undefined,
        );
    },

    cancelBooking: async (id: string, reason?: string) => {
        await apiClient.post(`/center/bookings/${id}/cancel`, null, { params: { reason } });
    },

    markBookingPaid: async (id: string, paymentMethod?: "cash" | "card" | "bank_transfer") => {
        await apiClient.post(
            `/center/bookings/${id}/confirm`,
            null,
            paymentMethod ? { params: { payment_method: paymentMethod } } : undefined,
        );
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
        const response = await apiClient.get<any[]>('/center/gallery', { params });
        return (response.data || []).map(normalizeGalleryImage);
    },

    uploadGalleryImage: async (file: File, venueId?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (venueId) formData.append('venue_id', venueId);

        const response = await apiClient.post<any>('/center/gallery', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return normalizeGalleryImage(response.data);
    },

    deleteGalleryImage: async (imageId: string) => {
        await apiClient.delete(`/center/gallery/${imageId}`);
    },

    // setCoverImage logic was removed because there is no PUT /gallery/{imageId}/cover on the server

    // === Recurring ===
    getRecurringBookings: async (venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get<{ items: any[] }>('/center/recurring-bookings', { params });
        return (response.data.items || []).map(normalizeRecurringBooking);
    },

    createRecurringBooking: async (data: any, venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.post<any>('/center/recurring-bookings', data, { params });
        return normalizeRecurringBooking(response.data);
    },

    updateRecurringBooking: async (id: string, data: any, venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.put<any>(`/center/recurring-bookings/${id}`, data, { params });
        return normalizeRecurringBooking(response.data);
    },

    pauseRecurringBooking: async (id: string, venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        await apiClient.post(`/center/recurring-bookings/${id}/pause`, null, { params });
    },

    resumeRecurringBooking: async (id: string, venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        await apiClient.post(`/center/recurring-bookings/${id}/resume`, null, { params });
    },

    deleteRecurringBooking: async (id: string, venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        await apiClient.delete(`/center/recurring-bookings/${id}`, { params });
    },

    // === Closures ===
    getClosures: async (venueId?: string, upcomingOnly = false) => {
        const params = { ...(venueId ? { venue_id: venueId } : {}), upcoming_only: upcomingOnly };
        const response = await apiClient.get<{ items: Closure[] }>('/center/closures', { params });
        return response.data.items || [];
    },

    createClosure: async (data: any, venueId?: string) => {
        const response = await apiClient.post<Closure>('/center/closures', data, {
            params: venueId ? { venue_id: venueId } : {}
        });
        return response.data;
    },

    deleteClosure: async (id: string, venueId?: string) => {
        const params = venueId ? { venue_id: venueId } : {};
        await apiClient.delete(`/center/closures/${id}`, { params });
    },

    getBlockedBookings: async (venueId?: string, upcomingOnly = true) => {
        const params = { ...(venueId ? { venue_id: venueId } : {}), upcoming_only: upcomingOnly };
        const response = await apiClient.get<{ items: any[] }>('/center/bookings/blocked', { params });
        return response.data.items || [];
    },

    cancelBlockedBooking: async (id: string) => {
        await apiClient.post(`/center/bookings/${id}/cancel`);
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
        
        const total_booked = Number(response.data.total_booked_hours ?? 0);
        const confirmed_hours = Number(response.data.breakdown?.confirmed_hours ?? 0);
        const pending_hours = Number(response.data.breakdown?.payment_pending_hours ?? 0);
        
        return {
            overall_percentage: Number(response.data.utilization_percentage ?? 0),
            total_booked_hours: total_booked,
            total_available_hours: Number(response.data.total_available_hours ?? 0),
            status_breakdown: [
                { 
                    label: 'Confirmed', 
                    hours: confirmed_hours, 
                    percentage: total_booked > 0 ? Math.round((confirmed_hours / total_booked) * 100) : 0 
                },
                { 
                    label: 'Pending', 
                    hours: pending_hours, 
                    percentage: total_booked > 0 ? Math.round((pending_hours / total_booked) * 100) : 0 
                },
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
            pending_payout: Number(response.data.pending_payout ?? 0),
            venue_commission: Number(response.data.venue_commission ?? 0),
            total_revenue: Number(response.data.total_revenue ?? 0),
            total_platform_revenue: Number(response.data.total_platform_revenue ?? 0),
            breakdown: response.data.breakdown || undefined,
        } satisfies AnalyticsFees;

    },

    getCancellationAnalytics: async (period: 'daily' | 'weekly' | 'monthly', venueId?: string) => {
        const params = { period, ...(venueId ? { venue_id: venueId } : {}) };
        const response = await apiClient.get<any>('/center/analytics/cancellations', { params });
        return {
            total_cancellations: Number(response.data.cancelled_bookings ?? 0),
            cancellation_rate: Number(response.data.cancellation_rate ?? 0),
            no_show_count: Number(response.data.no_shows ?? 0),
            total_bookings: Number(response.data.total_bookings ?? 0),
            lost_revenue: Number(response.data.lost_revenue ?? 0),
            rejected_bookings: Number(response.data.rejected_bookings ?? 0),
            no_show_rate: Number(response.data.no_show_rate ?? 0),
            cancellation_reasons: response.data.cancellation_reasons ?? {},
        } satisfies AnalyticsCancellations;
    },

    // --- Peak Hours ---

    getPeakHours: async (venueId?: string): Promise<{
        peak_start_time: string | null;
        peak_end_time: string | null;
        peak_days: string | null;
        has_peak_config: boolean;
    }> => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.get('/center/peak-hours', { params });
        return response.data;
    },

    updatePeakHours: async (payload: {
        peak_start_time: string | null;
        peak_end_time: string | null;
        peak_days: string | null;
    }, venueId?: string): Promise<{
        peak_start_time: string | null;
        peak_end_time: string | null;
        peak_days: string | null;
        has_peak_config: boolean;
    }> => {
        const params = venueId ? { venue_id: venueId } : {};
        const response = await apiClient.put('/center/peak-hours', payload, { params });
        return response.data;
    },

    // === Cash Booking Reconciliation ===
    getPendingCashBookings: async (venueId: string): Promise<Booking[]> => {
        const response = await apiClient.get<any[]>(`/cash-bookings/venue/${venueId}/pending`);
        return (response.data || []).map(normalizeBooking);
    },

    markCashCollected: async (bookingId: string): Promise<Booking> => {
        const response = await apiClient.post<any>(`/cash-bookings/${bookingId}/collect`);
        return normalizeBooking(response.data);
    },

    markCashNoShow: async (bookingId: string): Promise<Booking> => {
        const response = await apiClient.post<any>(`/cash-bookings/${bookingId}/no-show`);
        return normalizeBooking(response.data);
    },
};
