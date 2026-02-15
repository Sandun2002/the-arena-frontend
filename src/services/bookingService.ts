import { Booking, BookingStatus, PaymentStatus } from "@/types";
import { MOCK_BOOKINGS, MOCK_COURTS, MOCK_VENUES, getSlotAvailability } from "./mockData";
import { addHours, differenceInMinutes, format, parseISO } from "date-fns";

// Simple UUID
const uuidv4 = () => Math.random().toString(36).substring(2, 15);

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
    user_id: string;
    start_time: string; // ISO string
    end_time: string;   // ISO string
    sport: string;
    payment_method: "card" | "cash";
}

class BookingService {

    // Get availability for a specific court on a specific date
    async getAvailability(courtId: string, date: string) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const slots = getSlotAvailability(courtId, date);
                resolve(slots);
            }, 600);
        });
    }

    // Calculate price based on duration and court rate
    async calculatePrice(courtId: string, startTime: string, endTime: string): Promise<PriceCalculation> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const court = MOCK_COURTS.find(c => c.id === courtId);
                if (!court) {
                    reject(new Error("Court not found"));
                    return;
                }

                const start = parseISO(startTime);
                const end = parseISO(endTime);
                const durationMinutes = differenceInMinutes(end, start);
                const durationHours = durationMinutes / 60;

                if (durationHours <= 0) {
                    reject(new Error("Invalid duration"));
                    return;
                }

                const hourlyRate = court.hourly_rate;
                const subtotal = hourlyRate * durationHours;
                const platformFee = 200; // Flat fee for mock
                const totalPrice = subtotal + platformFee;

                resolve({
                    total_price: totalPrice,
                    subtotal: subtotal,
                    platform_fee: platformFee,
                    hourly_rate: hourlyRate,
                    duration_hours: durationHours,
                    currency: "LKR"
                });
            }, 500);
        });
    }

    // Create a new booking
    async createBooking(data: CreateBookingRequest): Promise<Booking> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Validate availability (Mock check)
                const court = MOCK_COURTS.find(c => c.id === data.court_id);
                const venue = MOCK_VENUES.find(v => v.id === data.venue_id);

                if (!court || !venue) {
                    reject(new Error("Invalid court or venue"));
                    return;
                }

                // Simulate pricing calc again
                const start = parseISO(data.start_time);
                const end = parseISO(data.end_time);
                const durationHours = differenceInMinutes(end, start) / 60;
                const total_price = (court.hourly_rate * durationHours) + 200;

                const newBooking: Booking = {
                    id: `bk-${uuidv4()}`,
                    booking_reference: `BK-${format(new Date(), "yyyyMMdd")}-${uuidv4().substring(0, 4).toUpperCase()}`,
                    user_id: data.user_id,
                    court_id: data.court_id,
                    sport: data.sport,
                    hourly_rate: court.hourly_rate,
                    total_price: total_price,
                    platform_fee: 200,
                    venue_payout: total_price - 200,
                    status: "confirmed",
                    payment_status: "paid", // Assume paid for flow simplification
                    payment_method: data.payment_method,
                    is_manual: false,
                    is_paid: true,
                    is_no_show: false,
                    customer_name: "Current User", // In real app, fetch user details
                    customer_phone: "+94771234567",
                    start_time: data.start_time,
                    end_time: data.end_time,
                    duration_hours: durationHours,
                    created_at: new Date().toISOString(),
                    cancelled_at: null,
                    cancellation_reason: null,
                    paid_at: new Date().toISOString(),
                    court: {
                        id: court.id,
                        name: court.name,
                        venue_name: venue.name,
                        venue_id: venue.id,
                        image: null
                    }
                };

                MOCK_BOOKINGS.push(newBooking);
                resolve(newBooking);
            }, 1000);
        });
    }
}

export const bookingService = new BookingService();
