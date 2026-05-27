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
  // Cash booking enforcement
  can_book_cash?: boolean;
  cash_no_show_count?: number;
  cash_cooldown_until?: string | null;
  cash_blacklisted_at?: string | null;
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
  br_document_url?: string | null;
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
  // Cash booking settings
  max_unpaid_cash_bookings?: number;
  accepted_payment_methods?: VenuePaymentAcceptance;
  payment_config?: {
    card: boolean;
    cash: boolean;
    bank_transfer: boolean;
  };
  cash_requires_approval?: boolean;
  cash_approval_ttl_minutes?: number;
  bank_transfer_ttl_minutes?: number;
  has_bank_details?: boolean;
  bank_account_holder_name?: string | null;
  bank_name?: string | null;
  bank_branch_name?: string | null;
  bank_account_number_masked?: string | null;
  bank_account_type?: string | null;
  subscription?: VenueSubscription | null;
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

// Backend BookingStatus enum (models/base.py). Keep this in sync exactly.
export type BookingStatus = "payment_pending" | "pending_approval" | "confirmed" | "completed" | "cancelled" | "rejected" | "expired";
export type PaymentStatus = "pending" | "awaiting_verification" | "paid" | "refunded" | "failed";
export type PaymentMethod = "card" | "cash" | "bank_transfer";
export type VenuePaymentAcceptance = "card_only" | "cash_only" | "both";

export type SubscriptionPlanCode = "standard" | "premium";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "expired" | "pending_payment" | "failed";

export interface VenueSubscription {
  id: string | null;
  venue_id: string;
  plan_code: SubscriptionPlanCode;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  activated_at: string | null;
  cancelled_at: string | null;
  payhere_order_id: string | null;
  last_payment_amount: number | null;
  last_payment_currency: string;
  last_payment_status: string | null;
  is_premium: boolean;
  is_active: boolean;
}

export interface SubscriptionPlan {
  code: SubscriptionPlanCode;
  name: string;
  monthly_price_lkr: number;
  venue_commission_percentage: number;
  features: string[];
  recommended: boolean;
}


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
  venue_subscription_plan?: SubscriptionPlanCode;
  venue_subscription_id?: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  is_manual: boolean;
  is_paid: boolean;
  is_no_show: boolean;
  is_blocked: boolean;
  block_reason: string | null;
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
    venue?: { id: string; name: string; owner_id: string } | null;
  } | null;
  user?: {
    full_name: string;
    phone_number: string;
    email?: string;
  } | null;
  review?: Review | null;
  // Cash booking fields
  is_cash_booking?: boolean;
  check_in_code?: string;
  checked_in_at?: string | null;
  checked_in_by_id?: string | null;
  approval_expires_at?: string | null;
  approved_by_id?: string | null;
  approved_at?: string | null;
  bank_transfer_slip_url?: string | null;
  bank_transfer_slip_uploaded_at?: string | null;
  bank_transfer_reference?: string | null;
  is_cash_unpaid?: boolean;
  can_free_cancel?: boolean;
  total_platform_fees?: number;
}

// Slot statuses are computed by backend (api/v1/endpoints/venues.py).
// `closed` is not currently emitted per-slot but is reserved for future use
// (e.g. partially-closed days).
export type SlotStatus = "available" | "booked" | "maintenance" | "recurring" | "closed";

export interface SlotAvailability {
  start: string;
  end: string;
  status: SlotStatus;
  is_peak: boolean;
  price: number;
}

export interface RecurringBlock {
  id: string;
  court_id: string;
  court_name: string;
  customer_name: string;
  start_time: string;
  end_time: string;
  status: "recurring";
  is_recurring: true;
  day_of_week: number;
}

export interface ScheduleData {
  bookings: Booking[];
  recurringBlocks: RecurringBlock[];
  isClosed: boolean;
  closureReason: string | null;
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
  closure_reason: string | null;
  operating_hours: {
    opening: string | null;
    closing: string | null;
  } | null;
  peak_hours?: {
    has_peak_config: boolean;
    today_windows: { start: string; end: string }[];
    // Backward-compat keys
    peak_start_time: string | null;
    peak_end_time: string | null;
    peak_days: string | null;
  };
  courts: Array<{
    court_id: string;
    court_name: string;
    sport_type: string;
    hourly_rate: number;
    peak_hourly_rate: number | null;
    is_indoor: boolean;
    description: string | null;
    is_active: boolean;
    slots: Array<{
      start: string;
      end: string;
      date: string;
      status: SlotStatus;
      is_peak: boolean;
      effective_rate: number;
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
  user_xp?: number;
  user_level?: number;
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
  total_platform_revenue: number;
  breakdown?: {
    card_bookings: { count: number; revenue: number; platform_fees: number; venue_commission: number; venue_payout: number };
    cash_bookings: { count: number; revenue: number; platform_fees: number; venue_commission: number; venue_payout: number; collected_count: number; collected_revenue: number };
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

export interface BankDetailsUpdate {
  bank_account_holder_name: string;
  bank_name: string;
  bank_branch_name: string;
  bank_account_number: string;
  bank_account_type: "savings" | "current";
}

export interface BankDetailsResponse {
  bank_account_holder_name: string | null;
  bank_name: string | null;
  bank_branch_name: string | null;
  bank_account_number_masked: string | null;
  bank_account_type: "savings" | "current" | null;
  has_bank_details: boolean;
}

// === Peak Windows (multi-window per-day peak pricing) ===
export interface PeakWindow {
  id: string;
  day_of_week: number; // 0=Mon … 6=Sun
  start_time: string;  // "HH:MM"
  end_time: string;    // "HH:MM" (== start_time means all-day)
}

export interface DayPeakSummary {
  day_of_week: number;
  day_label: string;   // "Monday", "Tuesday", …
  windows: PeakWindow[];
}

export interface PeakWindowsResponse {
  days: DayPeakSummary[]; // Always 7 items (Mon–Sun)
  has_peak_config: boolean;
}

export interface PeakWindowInput {
  day_of_week: number;
  start_time: string;  // "HH:MM"
  end_time: string;    // "HH:MM"
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
  slug: string;
  title: string;
  description: string;
  xp_reward: number;
  icon: string;
  type: "weekly" | "explorer" | "loyalty" | "streak" | "timing" | "milestone" | "general" | string;
  category: "weekly" | "explorer" | "loyalty" | "streak" | "timing" | "milestone" | "general";
  target_count: number;
  is_permanent: boolean;
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
