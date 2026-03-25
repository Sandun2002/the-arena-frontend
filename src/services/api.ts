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
        imageUrl: getSportImage(sport.name),
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
    // The backend returns a bare List[Venue], so response.data is the array itself
    const response = await apiClient.get<any[]>('/venues/featured/list');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeVenue);
  },

  getFeaturedVenues: async (): Promise<Venue[]> => {
    return api.getTrendingVenues();
  },

  getVenueById: async (id: string): Promise<Venue> => {
    const response = await apiClient.get<any>(`/venues/${id}`);
    return normalizeVenue(response.data);
  },

  searchVenues: async (params: SearchParams): Promise<VenueSearchResponse> => {
    const response = await apiClient.get<VenueSearchResponse>('/search/courts', {
      params: {
        ...params,
        page: undefined,
        page_size: undefined,
        limit: params.page_size,
        skip: params.page && params.page_size ? (params.page - 1) * params.page_size : 0,
      },
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