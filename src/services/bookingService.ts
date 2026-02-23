import { Booking, BookingStatus, PaymentStatus, SlotAvailability } from "@/types";
import apiClient from "./apiClient";

export interface PriceCalculation {
    total_price: number;
    subtotal: number;
    platform_fee: number;
    hourly_rate: number;
    duration_hours: number;
    currency: string;
}

export interface CreateBookingRequest {
    venue_id: string;
    court_id: string;
    start_time: string; // ISO string
    end_time: string;   // ISO string
    payment_method: "card" | "cash";
}

class BookingService {
    async calculatePrice(courtId: string, date: string, timeSlots: string[]): Promise<PriceCalculation> {
        const response = await apiClient.post<PriceCalculation>('/pricing/calculate', {
            court_id: courtId,
            date: date,
            time_slots: timeSlots
        });
        return response.data;
    }

    async createBooking(data: CreateBookingRequest): Promise<Booking> {
        const response = await apiClient.post<Booking>('/bookings', data);
        return response.data;
    }

    async confirmPayment(bookingId: string, data: any): Promise<Booking> {
        const response = await apiClient.post<Booking>(`/bookings/${bookingId}/confirm-payment`, data);
        return response.data;
    }

    async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
        await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
        return true;
    }

    async getMyBookings(params?: any): Promise<Booking[]> {
        const response = await apiClient.get<Booking[]>('/bookings/me', { params });
        return response.data;
    }

    async getBookingById(id: string): Promise<Booking> {
        const response = await apiClient.get<Booking>(`/bookings/${id}`);
        return response.data;
    }
}

export const bookingService = new BookingService();
