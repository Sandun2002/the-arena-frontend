import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Venue, SearchParams } from "@/types";

interface VenueCardProps {
  venue: Venue;
  searchParams?: SearchParams | null;
}

export default function VenueCard({ venue, searchParams }: VenueCardProps) {
  const queryStr = searchParams 
    ? new URLSearchParams({
        date: searchParams.date || "",
        sport: searchParams.sport || "",
        start: searchParams.start_time || "",
        end: searchParams.end_time || ""
      }).toString()
    : "";
    
  const href = `/venues/${venue.id}${queryStr ? `?${queryStr}` : ""}`;

  return (
    <Link href={href} className="group relative block w-full overflow-hidden rounded-xl bg-surface-raised border border-default transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/20">

      {/* Image Section */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={venue.cover_image || "/sports/futsal.png"}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-sunken via-transparent to-transparent opacity-90" />

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
          <h3 className="text-xl font-bold text-primary group-hover:text-emerald-400 transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span className="text-sm font-bold text-primary">{venue.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-secondary text-sm">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{venue.city}</span>
        </div>

        <div className="flex items-center justify-between border-t border-default pt-4">
          <div>
            <span className="text-lg font-bold text-primary">
              {venue.min_hourly_rate ? `From LKR ${venue.min_hourly_rate.toLocaleString()}/hr` : "View availability"}
            </span>
          </div>

          <span className="flex items-center gap-2 text-sm font-bold text-brand-accent transition-transform group-hover:translate-x-1">
            Details <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}