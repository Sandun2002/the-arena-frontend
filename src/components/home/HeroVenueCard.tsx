import Image from "next/image";
import { MapPin } from "lucide-react";
import { Venue } from "@/types";

interface HeroVenueCardProps {
  venue: Venue;
  isActive: boolean;
}

export default function HeroVenueCard({ venue, isActive }: HeroVenueCardProps) {
  return (
    <div 
      className={`
        relative 
        h-[220px] md:h-[300px]
        w-full overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-500
        ${isActive ? "border-emerald-400 shadow-[0_0_40px_rgba(80,200,120,0.4)]" : "border-zinc-700/50 opacity-70 hover:opacity-80"}
      `}
    >
      <Image
        src={venue.imageUrl}
        alt={venue.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
      />
      
      {/* Enhanced Gradient Overlay */}
      <div className={`absolute inset-0 transition-all duration-500 ${isActive ? "bg-gradient-to-t from-black/80 via-black/30 to-transparent" : "bg-gradient-to-t from-black/60 via-black/20 to-transparent"}`} />

      {/* Content */}
      <div className={`absolute bottom-0 left-0 w-full p-4 md:p-5 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0 md:opacity-90"}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-black text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            {venue.sport}
          </span>
        </div>
        
        <h3 className="text-sm md:text-lg font-bold text-white uppercase italic tracking-tight line-clamp-2 leading-tight">
          {venue.name}
        </h3>
        
        <div className="flex items-center gap-1 text-zinc-300 text-xs mt-2">
          <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span className="truncate text-zinc-400">{venue.location}</span>
        </div>
      </div>
    </div>
  );
}