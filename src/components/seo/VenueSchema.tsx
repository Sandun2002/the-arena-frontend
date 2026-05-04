"use client";

import { Venue } from "@/types";
import Script from "next/script";

interface VenueSchemaProps {
  venue: Venue;
}

export default function VenueSchema({ venue }: VenueSchemaProps) {
  const sports = venue.available_sports || [];
  const primarySport = sports[0] || "Sports";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: venue.name,
    description: venue.description || `Book ${primarySport} at ${venue.name} in ${venue.city}`,
    url: `https://thearena.lk/venues/${venue.id}`,
    image: venue.gallery_images?.length > 0 
      ? venue.gallery_images.map(img => img.url)
      : venue.cover_image 
        ? [venue.cover_image]
        : [],
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressCountry: "LK"
    },
    geo: venue.geo_lat && venue.geo_lng ? {
      "@type": "GeoCoordinates",
      latitude: venue.geo_lat,
      longitude: venue.geo_lng
    } : undefined,
    telephone: venue.phone_contact || undefined,
    amenityFeature: venue.amenities?.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.name,
      value: true
    })),
    sport: sports.map(sport => ({
      "@type": "SportsActivityLocation",
      name: sport
    })),
    aggregateRating: venue.review_count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: venue.rating.toFixed(1),
      reviewCount: venue.review_count,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    priceRange: venue.min_hourly_rate 
      ? `LKR ${venue.min_hourly_rate.toLocaleString()} - ${(venue.min_hourly_rate * 2).toLocaleString()}` 
      : "Contact for pricing",
    openingHours: venue.operating_hours?.length > 0
      ? venue.operating_hours.map(h => {
          const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
          const dayAbbr = days[h.day_of_week % 7] || "Mo";
          return `${dayAbbr} ${h.open_time || "06:00"}-${h.close_time || "22:00"}`;
        })
      : ["Mo-Su 06:00-22:00"],
    isAccessibleForFree: false,
    publicAccess: true
  };

  // Clean undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Script 
      id="venue-schema" 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}
