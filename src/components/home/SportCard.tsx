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
      className="sport-card group relative flex-shrink-0 block overflow-hidden rounded-xl border border-default bg-surface-sunken w-[150px] h-[190px] md:w-[200px] md:h-[260px] mx-1.5 md:mx-2"
      aria-label={`Explore ${sport.name} venues`}
    >
      {/* Background image */}
      <Image
        src={sport.imageUrl || getSportImage(sport.slug || sport.name || "")}
        alt={sport.name}
        fill
        sizes="(max-width: 768px) 150px, 200px"
        priority={priority}
        className="sport-img object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

      {/* Corner accent brackets — visible on hover */}
      <span className="sport-corner absolute top-0 left-0 w-4 h-4 md:w-5 md:h-5 border-t border-l border-emerald-400/80 rounded-tl-xl pointer-events-none" />
      <span className="sport-corner absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 border-t border-r border-emerald-400/80 rounded-tr-xl pointer-events-none" />
      <span className="sport-corner absolute bottom-0 left-0 w-4 h-4 md:w-5 md:h-5 border-b border-l border-emerald-400/80 rounded-bl-xl pointer-events-none" />
      <span className="sport-corner absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 border-b border-r border-emerald-400/80 rounded-br-xl pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
        <h3 className="text-sm md:text-lg font-bold text-white tracking-tight drop-shadow-lg">
          {sport.name}
        </h3>

        {/* Animated underline */}
        <div className="sport-underline mt-1.5 h-[2px] w-10 md:w-14 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />

        {/* CTA — slides in on hover */}
        <div className="sport-cta mt-2 flex items-center gap-1 text-emerald-400 text-[11px] md:text-xs font-semibold">
          <span>View courts</span>
          <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </div>
      </div>
    </Link>
  );
}
