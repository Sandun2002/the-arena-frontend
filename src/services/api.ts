import { Venue, Sport, City, SearchParams, PaginatedResponse } from "@/types";
import apiClient from "./apiClient";

export const api = {
  getCities: async (): Promise<City[]> => {
    const response = await apiClient.get<City[]>('/search/cities');
    return response.data;
  },

  getSports: async (): Promise<Sport[]> => {
    // Attempt to get from a potential backend endpoint, or return empty if missing
    return apiClient.get<Sport[]>('/search/sports').then(res => res.data).catch(() => []);
  },

  getVenues: async (): Promise<Venue[]> => {
    const response = await apiClient.get<Venue[]>('/venues');
    return response.data;
  },

  getTrendingVenues: async (): Promise<Venue[]> => {
    const response = await apiClient.get<Venue[]>('/venues/featured');
    return response.data;
  },

  getFeaturedVenues: async (): Promise<Venue[]> => {
    const response = await apiClient.get<Venue[]>('/venues/featured');
    return response.data;
  },

  getVenueById: async (id: string): Promise<Venue> => {
    const response = await apiClient.get<Venue>(`/venues/${id}`);
    return response.data;
  },

  searchVenues: async (params: SearchParams): Promise<PaginatedResponse<Venue>> => {
    const response = await apiClient.get<PaginatedResponse<Venue>>('/search/venues', { params });
    return response.data;
  },

  getVenueSlots: async (venueId: string, date: string): Promise<any> => {
    const response = await apiClient.get(`/venues/${venueId}/slots`, { params: { date } });
    return response.data;
  },

  getVenueReviews: async (venueId: string): Promise<any> => {
    const response = await apiClient.get(`/venues/${venueId}/reviews`);
    return response.data;
  },

  getVenueReviewStats: async (venueId: string): Promise<any> => {
    const response = await apiClient.get(`/venues/${venueId}/reviews/stats`);
    return response.data;
  }
};