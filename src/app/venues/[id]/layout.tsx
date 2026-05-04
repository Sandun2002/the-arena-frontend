import { api } from "@/services/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import VenueSchema from "@/components/seo/VenueSchema";

interface VenueLayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: VenueLayoutProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const venue = await api.getVenueById(id);
    
    if (!venue) {
      return {
        title: "Venue Not Found | The Arena",
        description: "The requested venue could not be found."
      };
    }

    const sports = venue.available_sports?.join(", ") || "Sports";
    const title = `Book ${venue.name} - ${sports} in ${venue.city} | The Arena`;
    const description = `Book ${venue.name} in ${venue.city}. ${sports} venue with ${venue.rating.toFixed(1)}★ rating. Starting from LKR ${venue.min_hourly_rate?.toLocaleString() || "Contact"}/hr. Instant booking confirmation.`;
    
    const images = venue.gallery_images?.length > 0 
      ? venue.gallery_images.slice(0, 3).map(img => ({
          url: img.url,
          width: 1200,
          height: 800,
          alt: `${venue.name} - ${sports} venue in ${venue.city}`
        }))
      : venue.cover_image 
        ? [{
            url: venue.cover_image,
            width: 1200,
            height: 800,
            alt: `${venue.name} - ${sports} venue in ${venue.city}`
          }]
        : [];

    return {
      title,
      description,
      keywords: `${venue.name}, ${sports} ${venue.city}, book ${sports.toLowerCase()} court ${venue.city.toLowerCase()}, sports venue ${venue.city.toLowerCase()}, ${venue.city.toLowerCase()} ${sports.toLowerCase()} ground`,
      openGraph: {
        title: `${venue.name} - ${sports} in ${venue.city}`,
        description,
        url: `https://thearena.lk/venues/${venue.id}`,
        type: "article",
        locale: "en_US",
        images
      },
      twitter: {
        card: "summary_large_image",
        title: `${venue.name} - ${sports} in ${venue.city}`,
        description,
        images: images.length > 0 ? [images[0].url] : []
      },
      alternates: {
        canonical: `https://thearena.lk/venues/${venue.id}`
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1
        }
      }
    };
  } catch {
    notFound();
  }
}

export default async function VenueLayout({ params, children }: VenueLayoutProps) {
  const { id } = await params;
  
  let venue = null;
  try {
    venue = await api.getVenueById(id);
  } catch {
    notFound();
  }
  
  return (
    <>
      {venue && <VenueSchema venue={venue} />}
      {children}
    </>
  );
}
