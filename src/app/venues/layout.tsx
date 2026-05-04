import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Sports Venues | Book Courts in Sri Lanka | The Arena",
  description: "Discover and book premium sports venues across Sri Lanka. Find cricket grounds, futsal courts, basketball courts, badminton courts and more. Compare prices, check availability, and book instantly.",
  keywords: "sports venues sri lanka, book cricket ground, futsal court booking, basketball court rental, badminton court, sports facility booking",
  openGraph: {
    title: "Find Sports Venues | The Arena",
    description: "Discover and book premium sports venues across Sri Lanka. Compare prices and book instantly.",
    url: "https://thearena.lk/venues",
    type: "website",
    images: [{
      url: "https://thearena.lk/logo.png",
      width: 1200,
      height: 630,
      alt: "The Arena - Sports Venue Booking Platform"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Sports Venues | The Arena",
    description: "Discover and book premium sports venues across Sri Lanka.",
    images: ["https://thearena.lk/logo.png"]
  },
  alternates: {
    canonical: "https://thearena.lk/venues"
  }
};

export default function VenuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
