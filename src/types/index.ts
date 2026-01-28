// src/types/index.ts

export interface Venue {
  id: string;
  name: string;
  slug: string; // URL-friendly name (e.g., "grand-arena")
  location: string;
  sport: string; // Made dynamic - no longer hardcoded union
  rating: number;
  pricePerHour: number;
  imageUrl: string;
  isPopular?: boolean; // For "Trending" section
  isPremium?: boolean; // For "Premium Collection"
  isFeatured?: boolean; // For Hero Carousel (paid premium slot)
  amenities: string[];
  description: string;
}

export interface FilterOptions {
  sport?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
}

// Sport type for dynamic sport management (admin can add/remove)
export interface Sport {
  id: string;
  name: string;
  imageUrl: string; // Sport image URL - admin can upload any image
  isActive: boolean; // Can be toggled from admin panel
}