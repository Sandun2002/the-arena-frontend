"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ArrowRight, SealCheck, Quotes } from "@phosphor-icons/react";
import { api } from "@/services/api";
import type { Review } from "@/types";
import TierFrame from "@/components/ui/TierFrame";
import { getTierFromXp } from "@/lib/tierUtils";
import MarqueeRow from "@/components/ui/MarqueeRow";

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

  // Hide whole section if nothing to show (avoids awkward empty state)
  if (!loading && reviews.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-surface-raised/30 border-y border-default/50"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <Star size={16} weight="fill" className="text-emerald-400" />
            <span className="text-[11px] font-black tracking-[0.2em] uppercase text-muted">
              Loved by Players
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tight mb-3">
            What Players{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
              Say
            </span>
          </h2>
          <p className="text-secondary max-w-xl mx-auto text-sm md:text-base">
            Real words from verified players who actually booked and played.
          </p>
        </div>

        {/* Reviews marquee — single row, slow auto-scroll, drag + click. */}
        <div ref={gridRef} className="-mx-4 mb-10">
          {loading ? (
            <div className="flex gap-4 px-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 w-[320px] flex-shrink-0 rounded-2xl bg-surface-raised/50 border border-default animate-pulse"
                />
              ))}
            </div>
          ) : (
            <MarqueeRow speed={30}>
              {reviews.map((r) => (
                <Link
                  key={r.id}
                  href={`/venues/${r.venue_id}`}
                  className="review-card group relative flex w-[300px] md:w-[340px] flex-col gap-3 p-5 mx-2 md:mx-2.5 rounded-2xl bg-surface-raised/60 border border-default hover:border-emerald-500/40 hover:bg-surface-raised/80 transition-colors duration-300"
                >
                  {/* Header row: stars + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          weight={i < r.rating ? "fill" : "regular"}
                          size={14}
                          className={i < r.rating ? "text-emerald-400" : "text-faint"}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted">
                      {timeAgo(r.created_at)}
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="relative">
                    <Quotes size={16} weight="fill" className="absolute -top-1 -left-1 text-emerald-500/20" />
                    <p className="text-sm text-primary leading-relaxed line-clamp-4 pl-5">
                      {r.comment}
                    </p>
                  </div>

                  {/* Footer: user + venue */}
                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-default/70">
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
                      <div className="flex items-center gap-1 text-sm text-primary font-semibold truncate">
                        <span className="truncate">{r.user_name}</span>
                        {r.is_verified && (
                          <SealCheck size={14} weight="fill" className="text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-secondary truncate group-hover:text-emerald-400 transition-colors">
                        {r.venue_name}
                      </div>
                    </div>
                    <ArrowRight size={16} weight="bold" className="text-muted group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </MarqueeRow>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:shadow-[0_0_30px_rgba(80,200,120,0.4)] hover:scale-[1.03] transition-all duration-300 group"
          >
            Book Your Game & Add Your Review
            <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
