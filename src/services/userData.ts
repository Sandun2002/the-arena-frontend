// src/services/userData.ts

export const USER_PROFILE = {
    name: "Alex 'Striker' Doe",
    email: "alex.doe@example.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2680&auto=format&fit=crop",
    memberSince: "Oct 2023",
    tier: "Pro Athlete",
    stats: {
        matchesPlayed: 42,
        hoursBooked: 86,
        favoriteSport: "Football",
        reliabilityScore: "98%"
    },
    achievements: [
        { id: 1, name: "Early Bird", icon: "Sun", desc: "Booked 10 morning slots", unlocked: true },
        { id: 2, name: "MVP", icon: "Trophy", desc: "Rated 5 stars by venues 5 times", unlocked: true },
        { id: 3, name: "Night Owl", icon: "Moon", desc: "Played 5 games after 10 PM", unlocked: true },
        { id: 4, name: "Loyalist", icon: "Heart", desc: "Visited the same venue 10 times", unlocked: false },
    ]
};

export interface Booking {
    id: string;
    venueName: string;
    date: string;
    time: string;
    price: number;
    status: "upcoming" | "completed" | "cancelled";
    image: string;
}

// Make this mutable for demo purposes
export let MY_BOOKINGS: Booking[] = [
    {
        id: "b-123",
        venueName: "Emerald Turf Arena",
        date: "2026-02-10",
        time: "18:00 - 19:00",
        price: 1500,
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: "b-124",
        venueName: "Neon Sky Court",
        date: "2026-02-14",
        time: "20:00 - 21:00",
        price: 2000,
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1505666287802-9311e90be4c9?q=80&w=2671&auto=format&fit=crop"
    },
    {
        id: "b-101",
        venueName: "Royal Sports Complex",
        date: "2026-01-20",
        time: "16:00 - 18:00",
        price: 3500,
        status: "completed",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop"
    }
];

// Function to add a new booking (for demo)
export function addBooking(booking: Omit<Booking, "id" | "status">) {
    const newBooking: Booking = {
        ...booking,
        id: `b-${Date.now()}`,
        status: "upcoming",
    };
    MY_BOOKINGS = [newBooking, ...MY_BOOKINGS];
    return newBooking;
}

// Function to cancel a booking (for demo)
export function cancelBooking(bookingId: string, reason?: string) {
    MY_BOOKINGS = MY_BOOKINGS.map(booking =>
        booking.id === bookingId
            ? { ...booking, status: "cancelled" as const }
            : booking
    );
    return MY_BOOKINGS.find(b => b.id === bookingId);
}

// Mock Venue Bookings Data (for Venue Dashboard)
export interface VenueBooking {
    id: string;
    customerName: string;
    customerId: string;
    courtName: string;
    date: string;
    timeSlot: string;
    amount: number;
    status: "confirmed" | "pending" | "completed" | "cancelled";
}

export const VENUE_BOOKINGS: VenueBooking[] = [
    {
        id: "BK-8391",
        customerName: "John Doe",
        customerId: "C-001",
        courtName: "Court A - Badminton",
        date: "2026-02-10",
        timeSlot: "16:00 - 18:00",
        amount: 4500,
        status: "confirmed"
    },
    {
        id: "BK-8392",
        customerName: "Sarah Silva",
        customerId: "C-002",
        courtName: "Court B - Futsal",
        date: "2026-02-10",
        timeSlot: "18:00 - 20:00",
        amount: 6000,
        status: "confirmed"
    },
    {
        id: "BK-8393",
        customerName: "Rajesh Kumar",
        customerId: "C-003",
        courtName: "Court C - Tennis",
        date: "2026-02-11",
        timeSlot: "14:00 - 15:00",
        amount: 3500,
        status: "pending"
    },
    {
        id: "BK-8394",
        customerName: "Emily Chen",
        customerId: "C-004",
        courtName: "Court A - Badminton",
        date: "2026-02-11",
        timeSlot: "19:00 - 21:00",
        amount: 4500,
        status: "confirmed"
    },
    {
        id: "BK-8395",
        customerName: "Michael Fernando",
        customerId: "C-005",
        courtName: "Court D - Basketball",
        date: "2026-02-12",
        timeSlot: "17:00 - 19:00",
        amount: 5500,
        status: "pending"
    },
    {
        id: "BK-8396",
        customerName: "Priya Patel",
        customerId: "C-006",
        courtName: "Court B - Futsal",
        date: "2026-02-08",
        timeSlot: "20:00 - 22:00",
        amount: 6000,
        status: "completed"
    },
    {
        id: "BK-8397",
        customerName: "David Lee",
        customerId: "C-007",
        courtName: "Court C - Tennis",
        date: "2026-02-09",
        timeSlot: "15:00 - 16:00",
        amount: 3500,
        status: "completed"
    },
    {
        id: "BK-8398",
        customerName: "Nina Perera",
        customerId: "C-008",
        courtName: "Court A - Badminton",
        date: "2026-02-13",
        timeSlot: "10:00 - 12:00",
        amount: 4500,
        status: "confirmed"
    },
    {
        id: "BK-8399",
        customerName: "Alex Johnson",
        customerId: "C-009",
        courtName: "Court D - Basketball",
        date: "2026-02-14",
        timeSlot: "18:00 - 20:00",
        amount: 5500,
        status: "pending"
    },
    {
        id: "BK-8400",
        customerName: "Lisa Wong",
        customerId: "C-010",
        courtName: "Court B - Futsal",
        date: "2026-02-06",
        timeSlot: "19:00 - 21:00",
        amount: 6000,
        status: "completed"
    },
];
