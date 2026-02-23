import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Venue } from "@/types";

interface VenueCardProps {
  venue: Venue;
}

export default function VenueCard({ venue }: VenueCardProps) {
  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/20">

      {/* Image Section */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={(venue as any).image || venue.cover_image || "/images/placeholder.jpg"}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {venue.is_featured && (
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-black">
              Trending
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span className="text-sm font-bold text-white">{venue.rating}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-zinc-400 text-sm">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{venue.city}</span>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <div>
            <span className="text-lg font-bold text-white">LKR {venue.contact_number ? "Contact for Price" : "Book Now"}</span>
          </div>

          <Link
            href={`/venues/${venue.id}`}
            className="flex items-center gap-2 text-sm font-bold text-emerald-500 transition-transform group-hover:translate-x-1"
          >
            Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}