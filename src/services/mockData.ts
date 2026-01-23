// src/services/mockData.ts
import { Venue } from "@/types";

export const MOCK_VENUES: Venue[] = [
  {
    id: "1",
    name: "Colombo Cricket Academy",
    slug: "colombo-cricket-academy",
    location: "Colombo 4, Sri Lanka",
    sport: "Cricket",
    rating: 4.9,
    pricePerHour: 2500,
    imageUrl: "https://images.unsplash.com/photo-1595225476933-0efb8b9d9d38?q=80&w=2670&auto=format&fit=crop",
    isPopular: true,
    isPremium: true,
    amenities: ["Full Ground", "Floodlights", "Professional Pitch", "Equipment Rental"],
    description: "Premium cricket venue with international-standard pitch in the heart of Colombo."
  },
  {
    id: "2",
    name: "Elite Futsal Arena",
    slug: "elite-futsal-arena",
    location: "Colombo 5, Sri Lanka",
    sport: "Futsal",
    rating: 4.8,
    pricePerHour: 1800,
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2670&auto=format&fit=crop",
    isPopular: true,
    amenities: ["Synthetic Court", "Floodlights", "Changing Rooms", "Spectator Area"],
    description: "State-of-the-art indoor futsal facility perfect for competitive matches."
  },
  {
    id: "3",
    name: "Azure Swimming Complex",
    slug: "azure-swimming-complex",
    location: "Colombo 3, Sri Lanka",
    sport: "Swimming",
    rating: 5.0,
    pricePerHour: 1200,
    imageUrl: "https://images.unsplash.com/photo-1576610616656-570f080db29c?q=80&w=2670&auto=format&fit=crop",
    isPremium: true,
    amenities: ["Olympic Pool", "Training Programs", "Professional Coaching", "Sauna"],
    description: "Olympic-size swimming pool with professional coaching and premium facilities."
  },
  {
    id: "4",
    name: "Champions Badminton Hall",
    slug: "champions-badminton-hall",
    location: "Colombo 7, Sri Lanka",
    sport: "Badminton",
    rating: 4.7,
    pricePerHour: 800,
    imageUrl: "https://images.unsplash.com/photo-1626224583764-84786c71b170?q=80&w=2670&auto=format&fit=crop",
    amenities: ["Air Conditioned Courts", "Professional Shuttles", "Coaching Available"],
    description: "Indoor badminton facility with professional-grade courts and coaching services."
  },
  {
    id: "5",
    name: "Prestige Basketball Court",
    slug: "prestige-basketball-court",
    location: "Colombo 6, Sri Lanka",
    sport: "Basketball",
    rating: 4.8,
    pricePerHour: 1500,
    imageUrl: "https://images.unsplash.com/photo-1505666287802-9311e90be4c9?q=80&w=2671&auto=format&fit=crop",
    isPopular: true,
    amenities: ["Professional Court", "Floodlights", "Scoreboard", "Locker Rooms"],
    description: "Premium basketball facility with professional-grade court and modern amenities."
  }
];