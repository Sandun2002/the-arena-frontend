import {
    Venue, Court, Booking, DashboardStats,
    RevenueData, VenueManager, Closure, GalleryImage,
    BookingStatus, ManagerInvitation
} from "@/types";
import { MOCK_VENUES, MOCK_COURTS, MOCK_BOOKINGS, MOCK_MANAGERS } from "./mockData";
import { addDays, format, subDays } from "date-fns";

// Simple UUID alternative for mock
const uuidv4 = () => Math.random().toString(36).substring(2, 15);

class VenueService {

    // === Venues ===
    async getMyVenues(userId: string): Promise<Venue[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const venues = MOCK_VENUES.filter(v => v.owner_id === userId || userId === "user-owner-456");
                resolve(venues);
            }, 600);
        });
    }

    async createVenue(data: Partial<Venue>): Promise<Venue> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newVenue = {
                    ...data,
                    id: `venue-${uuidv4()}`,
                    is_active: true,
                    is_verified: false,
                    is_featured: false,
                    status: "pending",
                    created_at: new Date().toISOString()
                } as Venue;
                MOCK_VENUES.push(newVenue);
                resolve(newVenue);
            }, 1200);
        });
    }

    // === Courts ===
    async getCourts(venueId: string): Promise<Court[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const courts = MOCK_COURTS.filter(c => c.venue_id === venueId);
                resolve(courts);
            }, 500);
        });
    }

    async createCourt(venueId: string, data: Partial<Court>): Promise<Court> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newCourt = {
                    ...data,
                    id: `court-${uuidv4()}`,
                    venue_id: venueId,
                    is_active: true,
                    status: "available"
                } as Court;
                MOCK_COURTS.push(newCourt);
                resolve(newCourt);
            }, 800);
        });
    }

    async deleteCourt(courtId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = MOCK_COURTS.findIndex(c => c.id === courtId);
                if (index !== -1) MOCK_COURTS.splice(index, 1);
                resolve();
            }, 600);
        });
    }

    async updateCourt(courtId: string, data: Partial<Court>): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const court = MOCK_COURTS.find(c => c.id === courtId);
                if (court) {
                    Object.assign(court, data);
                }
                resolve();
            }, 600);
        });
    }

    // === Dashboard & Analytics ===
    async getDashboardStats(venueId: string, isOwner: boolean): Promise<DashboardStats> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const venueBookings = MOCK_BOOKINGS.filter(b => b.court?.venue_id === venueId);
                const revenue = isOwner ? venueBookings.reduce((sum, b) => sum + (b.venue_payout || 0), 0) : null;

                resolve({
                    total_bookings: venueBookings.length,
                    today_bookings: 5,
                    revenue: revenue,
                    active_courts: 3,
                    total_courts: 4
                });
            }, 600);
        });
    }

    async getRevenueData(venueId: string, range: "daily" | "weekly" | "monthly"): Promise<RevenueData> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    daily: Array.from({ length: 7 }).map((_, i) => ({
                        date: format(subDays(new Date(), 6 - i), "MMM dd"),
                        amount: Math.floor(Math.random() * 20000) + 5000
                    })),
                    weekly: [],
                    monthly: []
                });
            }, 800);
        });
    }

    // === Bookings ===
    async getVenueBookings(venueId: string): Promise<Booking[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const bookings = MOCK_BOOKINGS.filter(b => b.court?.venue_id === venueId);
                resolve(bookings);
            }, 600);
        });
    }

    async getUpcomingBookings(venueId: string, limit: number = 5): Promise<UpcomingBooking[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const now = new Date();
                const upcoming = MOCK_BOOKINGS
                    .filter(b =>
                        b.court?.venue_id === venueId &&
                        new Date(b.start_time) > now &&
                        b.status !== 'cancelled'
                    )
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .slice(0, limit)
                    .map(b => ({
                        id: b.id,
                        customer_name: b.customer_name,
                        court_name: b.court?.name || 'Unknown Court',
                        start_time: b.start_time,
                        status: b.status
                    }));
                resolve(upcoming);
            }, 600);
        });
    }

    async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                if (booking) booking.status = status;
                resolve();
            }, 500);
        });
    }

    async markBookingPaid(bookingId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                if (booking) {
                    booking.payment_status = "paid";
                    booking.paid_at = new Date().toISOString();
                }
                resolve();
            }, 500);
        });
    }

    async toggleNoShow(bookingId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
                if (booking) booking.is_no_show = !booking.is_no_show;
                resolve();
            }, 300);
        });
    }

    async createManualBooking(data: any): Promise<Booking> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newBooking = {
                    id: `bk-man-${uuidv4()}`,
                    booking_reference: `BK-${format(new Date(), "yyyyMMdd")}-MAN${Math.floor(Math.random() * 100)}`,
                    is_manual: true,
                    status: "confirmed",
                    payment_status: "paid",
                    created_at: new Date().toISOString(),
                    ...data
                } as Booking;
                MOCK_BOOKINGS.push(newBooking);
                resolve(newBooking);
            }, 1000);
        });
    }

    // === Managers & Invitations ===
    async getManagers(venueId: string): Promise<VenueManager[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_MANAGERS);
            }, 500);
        });
    }

    async getVenueInvitations(venueId: string): Promise<ManagerInvitation[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([]); // Return empty mock for now
            }, 500);
        });
    }

    async inviteManager(venueId: string, email: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 800);
        });
    }

    async respondToInvitation(inviteId: string, status: "accepted" | "declined"): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 500);
        });
    }

    // === Gallery ===
    async uploadGalleryImage(venueId: string, file: File): Promise<GalleryImage> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    id: `img-${uuidv4()}`,
                    url: URL.createObjectURL(file),
                    is_cover: false
                });
            }, 1500);
        })
    }
}

export const venueService = new VenueService();
