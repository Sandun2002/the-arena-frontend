import { City, SearchParams, Sport, Venue, VenueSearchResponse, VenueSlotsResponse } from "@/types";
import apiClient from "./apiClient";
import { createSport, normalizeCities, normalizeReview, normalizeReviewStats, normalizeVenue, getSportImage } from "./normalizers";

interface VenueListApiResponse {
  venues: any[];
}

interface FeaturedVenueApiResponse {
  venues?: any[];
}

interface CitiesApiResponse {
  cities: string[];
}

interface SportTypePublicResponse {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
}

export const api = {
  getCities: async (): Promise<City[]> => {
    const response = await apiClient.get<CitiesApiResponse>('/search/cities');
    return normalizeCities(response.data.cities || []);
  },

  getSports: async (): Promise<Sport[]> => {
    try {
      const response = await apiClient.get<SportTypePublicResponse[]>('/sports');
      return (response.data || []).map(sport => ({
        id: sport.id,
        name: sport.display_name, // Display name for UI
        slug: sport.name,         // Slug name for API filtering
        imageUrl: sport.icon || getSportImage(sport.name),
        isActive: true,
      }));
    } catch (error) {
      console.error("Failed to fetch sports from API, falling back to venue-derived list", error);
      // Fallback to old "dumb" logic if /sports fails
      const venues = await api.getVenues();
      const sportNames = Array.from(
        new Set(venues.flatMap((venue) => venue.available_sports || venue.courts.map((court) => court.sport_type.name)))
      );
      return sportNames.map(createSport);
    }
  },

  getVenues: async (): Promise<Venue[]> => {
    const response = await apiClient.get<VenueListApiResponse>('/venues/');
    return (response.data.venues || []).map(normalizeVenue);
  },

  getTrendingVenues: async (): Promise<Venue[]> => {
    // Booking-activity-based trending venues (last 14 days, time-decayed score)
    const response = await apiClient.get<any[]>('/venues/trending/list');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeVenue);
  },

  getFeaturedVenues: async (): Promise<Venue[]> => {
    // Admin-curated featured venues — used by the Hero carousel only
    const response = await apiClient.get<any[]>('/venues/featured/list');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeVenue);
  },

  getVenueById: async (id: string): Promise<Venue> => {
    const response = await apiClient.get<any>(`/venues/${id}`);
    return normalizeVenue(response.data);
  },

  searchVenues: async (params: SearchParams): Promise<VenueSearchResponse> => {
    // Build clean params — only send keys the backend accepts, skip undefined values
    const cleanParams: Record<string, any> = {};

    if (params.sport)       cleanParams.sport       = params.sport;
    if (params.date)        cleanParams.date         = params.date;
    if (params.start_time)  cleanParams.start_time   = params.start_time;
    if (params.end_time)    cleanParams.end_time     = params.end_time;
    if (params.city)        cleanParams.city         = params.city;
    if (params.lat != null) cleanParams.lat          = params.lat;
    if (params.lng != null) cleanParams.lng          = params.lng;
    if (params.radius_km != null) cleanParams.radius_km = params.radius_km;
    if (params.sort_by)     cleanParams.sort_by      = params.sort_by;
    if (params.page)        cleanParams.page         = params.page;
    if (params.page_size)   cleanParams.page_size    = params.page_size;

    const response = await apiClient.get<VenueSearchResponse>('/search/courts', {
      params: cleanParams,
    });
    return response.data;
  },

  getVenueSlots: async (venueId: string, date: string, sport?: string): Promise<VenueSlotsResponse> => {
    const response = await apiClient.get(`/venues/${venueId}/slots`, { params: { target_date: date, sport } });
    return response.data;
  },

  getVenueReviews: async (venueId: string, venue?: Venue | null): Promise<ReturnType<typeof normalizeReview>[]> => {
    const response = await apiClient.get(`/venues/${venueId}/reviews`);
    return (response.data.reviews || []).map((review: any) => normalizeReview(review, venue));
  },

  getVenueReviewStats: async (venueId: string) => {
    const response = await apiClient.get(`/venues/${venueId}/reviews/stats`);
    return normalizeReviewStats(response.data);
  }
};