import {
  Booking,
  City,
  Court,
  Review,
  ReviewStats,
  Session,
  Sport,
  User,
  Venue,
  VenueManager,
} from "@/types";

const SPORT_IMAGE_MAP: Record<string, string> = {
  badminton: "/sports/badminton.png",
  basketball: "/sports/basketball.png",
  cricket: "/sports/cricket.png",
  football: "/sports/futsal.png", // Changed to futsal as football.png is missing
  futsal: "/sports/futsal.png",
  pickleball: "/sports/pickleball.png",
  pool: "/sports/pool.png",
  squash: "/sports/squash.png",
  swimming: "/sports/swimming.png",
  tennis: "/sports/tennis.png",
};

const toTitleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const getSportImage = (name: string) => {
  const key = name.trim().toLowerCase();
  return SPORT_IMAGE_MAP[key] || "/sports/futsal.png";
};

export const createSport = (name: string): Sport => ({
  id: name.trim().toLowerCase().replace(/\s+/g, "-"),
  name: toTitleCase(name),
  slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
  imageUrl: getSportImage(name),
  isActive: true,
});

export const normalizeGalleryImage = (raw: any) => ({
  id: String(raw.id),
  url: raw.image_url ?? raw.url,
  image_url: raw.image_url ?? raw.url, // Keep both for safety
  is_cover: Boolean(raw.is_cover),
  display_order: Number(raw.display_order ?? 0),
});

export const normalizeCourt = (raw: any): Court => ({
  id: String(raw.id),
  venue_id: String(raw.venue_id),
  name: raw.name,
  sport_type: {
    id: String(raw.sport_type_id ?? raw.sport_type?.id ?? raw.sport_type ?? raw.name),
    name: typeof raw.sport_type === "string" ? raw.sport_type : raw.sport_type?.name ?? "Sport",
  },
  is_indoor: Boolean(raw.is_indoor),
  hourly_rate: Number(raw.hourly_rate ?? 0),
  peak_hourly_rate: raw.peak_hourly_rate ?? null,
  cover_image: raw.cover_image ?? null,
  description: raw.description ?? null,
  is_active: Boolean(raw.is_active ?? true),
});

export const normalizeVenue = (raw: any): Venue => {
  const courts = Array.isArray(raw.courts) ? raw.courts.map(normalizeCourt) : [];
  const availableSports = Array.isArray(raw.available_sports)
    ? raw.available_sports.map((sport: string) => String(sport))
    : Array.from(new Set(courts.map((court: Court) => court.sport_type.name)));

  return {
    id: String(raw.id),
    owner_id: String(raw.owner_id ?? ""),
    name: raw.name,
    slug: raw.slug ?? null,
    description: raw.description ?? null,
    city: raw.city,
    address: raw.address,
    geo_lat: raw.geo_lat ?? raw.lat ?? null,
    geo_lng: raw.geo_lng ?? raw.lng ?? null,
    opening_time: raw.opening_time ?? null,
    closing_time: raw.closing_time ?? null,
    phone_contact: raw.phone_contact ?? raw.contact_number ?? null,
    amenities: Array.isArray(raw.amenities)
      ? raw.amenities.map((amenity: any) => ({ id: String(amenity.id ?? amenity.name), name: amenity.name }))
      : [],
    rating: Number(raw.average_rating ?? raw.rating ?? 0),
    review_count: Number(raw.review_count ?? raw.total_reviews ?? 0),
    total_reviews: Number(raw.total_reviews ?? raw.review_count ?? 0),
    is_active: Boolean(raw.is_active ?? true),
    is_verified: Boolean(raw.is_verified ?? false),
    is_featured: Boolean(raw.is_featured ?? false),
    status: raw.status ?? (raw.is_active ? "active" : "pending"),
    cover_image: raw.cover_image ?? null,
    gallery_images: Array.isArray(raw.gallery_images)
      ? raw.gallery_images.map(normalizeGalleryImage)
      : [],
    courts,
    operating_hours: Array.isArray(raw.operating_hours)
      ? raw.operating_hours.map((hour: any) => ({
          day_of_week: Number(hour.day_of_week),
          open_time: hour.open_time ?? null,
          close_time: hour.close_time ?? null,
          is_closed: Boolean(hour.is_closed),
        }))
      : [],
    available_sports: availableSports,
    min_hourly_rate: courts.length > 0 ? Math.min(...courts.map((court: Court) => court.hourly_rate)) : null,
    suspended_at: raw.suspended_at ?? null,
    deleted_at: raw.deleted_at ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at ?? null,
  };
};

