// src/types/index.ts

export interface Venue {
  id: string;
  name: string;
  slug: string; // URL-friendly name (e.g., "grand-arena")
  location: string;
  sport: "Cricket" | "Badminton" | "Futsal" | "Swimming" | "Basketball" | "Tennis" | "Pickleball" | "Table Tennis" | "Squash" | "Pool";
  rating: number;
  pricePerHour: number;
  imageUrl: string;
  isPopular?: boolean; // For "Trending" section
  isPremium?: boolean; // For "Premium Collection"
  amenities: string[];
  description: string;
}

export interface FilterOptions {
  sport?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
}