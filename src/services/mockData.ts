// src/services/mockData.ts
import { Venue, Sport } from "@/types";

// Mock Sports Data - 10 sports that can be managed from admin panel
export const MOCK_SPORTS: Sport[] = [
  { id: "1", name: "Cricket", imageUrl: "/sports/cricket.png", isActive: true },
  { id: "2", name: "Badminton", imageUrl: "/sports/badminton.png", isActive: true },
  { id: "3", name: "Futsal", imageUrl: "/sports/futsal.png", isActive: true },
  { id: "4", name: "Swimming", imageUrl: "/sports/swimming.png", isActive: true },
  { id: "5", name: "Basketball", imageUrl: "/sports/basketball.png", isActive: true },
  { id: "6", name: "Tennis", imageUrl: "/sports/tennis.png", isActive: true },
  { id: "7", name: "Pickleball", imageUrl: "/sports/pickleball.png", isActive: true },
  { id: "8", name: "Table Tennis", imageUrl: "/sports/table-tennis.png", isActive: true },
  { id: "9", name: "Squash", imageUrl: "/sports/squash.png", isActive: true },
  { id: "10", name: "Pool", imageUrl: "/sports/pool.png", isActive: true },
];

export const MOCK_VENUES: Venue[] = [
  {
    id: "1",
    name: "Colombo Cricket Academy",
    slug: "colombo-cricket-academy",
    location: "Colombo 4, Sri Lanka",
    sport: "Cricket",
    rating: 4.9,
    pricePerHour: 2500,
    imageUrl: "/venues/cricket-academy.png",
    isPopular: true,
    isPremium: true,
    isFeatured: true,
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
    imageUrl: "/venues/futsal-arena.png",
    isPopular: true,
    isFeatured: true,
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
    imageUrl: "/venues/swimming-complex.png",
    isPremium: true,
    isFeatured: true,
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
    imageUrl: "/venues/badminton-hall.png",
    amenities: ["Air Conditioned Courts", "Professional Shuttles", "Coaching Available"],
    description: "Indoor badminton facility with professional-grade courts and coaching services.",
    isFeatured: true
  },
  {
    id: "5",
    name: "Prestige Basketball Court",
    slug: "prestige-basketball-court",
    location: "Colombo 6, Sri Lanka",
    sport: "Basketball",
    rating: 4.8,
    pricePerHour: 1500,
    imageUrl: "/venues/basketball-court.png",
    isPopular: true,
    isFeatured: true,
    amenities: ["Professional Court", "Floodlights", "Scoreboard", "Locker Rooms"],
    description: "Premium basketball facility with professional-grade court and modern amenities."
  }
];
