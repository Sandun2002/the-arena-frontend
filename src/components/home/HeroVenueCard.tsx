"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Venue } from "@/types";

interface HeroVenueCardProps {
  venue: Venue;
  isActive: boolean;
  priority?: boolean;
}

export default function HeroVenueCard({ venue, isActive, priority }: HeroVenueCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Desktop-only mouse-follow tilt on active card (subtle, ±5°)
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive || !cardRef.current) return;
    // Skip on touch/no-hover devices
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform =
      `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "";
  };

  return (
    <Link
      ref={cardRef}
      href={`/venues/${venue.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        ${isActive ? "hero-active" : ""}
        group relative block
        h-[220px] md:h-[320px]
        w-full overflow-hidden
        rounded-2xl cursor-pointer
        duration-500 ease-out
        transition-[transform,opacity,box-shadow]
        will-change-[transform,opacity]
        shadow-[0_14px_40px_-16px_rgba(80,200,120,0.4)]
        ring-1 ring-emerald-400/20
        ${isActive
          ? "shadow-[0_20px_60px_-12px_rgba(80,200,120,0.55)] ring-emerald-400/45"
          : "opacity-80 scale-[0.95]"
        }
      `}
    >
      {/* Background image with Ken Burns drift — always on so transitions don't stall */}
      <div className="absolute inset-0 hero-kenburns">
        <Image
          src={venue.cover_image || "/images/placeholder.jpg"}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 280px, 400px"
          priority={priority}
          className="object-cover"
        />
      </div>

      {/* Premium gradient overlay — consistent on all cards */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

      {/* Shine sweep — always running so it never "catches up" when a card becomes active */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-shine absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* FEATURED badge — always visible, slightly dimmed on inactive */}
      <div
        className={`absolute top-3 left-3 md:top-4 md:left-4 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-80"}`}
      >
        <span className="inline-flex items-center gap-1 bg-emerald-500 text-black text-[10px] md:text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg">
          <Sparkles className="w-3 h-3" />
          Featured
        </span>
      </div>

      {/* Content — always visible for smooth transitions */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-5">
        {/* Venue name */}
        <h3 className="text-base md:text-xl font-bold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-lg">
          {venue.name}
        </h3>

        {/* Animated underline */}
        <div className="hero-underline mt-1.5 md:mt-2 h-[2px] w-16 md:w-20 bg-gradient-to-r from-emerald-400 via-emerald-500 to-transparent rounded-full" />

        {/* Location + CTA */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-zinc-300 text-xs md:text-sm min-w-0">
            <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{venue.city}</span>
          </div>
          <div className="hero-cta flex items-center gap-1 text-emerald-400 text-xs md:text-sm font-semibold flex-shrink-0">
            <span className="hidden sm:inline">View</span>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
        </div>
      </div>

      {/* Autoplay progress bar — only shown on active card */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 pointer-events-none">
          <div className="hero-progress-bar h-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
        </div>
      )}
    </Link>
  );
}