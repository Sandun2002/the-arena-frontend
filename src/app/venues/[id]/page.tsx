"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/services/api";
import { Review, Venue } from "@/types";
import BookingWidget from "@/components/venues/BookingWidget";
import { CheckCircle, MapPin, Star, Trophy } from "lucide-react";

export default function VenueDetailsPage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVenue = async () => {
      if (!params.id) return;
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      try {
        const venueData = await api.getVenueById(id);
        setVenue(venueData);
        const reviewsData = await api.getVenueReviews(id, venueData);
        setReviews(reviewsData);
      } finally {
        setLoading(false);
      }
    };
    loadVenue();
  }, [params.id]);

  const gallery = useMemo(() => {
    if (!venue) return [];
    const images = venue.gallery_images.length > 0 ? venue.gallery_images : venue.cover_image ? [{ id: "cover", url: venue.cover_image, is_cover: true, display_order: 0 }] : [];
    return images.slice(0, 3);
  }, [venue]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" /></div>;
  }

  if (!venue) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Venue not found</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-24">
      <div className="fixed top-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 mb-8 relative z-10">
        <div className="text-xs font-bold text-zinc-500 mb-6 flex gap-2 uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition-colors">Home</Link> /
          <Link href="/venues" className="hover:text-white transition-colors">Search</Link> /
          <span className="text-emerald-500">{venue.name}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase">{venue.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                {venue.city}
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-white font-bold text-lg">{venue.rating.toFixed(1)}</span>
                <span className="underline decoration-zinc-700 underline-offset-4">({venue.review_count} reviews)</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Starting from</p>
            <p className="text-3xl font-black text-white flex items-baseline gap-1 justify-end">
              {venue.min_hourly_rate ? `LKR ${venue.min_hourly_rate.toLocaleString()}` : "See courts"} <span className="text-sm font-bold text-zinc-500">/hr</span>
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          <div className="md:col-span-3 relative rounded-[2rem] overflow-hidden border border-zinc-800 group cursor-pointer bg-zinc-900">
            {gallery[0] ? <Image src={gallery[0].url} alt={venue.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority unoptimized /> : <div className="h-full w-full bg-zinc-900" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="hidden md:flex flex-col gap-4">
            {gallery.slice(1, 3).map((image) => (
              <div key={image.id} className="relative flex-1 rounded-[2rem] overflow-hidden border border-zinc-800 group cursor-pointer">
                <Image src={image.url} alt={venue.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">About Venue</h3>
              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800 backdrop-blur-sm">
                <p className="text-zinc-400 leading-relaxed text-lg">{venue.description || "Venue description is not available yet."}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.amenities.length > 0 ? venue.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center justify-center p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 text-zinc-300 text-sm font-bold uppercase tracking-wider">
                    {amenity.name}
                  </div>
                )) : <div className="col-span-full rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-500">Amenities have not been listed yet.</div>}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Player Reviews</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Reviews are available after completed bookings.</p>
              </div>

              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">{review.user_name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-white text-sm">{review.user_name}</p>
                          <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">{[...Array(5)].map((_, index) => <Star key={index} className={`h-3 w-3 ${index < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`} />)}</div>
                    </div>
                    {review.title && <p className="mb-2 text-sm font-bold text-white">{review.title}</p>}
                    <p className="text-zinc-400 text-sm italic">"{review.comment}"</p>
                  </div>
                )) : <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-500">No public reviews yet.</div>}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Location</h3>
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 overflow-hidden">
                {venue.geo_lat && venue.geo_lng ? (
                  <iframe
                    title="Venue location"
                    className="w-full h-64 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${venue.geo_lat},${venue.geo_lng}&z=15&output=embed`}
                  />
                ) : null}
                <div className="p-8">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-emerald-500">Address</p>
                      <p className="mt-2 text-lg font-bold text-white">{venue.address}</p>
                      <p className="text-sm text-zinc-500">{venue.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <BookingWidget venue={venue} />

            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-white mb-2">{venue.is_verified ? "Verified Venue" : "Venue Listed"}</h4>
              <p className="text-xs text-zinc-500">{venue.is_verified ? "This venue meets Arena's standards for quality and safety." : "Venue information is available and bookable through Arena."}</p>
            </div>

            {venue.available_sports && venue.available_sports.length > 0 && (
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="mb-3 flex items-center gap-2 text-white font-bold"><Trophy className="h-4 w-4 text-emerald-500" /> Sports Available</div>
                <div className="flex flex-wrap gap-2">{venue.available_sports.map((sport) => <span key={sport} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{sport}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
