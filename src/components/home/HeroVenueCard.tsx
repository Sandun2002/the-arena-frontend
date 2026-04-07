import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Venue } from "@/types";

interface HeroVenueCardProps {
  venue: Venue;
  isActive: boolean;
}

export default function HeroVenueCard({ venue, isActive }: HeroVenueCardProps) {
  return (
    <Link
      href={`/venues/${venue.id}`}
      className={`
        group relative block
        h-[200px] md:h-[280px]
        w-full overflow-hidden 
        rounded-2xl cursor-pointer
        transition-all duration-500 ease-out
        ${isActive
          ? "shadow-[0_8px_40px_-8px_rgba(80,200,120,0.5)] ring-2 ring-emerald-400/50"
          : "opacity-40 scale-[0.92] grayscale-[40%]"
        }
      `}
    >
      {/* Image */}
      <Image
        src={venue.cover_image || "/images/placeholder.jpg"}
        alt={venue.name}
        fill
        unoptimized
        className={`
          object-cover transition-all duration-700
          ${isActive ? "scale-105" : "scale-100"}
        `}
      />

      {/* Premium Gradient Overlay */}
      <div
        className={`
          absolute inset-0 transition-all duration-500
          bg-gradient-to-t from-black via-black/20 to-transparent
          ${isActive ? "opacity-100" : "opacity-60"}
        `}
      />

      {/* Shine Effect on Active */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Content */}
      <div
        className={`
          absolute bottom-0 left-0 w-full p-4 md:p-5
          transition-all duration-500 transform
          ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        {/* Sport Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="
              bg-emerald-500 
              text-black text-[10px] md:text-xs font-bold uppercase tracking-wide
              px-2.5 py-1 rounded-md
            "
          >
            {"Sports Venue"}
          </span>
        </div>

        {/* Venue Name */}
        <h3 className="text-base md:text-xl font-bold text-white tracking-tight leading-tight line-clamp-2">
          {venue.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs md:text-sm mt-1.5">
          <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{venue.city}</span>
        </div>
      </div>
    </Link>
  );
}