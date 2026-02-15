// === Auth ===
export type UserRole = "customer" | "venue_owner" | "venue_manager" | "admin";

export interface Sport {
  id: string;
  name: string;
  icon: string;
  imageUrl: string; // Backward compatibility
  isActive: boolean;
}

export interface RoleResponse {
  id: number;
  name: string;
  slug: UserRole;
  description: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  profile_image: string | null;
  bio: string | null;
  is_active: boolean;
  roles: RoleResponse[];
  email_verified: boolean;
  phone_verified: boolean;
  verification_status: "unverified" | "pending" | "verified";
  is_mfa_enabled: boolean;
  xp: number;
  level: number;
  next_level_xp: number;
  xp_progress_percent: number;
  created_at: string;
  updated_at: string | null;
}

export interface Session {
  jti: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

// === Venue ===
export type VenueStatus = "pending" | "approved" | "active" | "blocked" | "suspended" | "deleted";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string;
  sport: string; // Backward compatibility
  city: string;
  location: string; // Backward compatibility
  address: string;
  lat: number;
  lng: number;
  operating_hours: string;
  contact_number: string;
  pricePerHour: number; // Backward compatibility
  amenities: string[];
  rating: number;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  status: VenueStatus;
  owner_id: string;
  image: string; // For backward compatibility
  imageUrl: string; // For backward compatibility
  images: string[];
  suspended_at: string | null;
  deleted_at: string | null;
}

export interface Court {
  id: string;
  venue_id: string;
  name: string;
  sport_type: string;
  surface_type: string;
  is_indoor: boolean;
  hourly_rate: number;
  capacity: number;
  images: string[];
  description: string;
  is_active: boolean;
  status: "available" | "maintenance" | "closed";
}

export interface GalleryImage {
  id: string;
  url: string;
  is_cover: boolean;
}

export interface Closure {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  courts: string[]; // IDs
  reason: string;
  type: string;
}

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired" | "cancelled";

export interface VenueManager {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  invitation_status: InvitationStatus;
  joined_at?: string;
}

export interface ManagerInvitation {
  id: string;
  email: string;
  venue_id: string;
  status: InvitationStatus;
  created_at: string;
}

// === Booking ===
export type BookingStatus = "payment_pending" | "confirmed" | "completed" | "cancelled" | "rejected";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "card" | "cash" | "bank_transfer";

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string | null;
  court_id: string;
  sport: string;
  hourly_rate: number;
  total_price: number;
  platform_fee: number;
  venue_payout: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  is_manual: boolean;
  is_paid: boolean;
  is_no_show: boolean;
  customer_name: string | null;
  customer_phone: string | null;
  start_time: string;
  end_time: string;
  duration_hours: number;
  created_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  paid_at: string | null;
  notes?: string;
  court?: {
    id: string;
    name: string;
    venue_name: string;
    venue_id: string;
    image: string | null;
  } | null;
  user?: {
    full_name: string;
    phone_number: string;
  } | null;
}

export interface SlotAvailability {
  start: string;
  end: string;
  status: "available" | "booked" | "held";
  price?: number;
}

// === Review ===
export interface Review {
  id: string;
  venue_id: string;
  venue_name: string;
  venue_image: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewStats {
  average: number;
  total: number;
  breakdown: Record<number, number>;
}

// === Dashboard ===
export interface DashboardStats {
  total_bookings: number;
  today_bookings: number;
  revenue: number | null;
  active_courts: number;
  total_courts: number;
  // New fields for charts
  revenue_trend?: number;
  bookings_trend?: number;
}

export interface RevenueData {
  daily: { date: string; amount: number }[];
  weekly: { date: string; amount: number }[];
  monthly: { date: string; amount: number }[];
}

export interface AnalyticsRevenue {
  total: number;
  trend_percentage: number;
  breakdown: RevenueData;
}

export interface AnalyticsUtilization {
  overall_percentage: number;
  peak_hours: { time: string; percentage: number }[];
  court_breakdown: { court_id: string; court_name: string; percentage: number }[];
}

export interface AnalyticsFees {
  total_platform_fees: number;
  net_payout: number;
  pending_payout: number;
}

export interface AnalyticsCancellations {
  total_cancellations: number;
  cancellation_rate: number;
  no_show_count: number;
}

// === Recurring Bookings ===
export interface RecurringBooking {
  id: string;
  venue_id: string;
  court_id: string;
  court_name: string; // Hydrated
  client_name: string;
  client_phone?: string;
  day_of_week: string; // "Monday", "Tuesday", etc.
  start_time: string; // "10:00"
  end_time: string; // "11:00"
  start_date: string; // ISO Date
  end_date: string; // ISO Date
  status: "active" | "paused" | "expired" | "cancelled";
  next_booking_date: string | null;
  price_per_hour: number;
  total_value?: number;
}

// === Venue Profile ===
export interface VenueProfile extends Venue {
  operating_schedule: {
    day: string; // "monday"
    open: string; // "09:00"
    close: string; // "22:00"
    is_closed: boolean;
  }[];
}

export interface UpcomingBooking {
  id: string;
  court_name: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  status: BookingStatus;
}


// === Gamification ===
export interface Challenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  icon: string;
  type: "booking" | "review" | "scout" | "social";
  target_count: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  challenge?: Challenge; // For hydration
}
