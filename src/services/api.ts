// src/services/api.ts
import { Venue } from "@/types";
import { MOCK_VENUES } from "./mockData";

// Simulate a network delay to test loading states (smooth UX)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Get all venues
  getVenues: async (): Promise<Venue[]> => {
    await delay(500); // Fake 0.5s loading time
    return MOCK_VENUES;
  },

  // Get only "Trending" venues
  getTrendingVenues: async (): Promise<Venue[]> => {
    await delay(500);
    return MOCK_VENUES.filter((v) => v.isPopular);
  },

  // Get single venue by ID (for details page)
  getVenueById: async (id: string): Promise<Venue | undefined> => {
    await delay(300);
    return MOCK_VENUES.find((v) => v.id === id);
  },
  
  // Placeholder for future Python API Search
  searchVenues: async (query: string): Promise<Venue[]> => {
    await delay(500);
    const lowerQuery = query.toLowerCase();
    return MOCK_VENUES.filter(v => 
      v.name.toLowerCase().includes(lowerQuery) || 
      v.location.toLowerCase().includes(lowerQuery) ||
      v.sport.toLowerCase().includes(lowerQuery)
    );
  }
};