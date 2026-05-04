import { api } from "@/services/api";
import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thearena.lk";
  
  // Static pages
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/venues`, lastModified: new Date(), priority: 0.9, changeFrequency: "daily" as const },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/partner`, lastModified: new Date(), priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/login`, lastModified: new Date(), priority: 0.5, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/signup`, lastModified: new Date(), priority: 0.5, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.4, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/security`, lastModified: new Date(), priority: 0.4, changeFrequency: "yearly" as const },
  ];
  
  // Dynamic venue pages
  let venueRoutes: MetadataRoute.Sitemap = [];
  try {
    // Fetch all venues and filter active ones
    const venues = await api.getVenues();
    const activeVenues = venues.filter(v => v.is_active);
    
    venueRoutes = activeVenues.map((venue) => ({
      url: `${baseUrl}/venues/${venue.id}`,
      lastModified: venue.updated_at ? new Date(venue.updated_at) : new Date(),
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));
  } catch (error) {
    console.error("Failed to fetch venues for sitemap:", error);
  }
  
  return [...staticRoutes, ...venueRoutes];
}
