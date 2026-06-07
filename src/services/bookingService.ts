import { Booking, BookingStatus, PaymentStatus, SlotAvailability } from "@/types";
import apiClient from "./apiClient";
import { normalizeBooking } from "./normalizers";

export interface PriceCalculation {
    total: number;
    subtotal: number;
    service_fee: number;
    duration_hours: number;
    currency: string;
    slots?: Array<{
        start_time: string;
        end_time: string;
        is_peak: boolean;
        hourly_rate: number;
        amount: number;
    }>;
}

export interface CreateBookingRequest {
    venue_id: string;
    court_id: string;
    start_time: string; // ISO string
    end_time: string;   // ISO string
    payment_method: "card" | "cash" | "bank_transfer";
}

export interface PayHereCheckoutData {
    merchant_id: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    order_id: string;
    items: string;
    currency: string;
    amount: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    hash: string;
    sandbox: string;
    checkout_url: string;
    booking_id: string;
}

class BookingService {
    async calculatePrice(courtId: string, date: string, timeSlots: string[], paymentMethod: string = "card"): Promise<PriceCalculation> {
        const response = await apiClient.post<PriceCalculation>('/pricing/calculate', {
            court_id: courtId,
            date: date,
            time_slots: timeSlots,
            payment_method: paymentMethod,
        });
        return response.data;
    }

    async createBooking(data: CreateBookingRequest): Promise<Booking> {
        try {
            const response = await apiClient.post<Booking>('/bookings/', data);
            return response.data;
        } catch (error: any) {
            // BACKEND WORKAROUND: The backend successfully creates the booking but crashes 
            // when serializing the response, returning a 500 error. The booking actually 
            // exists as PAYMENT_PENDING. We attempt to recover it by fetching recent bookings.
            if (error.response?.status >= 500) {
                console.warn("Backend returned 500 on createBooking. Attempting to recover booking...");
                
                // Wait briefly to ensure DB transaction is fully visible
                await new Promise(resolve => setTimeout(resolve, 500));
                
                try {
                    // Fetch user's recent bookings
                    const recentBookings = await this.getMyBookings({ limit: 10 });
                    
                    // Look for the newly created booking that matches our request
                    const pendingBooking = recentBookings.find(b => 
                        b.court_id === data.court_id && 
                        new Date(b.start_time).getTime() === new Date(data.start_time).getTime() &&
                        b.payment_status === "pending"
                    );

                    if (pendingBooking) {
                        console.log("Successfully recovered booking:", pendingBooking.id);
                        return pendingBooking;
                    }
                } catch (recoveryError) {
                    console.error("Failed to recover booking:", recoveryError);
                }
            }
            // Re-throw if it wasn't a 500 or if recovery failed
            throw error;
        }
    }

    async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
        await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
        return true;
    }

    async getMyBookings(params?: any): Promise<Booking[]> {
        const response = await apiClient.get<Booking[]>('/bookings/me', { params });
        return response.data.map((b: any) => normalizeBooking(b));
    }

    async getCheckoutData(bookingId: string): Promise<PayHereCheckoutData> {
        const response = await apiClient.post<PayHereCheckoutData>(
            `/payments/checkout-data/${bookingId}`
        );
        return response.data;
    }

    async getBookingById(id: string): Promise<Booking> {
        const response = await apiClient.get<Booking>(`/bookings/${id}`);
        return normalizeBooking(response.data as any);
    }

    async uploadBankTransferSlip(bookingId: string, file: File, referenceNumber: string): Promise<Booking> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("reference_number", referenceNumber);
        
        const response = await apiClient.post<Booking>(
            `/bank-transfers/${bookingId}/upload-slip`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return normalizeBooking(response.data as any);
    }
}

export const bookingService = new BookingService();
