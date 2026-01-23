// src/services/mockData.ts
import { Venue } from "@/types";

export const MOCK_VENUES: Venue[] = [
  {
    id: "1",
    name: "Neon Sky Court",
    slug: "neon-sky-court",
    location: "Downtown District, NY",
    sport: "Basketball",
    rating: 4.9,
    pricePerHour: 120,
    imageUrl: "https://images.unsplash.com/photo-1505666287802-9311e90be4c9?q=80&w=2671&auto=format&fit=crop",
    isPopular: true,
    isPremium: true,
    amenities: ["Night Lighting", "Showers", "Locker Room", "Parking"],
    description: "A high-end rooftop basketball court with panoramic city views and professional-grade flooring."
  },
  {
    id: "2",
    name: "Emerald Turf Arena",
    slug: "emerald-turf-arena",
    location: "Greenwich Zone, London",
    sport: "Football",
    rating: 4.8,
    pricePerHour: 150,
    imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2670&auto=format&fit=crop",
    isPopular: true,
    amenities: ["FIFA Standard Turf", "Floodlights", "Spectator Stand"],
    description: "Experience professional 5-a-side football on our premium synthetic turf."
  },
  {
    id: "3",
    name: "Ace Performance Club",
    slug: "ace-performance-club",
    location: "Beverly Hills, CA",
    sport: "Tennis",
    rating: 5.0,
    pricePerHour: 200,
    imageUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=2670&auto=format&fit=crop",
    isPremium: true,
    amenities: ["Clay Courts", "Private Coaching", "Equipment Rental"],
    description: "Elite clay courts maintained to international standards for the ultimate tennis experience."
  },
  {
    id: "4",
    name: "Shuttle Zone Pro",
    slug: "shuttle-zone-pro",
    location: "Tech Park, Singapore",
    sport: "Badminton",
    rating: 4.7,
    pricePerHour: 40,
    imageUrl: "https://images.unsplash.com/photo-1626224583764-84786c71b170?q=80&w=2670&auto=format&fit=crop",
    amenities: ["Synthetic Mats", "Air Conditioning", "Pro Shop"],
    description: "Indoor badminton facility optimized for high-performance training."
  },
  {
    id: "5",
    name: "Iron Paradise Gym",
    slug: "iron-paradise-gym",
    location: "Venice Beach, CA",
    sport: "Gym",
    rating: 4.9,
    pricePerHour: 25,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop",
    isPopular: true,
    amenities: ["Sauna", "Personal Trainers", "Juice Bar"],
    description: "Raw, industrial-style gym equipped with the latest Hammer Strength machinery."
  }
];