export const normalizeUser = (raw: any): User => ({
  ...raw,
  profile_image: raw.profile_image ?? null,
  bio: raw.bio ?? null,
  is_mfa_enabled: Boolean(raw.is_mfa_enabled ?? false),
  xp: Number(raw.xp ?? 0),
  level: Number(raw.level ?? 1),
  next_level_xp: Number(raw.next_level_xp ?? 0),
  xp_progress_percent: Number(raw.xp_progress_percent ?? 0),
  email_verified: Boolean(raw.email_verified ?? false),
  phone_verified: Boolean(raw.phone_verified ?? false),
  verification_status: raw.verification_status ?? "unverified",
});

export const normalizeBooking = (raw: any): Booking => ({
  id: String(raw.id),
  booking_reference: raw.booking_reference ?? raw.reference_number,
  user_id: raw.user_id ? String(raw.user_id) : null,
  court_id: String(raw.court_id ?? raw.court?.id ?? ""),
  hourly_rate: Number(raw.hourly_rate ?? 0),
  subtotal: Number(raw.subtotal ?? raw.total_price ?? 0),
  total_price: Number(raw.total_price ?? raw.subtotal ?? 0),
  platform_fee: Number(raw.platform_fee ?? raw.service_fee ?? 0),
  venue_commission: Number(raw.venue_commission ?? 0),
  venue_payout: Number(raw.venue_payout ?? 0),
  status: raw.status,
  payment_status: raw.payment_status,
  payment_method: raw.payment_method,
  is_manual: Boolean(raw.is_manual ?? false),
  is_paid: Boolean(raw.is_paid ?? raw.payment_status === "paid"),
  is_no_show: Boolean(raw.is_no_show ?? false),
  customer_name: raw.customer_name ?? null,
  customer_phone: raw.customer_phone ?? null,
  start_time: raw.start_time,
  end_time: raw.end_time,
  duration_hours: Number(raw.duration_hours ?? 1),
  hold_expires_at: raw.hold_expires_at ?? null,
  created_at: raw.created_at,
  cancelled_at: raw.cancelled_at ?? null,
  cancellation_reason: raw.cancellation_reason ?? null,
  paid_at: raw.paid_at ?? null,
  notes: raw.notes,
  court: raw.court
    ? {
        id: String(raw.court.id),
        name: raw.court.name,
        venue_name: raw.court.venue?.name ?? raw.court.venue_name ?? "Venue",
        venue_id: String(raw.court.venue?.id ?? raw.court.venue_id ?? ""),
        sport_type: {
          id: String(raw.court.sport_type_id ?? raw.court.sport_type?.id ?? raw.court.sport_type ?? "sport"),
          name: typeof raw.court.sport_type === "string" ? raw.court.sport_type : raw.court.sport_type?.name ?? "Sport",
        },
        cover_image: raw.court.cover_image ?? null,
      }
    : null,
  user: raw.user
    ? {
        full_name: raw.user.full_name,
        phone_number: raw.user.phone_number,
      }
    : null,
});

export const normalizeSession = (raw: any): Session => {
  const browserUserAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  return {
    id: String(raw.device_id ?? raw.token_hint),
    user_agent: raw.user_agent ?? "Unknown device",
    created_at: raw.created_at ?? new Date().toISOString(),
    token_hint: raw.token_hint ?? "",
    is_current: Boolean(browserUserAgent && raw.user_agent && browserUserAgent === raw.user_agent),
  };
};

export const normalizeVenueManager = (raw: any): VenueManager => ({
  id: String(raw.id),
  user_id: String(raw.id),
  name: raw.full_name,
  email: raw.email,
  avatar: raw.profile_image ?? null,
  role: raw.roles?.map((role: any) => role.slug ?? role.name).join(", ") || "venue_manager",
  joined_at: raw.created_at,
});

export const normalizeReview = (raw: any, venue?: Venue | null): Review => ({
  id: String(raw.id),
  venue_id: String(raw.venue_id ?? venue?.id ?? ""),
  venue_name: venue?.name ?? raw.venue_name ?? "Venue",
  venue_image: venue?.cover_image ?? raw.venue_image ?? null,
  booking_id: raw.booking_id ? String(raw.booking_id) : null,
  user_id: String(raw.user_id ?? raw.user?.id ?? ""),
  user_name: raw.user?.full_name ?? raw.user_name ?? "Player",
  user_avatar: raw.user?.profile_image ?? raw.user_avatar ?? null,
  rating: Number(raw.rating ?? 0),
  title: raw.title ?? null,
  comment: raw.comment,
  is_verified: Boolean(raw.is_verified ?? false),
  created_at: raw.created_at,
  updated_at: raw.updated_at ?? null,
});

export const normalizeReviewStats = (raw: any): ReviewStats => ({
  average: Number(raw.average_rating ?? 0),
  total: Number(raw.total_reviews ?? 0),
  breakdown: raw.rating_distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
});

export const normalizeCities = (cities: string[]): City[] =>
  cities.map((city) => ({ name: city }));