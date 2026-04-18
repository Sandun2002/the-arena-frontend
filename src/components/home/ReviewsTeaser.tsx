"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ArrowRight, BadgeCheck, Quote } from "lucide-react";
import { api } from "@/services/api";
import type { Review } from "@/types";
import TierFrame from "@/components/ui/TierFrame";
import { getTierFromXp } from "@/lib/tierUtils";

gsap.registerPlugin(ScrollTrigger);

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const d = Math.floor(diff / 86_400_000);
  if (d < 1) return "today";
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "P";
}

export default function ReviewsTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getFeaturedReviews(10, 5);
        if (!cancelled) setReviews(data);
      } catch (err) {
        console.error("Failed to load featured reviews:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fade-in the whole marquee row once reviews are loaded (animating every
  // clone with stagger would fight the continuous CSS translate).
  useEffect(() => {
    if (loading || !gridRef.current || reviews.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, reviews.length]);

  // Duplicate 4x so the marquee is always wider than the viewport —
  // `marquee-left` animates translateX 0 → -50%, so the second half of
  // the track seamlessly replaces the first.
  const marqueeReviews = reviews.length > 0 ? [...reviews, ...reviews, ...reviews, ...reviews] : [];

  // Hide whole section if nothing to show (avoids awkward empty state)
  if (!loading && reviews.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-zinc-900/20 border-y border-zinc-800/50"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase text-zinc-500">
              Loved by Players
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3">
            What Players{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
              Say
            </span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base">
            Real words from verified players who actually booked and played.
          </p>
        </div>

        {/* Reviews marquee — single row, slow auto-scroll, full-bleed */}
        <div
          ref={gridRef}
          className="relative -mx-4 mb-10 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          {loading ? (
            <div className="flex gap-4 px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 w-[320px] flex-shrink-0 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="marquee-track marquee-reviews flex gap-4 md:gap-5">
              {marqueeReviews.map((r, idx) => (
                <Link
                  key={`${r.id}-${idx}`}
                  href={`/venues/${r.venue_id}`}
                  className="review-card group relative flex w-[300px] md:w-[340px] flex-shrink-0 flex-col gap-3 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-colors duration-300"
                >
                  {/* Header row: stars + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating
                              ? "text-emerald-400 fill-emerald-400"
                              : "text-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      {timeAgo(r.created_at)}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 w-4 h-4 text-emerald-500/20" />
                    <p className="text-sm text-zinc-200 leading-relaxed line-clamp-4 pl-5">
                      {r.comment}
                    </p>
                  </div>

                  {/* Footer: user + venue */}
                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-zinc-800/70">
                    <TierFrame
                      tier={getTierFromXp(r.user_xp ?? 0)}
                      level={r.user_level ?? 1}
                      src={r.user_avatar}
                      size="sm"
                      alt={r.user_name}
                      placeholder={
                        <span className="text-[10px] font-bold text-emerald-300">
                          {initials(r.user_name)}
                        </span>
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-sm text-white font-semibold truncate">
                        <span className="truncate">{r.user_name}</span>
                        {r.is_verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate group-hover:text-emerald-400 transition-colors">
                        {r.venue_name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:shadow-[0_0_30px_rgba(80,200,120,0.4)] hover:scale-[1.03] transition-all duration-300 group"
          >
            Book Your Game & Add Your Review
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
