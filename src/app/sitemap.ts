import { MetadataRoute } from "next";

// Static sitemap - no API calls that can fail at runtime
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://thearena.lk";
  
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0, changeFrequency: "daily" },
    { url: `${baseUrl}/venues`, lastModified: new Date(), priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/partner`, lastModified: new Date(), priority: 0.6, changeFrequency: "monthly" },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), priority: 0.4, changeFrequency: "yearly" },
    { url: `${baseUrl}/security`, lastModified: new Date(), priority: 0.4, changeFrequency: "yearly" },
    // Venue pages will be discovered via internal linking and venue layout metadata
  ];
}
