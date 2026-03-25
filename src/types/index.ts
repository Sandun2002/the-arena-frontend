// === Auth ===
export type UserRole = "customer" | "venue_owner" | "venue_manager" | "admin";

export interface Sport {
  id: string;
  name: string;
  slug?: string; // Backend identifier
  icon?: string;
  imageUrl: string;
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
  bio?: string | null;
  is_active: boolean;
  roles: RoleResponse[];
  email_verified?: boolean;
  phone_verified?: boolean;
  is_mfa_enabled?: boolean;
  xp?: number;
  level?: number;
  created_at: string;
  updated_at: string | null;
}

export interface Session {
  id: string;
  user_agent: string;
  created_at: string;
  token_hint: string;
  is_current: boolean;
}

// === Venue ===
export type VenueStatus = "pending" | "approved" | "active" | "blocked" | "suspended" | "deleted";

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  city: string;
  address: string;
  geo_lat: number | null;
  geo_lng: number | null;
  phone_contact: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  amenities: { id: string; name: string }[];
  rating: number;
  review_count: number;
  total_reviews?: number;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  status: VenueStatus;
  cover_image: string | null;
  gallery_images: { id: string; url: string; is_cover: boolean; display_order: number }[];
  courts: Court[];
  operating_hours: {
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }[];
  available_sports?: string[];
  min_hourly_rate?: number | null;
  suspended_at: string | null;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface Court {
  id: string;
  venue_id: string;
  name: string;
  sport_type: { id: string; name: string };
  is_indoor: boolean;
  hourly_rate: number;
  peak_hourly_rate: number | null;
  cover_image: string | null;
  description: string | null;
  is_active: boolean;
}

export interface GalleryImage {
  id: string;
  url: string; // Keep for backward compatibility if any
  image_url: string; // Matches backend VenueImageResponse
  is_cover: boolean;
}

export interface Closure {
  id: string;
  venue_id: string;
  closure_date: string;
  reason: string | null;
}

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired" | "cancelled";

export interface VenueManager {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  invitation_status?: InvitationStatus;
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
export type BookingStatus = "payment_pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "blocked" | "maintenance";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "card" | "cash" | "bank_transfer";

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string | null;
  court_id: string;
  hourly_rate: number;
  subtotal: number;
  total_price: number;
  sport: string;
  platform_fee: number;
  venue_commission: number;
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
  hold_expires_at: string | null;
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
    sport_type: { id: string; name: string };
    cover_image: string | null;
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
  is_peak: boolean;
  price: number;
}

export interface SearchParams {
  city?: string;
  sport?: string;
  sport_type_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  sort_by?: "nearest" | "price_low" | "price_high";
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_more?: boolean;
}

export interface City {
  name: string;
}

export interface VenueSearchResult {
  venue_id: string;
  venue_name: string;
  venue_slug: string | null;
  city: string;
  address: string;
  distance_km: number | null;
  available_courts_count: number;
  total_courts_count: number;
  hourly_rate: number;
  cover_image: string | null;
  rating: number | null;
  review_count: number;
  amenities: string[];
  opening_time: string | null;
  closing_time: string | null;
}

export interface VenueSearchResponse {
  results: VenueSearchResult[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
  search_metadata: Record<string, unknown>;
}

export interface VenueSlotsResponse {
  venue_id: string;
  venue_name: string;
  date: string;
  is_closed: boolean;
  operating_hours: {
    opening: string | null;
    closing: string | null;
  } | null;
  courts: Array<{
    court_id: string;
    court_name: string;
    sport_type: string;
    hourly_rate: number;
    is_indoor: boolean;
    description: string | null;
    slots: Array<{
      start: string;
      end: string;
      date: string;
      status: "available" | "booked" | "held" | "closed";
    }>;
  }>;
}

// === Review ===
export interface Review {
  id: string;
  venue_id: string;
  venue_name: string;
  venue_image: string | null;
  booking_id: string | null;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified?: boolean;
  created_at: string;
  updated_at: string | null;
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
  bookings_trend?: number;
  revenue_trend?: number;
  pending_payments?: number;
  new_customers?: number;
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
  total_booked_hours: number;
  total_available_hours: number;
  status_breakdown: { label: string; hours: number; percentage: number }[];
  court_breakdown: { court_id: string; court_name: string; percentage: number }[];
}

export interface AnalyticsFees {
  total_platform_fees: number;
  net_payout: number;
  pending_payout: number;
  venue_commission: number;
  total_revenue: number;
  breakdown?: {
    platform_bookings: { count: number; revenue: number; platform_fees: number; venue_commission: number; venue_payout: number };
    manual_bookings: { count: number; revenue: number; platform_fees: number; venue_commission: number; venue_payout: number };
  };
}

export interface AnalyticsCancellations {
  total_cancellations: number;
  cancellation_rate: number;
  no_show_count: number;
  total_bookings: number;
  lost_revenue: number;
  rejected_bookings: number;
  no_show_rate: number;
  cancellation_reasons: Record<string, number>;
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
  id: string | number;
  title: string;
  description: string;
  xp_reward: number;
  icon: string;
  type: "booking" | "review" | "scout" | "social" | string;
  target_count: number;
}

export interface UserAchievement {
  id: string | number;
  user_id: string;
  challenge_id: string | number;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  challenge?: Challenge; // For hydration
}
