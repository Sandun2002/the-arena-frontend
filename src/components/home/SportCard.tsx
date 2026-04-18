"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Sport } from "@/types";
import { getSportImage } from "@/services/normalizers";

interface SportCardProps {
  sport: Sport;
  priority?: boolean;
}

/**
 * SportCard — premium landing-page visual language with hover choreography.
 * Used inside the dual infinite marquee in SportExplorer.
 *
 * Hover behavior is CSS-driven (see globals.css `.sport-card` rules):
 *   • lifts + scales, drops grayscale, shows corner brackets
 *   • animated underline expands
 *   • "View courts" CTA slides up
 *   • siblings in the row dim for focus contrast
 */
export default function SportCard({ sport, priority = false }: SportCardProps) {
  return (
    <Link
      href={`/venues?sport_type=${sport.slug}`}
      className="sport-card group relative flex-shrink-0 block overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950 w-[220px] h-[280px] md:w-[280px] md:h-[360px] mx-2 md:mx-3"
      aria-label={`Explore ${sport.name} venues`}
    >
      {/* Background image */}
      <Image
        src={sport.imageUrl || getSportImage(sport.slug || sport.name || "")}
        alt={sport.name}
        fill
        sizes="(max-width: 768px) 220px, 280px"
        priority={priority}
        className="sport-img object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

      {/* Corner accent brackets — visible on hover */}
      <span className="sport-corner absolute top-0 left-0 w-5 h-5 md:w-6 md:h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-2xl pointer-events-none" />
      <span className="sport-corner absolute top-0 right-0 w-5 h-5 md:w-6 md:h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-2xl pointer-events-none" />
      <span className="sport-corner absolute bottom-0 left-0 w-5 h-5 md:w-6 md:h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-2xl pointer-events-none" />
      <span className="sport-corner absolute bottom-0 right-0 w-5 h-5 md:w-6 md:h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-2xl pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3 className="text-lg md:text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">
          {sport.name}
        </h3>

        {/* Animated underline */}
        <div className="sport-underline mt-2 h-[2px] w-16 md:w-20 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />

        {/* CTA — slides in on hover */}
        <div className="sport-cta mt-3 flex items-center gap-1.5 text-emerald-400 text-xs md:text-sm font-semibold">
          <span>View courts</span>
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
      </div>
    </Link>
  );
}
