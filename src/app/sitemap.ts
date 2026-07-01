import { MetadataRoute } from "next";
import { api } from "@/services/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thearena.lk";
  
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" },
    { url: `${baseUrl}/venues`, lastModified: new Date(), priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.7, changeFrequency: "monthly" },
    { url: `https://${process.env.NEXT_PUBLIC_VENUE_DOMAIN || 'centers.thearena.lk'}`, lastModified: new Date(), priority: 0.6, changeFrequency: "monthly" },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.4, changeFrequency: "yearly" },
    { url: `${baseUrl}/security`, lastModified: new Date(), priority: 0.4, changeFrequency: "yearly" },
  ];

  try {
    const venues = await api.getVenues();
    const dynamicRoutes = (venues || []).map((venue) => ({
      url: `${baseUrl}/venues/${venue.id}`,
      lastModified: venue.updated_at ? new Date(venue.updated_at) : new Date(),
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));
    
    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap, using static fallback:", error);
    return staticRoutes;
  }
}

