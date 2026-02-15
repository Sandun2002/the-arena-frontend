
import { addDays, format, setHours, setMinutes, startOfHour, isBefore, isAfter, parseISO } from 'date-fns';
import {
  Venue, Court, User, Booking, Review,
  BookingStatus, PaymentStatus, VenueStatus,
  SlotAvailability, RoleResponse, UserRole,
  GalleryImage, Closure, VenueManager,
  ManagerInvitation, Sport, Challenge, UserAchievement
} from '@/types';

// Simple UUID alternative for mock data
const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// ==========================================
// 0. Sports Mock Data
// ==========================================

export const MOCK_SPORTS: Sport[] = [
  { id: "s-1", name: "Badminton", icon: "badminton", imageUrl: "https://images.unsplash.com/photo-1613912360465-c49c71c1822c", isActive: true },
  { id: "s-2", name: "Futsal", icon: "futsal", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018", isActive: true },
  { id: "s-3", name: "Cricket", "icon": "cricket", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", isActive: true },
  { id: "s-4", name: "Tennis", icon: "tennis", imageUrl: "https://images.unsplash.com/photo-1595435064214-0dfdfbc558c4", isActive: true },
  { id: "s-5", name: "Basketball", icon: "basketball", imageUrl: "https://images.unsplash.com/photo-1595435064214-0dfdfbc558c4", isActive: true }, // Reusing Tennis image for Basketball
  { id: "s-6", name: "Padel", icon: "padel", imageUrl: "https://images.unsplash.com/photo-1621947080524-c05f9b53177d", isActive: true }, // Example Padel image
  { id: "s-7", name: "Swimming", icon: "swimming", imageUrl: "https://images.unsplash.com/photo-1600965962375-92c2333dfd68", isActive: true }
];

// ==========================================
// 1. Roles & Users Mock Data
// ==========================================

const ROLE_CUSTOMER: RoleResponse = {
  id: 1,
  name: "Customer",
  slug: "customer",
  description: "Regular platform user"
};

const ROLE_VENUE_OWNER: RoleResponse = {
  id: 2,
  name: "Venue Owner",
  slug: "venue_owner",
  description: "Owns and manages venues"
};

// Demo Users
export const MOCK_USERS: User[] = [
  // 1. Player Demo
  {
    id: "user-player-123",
    email: "player@arena.lk",
    full_name: "Dilshan Perera",
    phone_number: "+94771234567",
    profile_image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop",
    bio: "Badminton enthusiast and weekend cricketer.",
    is_active: true,
    roles: [ROLE_CUSTOMER],
    email_verified: true,
    phone_verified: true,
    verification_status: "verified",
    is_mfa_enabled: false,
    xp: 250,
    level: 3,
    next_level_xp: 300,
    xp_progress_percent: 83,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-02-10T14:30:00Z"
  },
  // 2. Venue Owner Demo
  {
    id: "user-owner-456",
    email: "owner@arena.lk",
    full_name: "Sanjeewa Silva",
    phone_number: "+94719876543",
    profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop",
    bio: "Owner of multiple sports complexes in Colombo.",
    is_active: true,
    roles: [ROLE_VENUE_OWNER],
    email_verified: true,
    phone_verified: true,
    verification_status: "verified",
    is_mfa_enabled: true,
    xp: 1200,
    level: 13,
    next_level_xp: 1300,
    xp_progress_percent: 10,
    created_at: "2024-11-20T09:00:00Z",
    updated_at: "2025-02-01T11:15:00Z"
  },
  // 3. Venue Manager Demo
  {
    id: "user-manager-789",
    email: "manager@arena.lk",
    full_name: "Kamal De Silva",
    phone_number: "+94755551234",
    profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop",
    bio: "Manager at Colombo City Center Arena.",
    is_active: true,
    roles: [ROLE_CUSTOMER],
    email_verified: true,
    phone_verified: true,
    verification_status: "verified",
    is_mfa_enabled: false,
    xp: 40,
    level: 1,
    next_level_xp: 100,
    xp_progress_percent: 40,
    created_at: "2025-02-01T08:00:00Z",
    updated_at: null
  }
];

// ==========================================
// 2. Venues & Courts Mock Data
// ==========================================

const createGallery = (ids: string[]): string[] => ids.map((id) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop`
);

export const MOCK_VENUES: Venue[] = [
  {
    id: "venue-ccc-001",
    name: "Colombo City Center Arena",
    slug: "colombo-city-center-arena",
    city: "Colombo",
    address: "137 Sir James Pieris Mawatha, Colombo 00200",
    lat: 6.9189,
    lng: 79.8559,
    operating_hours: "06:00 - 23:00",
    contact_number: "+94771112222",
    is_active: true,
    is_verified: true,
    is_featured: true,
    status: "active",
    suspended_at: null,
    deleted_at: null,
    owner_id: "user-owner-456",
    description: "Premium sports complex featuring multiple courts and international standard facilities.",
    sport: "Mixed Sports",
    amenities: ["Parking", "A/C", "Showers", "Equipment Rental", "Cafe", "WiFi"],
    rating: 4.8,
    pricePerHour: 4500,
    image: "https://images.unsplash.com/photo-155406886524-cecd4e34b8",
    imageUrl: "https://images.unsplash.com/photo-155406886524-cecd4e34b8",
    location: "Colombo",
    images: createGallery([
      "155406886524-cecd4e34b8",
      "1574629815560-b9c37e6",
      "1599586120429-f928e886"
    ])
  },
  {
    id: "venue-kandy-002",
    name: "Kandy Sports Hub",
    slug: "kandy-sports-hub",
    city: "Kandy",
    address: "56 Peradeniya Rd, Kandy 20000",
    lat: 7.2906,
    lng: 80.6337,
    operating_hours: "08:00 - 22:00",
    contact_number: "+94773334444",
    is_active: true,
    is_verified: true,
    is_featured: false,
    status: "active",
    suspended_at: null,
    deleted_at: null,
    owner_id: "user-owner-456",
    description: "Budget-friendly sports venue specialized in Cricket and Swimming.",
    sport: "Cricket / Swimming",
    amenities: ["Parking", "Changing Rooms", "Pro Shop"],
    rating: 4.2,
    pricePerHour: 1000,
    image: "https://images.unsplash.com/photo-1542880023-dfc37f446dbd",
    imageUrl: "https://images.unsplash.com/photo-1542880023-dfc37f446dbd",
    location: "Kandy",
    images: createGallery(["1542880023-dfc37f446dbd", "1519766304552-16694600"])
  },
  {
    id: "venue-galle-003",
    name: "Galle Fort Tennis Club",
    slug: "galle-fort-tennis",
    city: "Galle",
    address: "Church St, Galle 80000",
    lat: 6.0269,
    lng: 80.2170,
    operating_hours: "07:00 - 19:00",
    contact_number: "+94775556666",
    is_active: true,
    is_verified: false,
    is_featured: false,
    status: "pending",
    suspended_at: null,
    deleted_at: null,
    owner_id: "user-owner-456",
    description: "Historic tennis courts with a view of the ocean.",
    sport: "Tennis",
    amenities: ["Equipment Rental", "Coach Available"],
    rating: 0,
    pricePerHour: 2000,
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6",
    imageUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6",
    location: "Galle",
    images: createGallery(["1622279457486-62dcc4a431d6"])
  }
];

export const MOCK_COURTS: Court[] = [
  // CCC Courts
  {
    id: "court-ccc-1",
    venue_id: "venue-ccc-001",
    name: "Court A (Badminton)",
    description: "Standard badminton court with synthetic mat",
    sport_type: "Badminton",
    surface_type: "Mat",
    is_indoor: true,
    capacity: 4,
    images: [],
    hourly_rate: 1500,
    is_active: true,
    status: "available"
  },
  {
    id: "court-ccc-2",
    venue_id: "venue-ccc-001",
    name: "Court B (Badminton)",
    description: "Standard badminton court with synthetic mat",
    sport_type: "Badminton",
    surface_type: "Mat",
    is_indoor: true,
    capacity: 4,
    images: [],
    hourly_rate: 1500,
    is_active: true,
    status: "available"
  },
  {
    id: "court-ccc-3",
    venue_id: "venue-ccc-001",
    name: "Futsal Pitch",
    description: "5-a-side futsal pitch with FIFA standard turf",
    sport_type: "Futsal",
    surface_type: "Turf",
    is_indoor: true,
    capacity: 10,
    images: [],
    hourly_rate: 4500,
    is_active: true,
    status: "available"
  },
  // Kandy Courts
  {
    id: "court-kandy-1",
    venue_id: "venue-kandy-002",
    name: "Net 1 (Cricket)",
    description: "Cricket practice net with bowling machine",
    sport_type: "Cricket",
    surface_type: "Net",
    is_indoor: false,
    capacity: 2,
    images: [],
    hourly_rate: 1000,
    is_active: true,
    status: "available"
  },
  {
    id: "court-kandy-2",
    venue_id: "venue-kandy-002",
    name: "Swimming Pool",
    description: "25m lap pool with temperature control",
    sport_type: "Swimming",
    surface_type: "Tile",
    is_indoor: false,
    capacity: 20,
    images: [],
    hourly_rate: 800,
    is_active: true,
    status: "available"
  },
];

// ==========================================
// 3. Bookings Mock Data
// ==========================================

const today = new Date();

export const MOCK_BOOKINGS: Booking[] = [
  // Past Completed Booking
  {
    id: "bk-001",
    booking_reference: "BK-20250201-8X29",
    user_id: "user-player-123",
    court_id: "court-ccc-1",
    sport: "Badminton",
    hourly_rate: 1500,
    total_price: 3000,
    platform_fee: 150,
    venue_payout: 2850,
    status: "completed",
    payment_status: "paid",
    payment_method: "card",
    is_manual: false,
    is_paid: true,
    is_no_show: false,
    customer_name: "Dilshan Perera",
    customer_phone: "+94771234567",
    start_time: "2025-02-01T18:00:00",
    end_time: "2025-02-01T20:00:00",
    duration_hours: 2,
    created_at: "2025-01-28T10:00:00",
    cancelled_at: null,
    cancellation_reason: null,
    paid_at: "2025-01-28T10:05:00",
    court: { id: "court-ccc-1", name: "Court A (Badminton)", venue_name: "Colombo City Center Arena", venue_id: "venue-ccc-001", image: null }
  },
  // Upcoming Confirmed Booking
  {
    id: "bk-002",
    booking_reference: "BK-20250215-9Y31",
    user_id: "user-player-123",
    court_id: "court-ccc-3",
    sport: "Futsal",
    hourly_rate: 4500,
    total_price: 4500,
    platform_fee: 200,
    venue_payout: 4300,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "card",
    is_manual: false,
    is_paid: true,
    is_no_show: false,
    customer_name: "Dilshan Perera",
    customer_phone: "+94771234567",
    start_time: format(setHours(addDays(today, 2), 16), "yyyy-MM-dd'T'HH:mm:ss"),
    end_time: format(setHours(addDays(today, 2), 17), "yyyy-MM-dd'T'HH:mm:ss"),
    duration_hours: 1,
    created_at: format(addDays(today, -1), "yyyy-MM-dd'T'HH:mm:ss"),
    cancelled_at: null,
    cancellation_reason: null,
    paid_at: format(addDays(today, -1), "yyyy-MM-dd'T'HH:mm:ss"),
    court: { id: "court-ccc-3", name: "Futsal Pitch", venue_name: "Colombo City Center Arena", venue_id: "venue-ccc-001", image: null }
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-001",
    venue_id: "venue-ccc-001",
    venue_name: "Colombo City Center Arena",
    venue_image: MOCK_VENUES[0].images[0],
    user_id: "user-player-123",
    user_name: "Dilshan Perera",
    user_avatar: MOCK_USERS[0].profile_image,
    rating: 5,
    comment: "Amazing courts! The AC works perfectly, best place for badminton in Colombo.",
    created_at: "2025-02-02T10:00:00Z"
  }
];

export const MOCK_MANAGERS: VenueManager[] = [
  {
    id: "mgr-001",
    user_id: "user-manager-789",
    name: "Kamal De Silva",
    email: "manager@arena.lk",
    avatar: MOCK_USERS[2].profile_image,
    role: "venue_manager",
    invitation_status: "accepted",
    joined_at: "2025-02-01T08:00:00Z"
  }
];

export const MOCK_INVITATIONS: ManagerInvitation[] = [
  {
    id: "inv-001",
    email: "new-manager@test.com",
    venue_id: "venue-ccc-001",
    status: "pending",
    created_at: new Date().toISOString()
  }
];

// ==========================================
// 4. Helper Functions (Simulating Backend Logic)
// ==========================================

export const getSlotAvailability = (courtId: string, date: string): SlotAvailability[] => {
  const slots: SlotAvailability[] = [];
  const startHour = 6;
  const endHour = 22;

  for (let i = startHour; i < endHour; i++) {
    const isBooked = Math.random() < 0.3;
    const startTime = setHours(startOfHour(parseISO(date)), i);
    const endTime = setHours(startOfHour(parseISO(date)), i + 1);

    slots.push({
      start: format(startTime, "yyyy-MM-dd'T'HH:mm:ss"),
      end: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      status: isBooked ? "booked" : "available",
      price: 1500
    });
  }
  return slots;
};
// ==========================================
// 5. Gamification Mock Data
// ==========================================

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "ch-001",
    title: "First Steps",
    description: "Complete your first booking at any venue.",
    xp_reward: 50,
    icon: "trophy",
    type: "booking",
    target_count: 1
  },
  {
    id: "ch-002",
    title: "Court Regular",
    description: "Complete 5 bookings to prove your dedication.",
    xp_reward: 150,
    icon: "calendar",
    type: "booking",
    target_count: 5
  },
  {
    id: "ch-003",
    title: "Reviewer",
    description: "Leave a review for a venue you visited.",
    xp_reward: 30,
    icon: "star",
    type: "review",
    target_count: 1
  },
  {
    id: "ch-004",
    title: "Explorer",
    description: "Book courts at 3 different venues.",
    xp_reward: 100,
    icon: "map-pin",
    type: "scout",
    target_count: 3
  },
  {
    id: "ch-005",
    title: "Social Butterfly",
    description: "Invite a friend to join Arena.lk.",
    xp_reward: 75,
    icon: "users",
    type: "social",
    target_count: 1
  }
];

export const MOCK_ACHIEVEMENTS: UserAchievement[] = [
  // Player 1 Achievements
  {
    id: "ua-001",
    user_id: "user-player-123",
    challenge_id: "ch-001",
    progress: 1,
    is_completed: true,
    completed_at: "2025-01-20T10:00:00",
  },
  {
    id: "ua-002",
    user_id: "user-player-123",
    challenge_id: "ch-002",
    progress: 3, // 3 out of 5
    is_completed: false,
    completed_at: null,
  },
  {
    id: "ua-003",
    user_id: "user-player-123",
    challenge_id: "ch-004",
    progress: 2, // 2 out of 3 venues
    is_completed: false,
    completed_at: null,
  }
];
