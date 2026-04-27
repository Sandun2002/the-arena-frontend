"use client";

import { Venue } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import HeroVenueCard from "./HeroVenueCard";

interface HeroCarouselProps {
  venues: Venue[];
}

const AUTOPLAY_MS = 4500;
const DRAG_COMMIT_PX = 60; // horizontal distance to commit a slide change
const DRAG_NAV_SUPPRESS_PX = 5; // above this, cancel the click-through to the card
// Side-card offsets (distance from center, per screen size)
const OFFSET_MOBILE = 150;
const OFFSET_DESKTOP = 210;

/**
 * Custom hero carousel — no Swiper. Uses modular arithmetic so it's
 * genuinely infinite regardless of venue count (works with 1, 2, 20…).
 *
 * Layout: 5 absolutely-positioned cards (−2, −1, 0, +1, +2). Each render
 * picks `venues[(active + offset + N) % N]`, so there's never an "end".
 * Auto-advance every AUTOPLAY_MS; pointer drag anywhere on the track
 * changes `active`; short taps still bubble to the card's <Link>.
 */
export default function HeroCarousel({ venues }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    moved: boolean;
    pointerId: number;
    captured: boolean;
  } | null>(null);
  const suppressNextClickRef = useRef(false);

  const n = venues.length;
  const mod = useCallback((i: number) => ((i % n) + n) % n, [n]);

  // Entry animation
  useGSAP(
    () => {
      if (!wrapRef.current) return;
      gsap.fromTo(
        wrapRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );
    },
    { scope: wrapRef }
  );

  // Track viewport size for responsive offset / card width
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Autoplay — setInterval handles both single-venue no-op (useEffect
  // early-returns) and many-venue infinite advance.
  useEffect(() => {
    if (n < 2 || paused) return;
    const id = window.setInterval(() => setActive((i) => i + 1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [n, paused]);

  const goTo = useCallback((idx: number) => setActive(idx), []);

  // ── Pointer drag (mouse + touch unified via Pointer Events) ────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore right-click, pen-eraser, etc. Also ignore when not primary button.
    if (e.button !== 0 && e.pointerType === "mouse") return;
    // Do NOT call setPointerCapture here — on desktop it can swallow the
    // click event that should reach the inner <Link>. We only capture once
    // real drag movement is detected (see onPointerMove below).
    dragRef.current = {
      startX: e.clientX,
      moved: false,
      pointerId: e.pointerId,
      captured: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) > DRAG_NAV_SUPPRESS_PX) {
      d.moved = true;
      // Lazily capture the pointer only once we're sure the user is dragging,
      // so the remaining pointermove/up events go to the track even if the
      // cursor leaves it. Normal taps never hit this branch → click fires.
      if (!d.captured) {
        try {
          e.currentTarget.setPointerCapture(d.pointerId);
          d.captured = true;
        } catch {
          // Capture not supported — drag still functions without it.
        }
      }
    }
  };

  const endDrag = (clientX: number | null) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    if (clientX == null) return;
    const dx = clientX - d.startX;
    if (Math.abs(dx) > DRAG_COMMIT_PX) {
      setActive((i) => (dx < 0 ? i + 1 : i - 1));
    }
    if (d.moved) {
      // Cancel the click that browsers fire after pointerup, so a drag
      // doesn't accidentally navigate to the centered card's venue page.
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => endDrag(e.clientX);
  const onPointerCancel = () => endDrag(null);

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressNextClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (n === 0) return null;

  const offsetPx = isMobile ? OFFSET_MOBILE : OFFSET_DESKTOP;
  // Render a sliding window of virtual indices around `active`. Keying each
  // card by its virtual index (instead of by slot position) is what makes the
  // slide animation work: when `active` increments, surviving keys keep their
  // DOM node and only their `transform` changes → CSS transition interpolates.
  // Cards at the edges (|offset| > 2) are rendered off-screen at 0 opacity so
  // the incoming card at ±3 is already mounted and slides in to ±2 smoothly.
  const VIS_RADIUS = 3;
  const virtualIndices: number[] = [];
  for (let i = active - VIS_RADIUS; i <= active + VIS_RADIUS; i++) {
    virtualIndices.push(i);
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full pt-6 pb-2 md:pt-8 md:pb-4 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[250px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />
      </div>

      {/* Track — absolute-positioned cards, modular indexing = true infinite */}
      <div
        className="relative mx-auto h-[240px] w-full max-w-[1100px] touch-pan-y md:h-[340px]"
        style={{ perspective: 1200, cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        {virtualIndices.map((virtualIdx) => {
          const offset = virtualIdx - active; // -3..+3
          const realIdx = mod(virtualIdx);
          const venue = venues[realIdx];
          const abs = Math.abs(offset);
          const scale = abs === 0 ? 1 : abs === 1 ? 0.88 : abs === 2 ? 0.74 : 0.62;
          const opacity = abs === 0 ? 1 : abs === 1 ? 0.8 : abs === 2 ? 0.35 : 0;
          const blur = abs >= 2 ? 1.5 : 0;
          const zIndex = 10 - abs;

          return (
            <div
              key={virtualIdx}
              className="absolute top-0 left-1/2 w-[min(400px,82vw)]"
              style={{
                transform: `translateX(-50%) translateX(${offset * offsetPx}px) scale(${scale})`,
                opacity,
                filter: blur ? `blur(${blur}px)` : undefined,
                zIndex,
                pointerEvents: abs > 2 ? "none" : "auto",
                transition:
                  "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease, filter 500ms ease",
                willChange: "transform, opacity",
              }}
            >
              <HeroVenueCard venue={venue} isActive={offset === 0} priority={Math.abs(offset) <= 1} />
            </div>
          );
        })}
      </div>

      {/* Dots */}
      {n > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {venues.map((_, i) => {
            const activeDot = mod(active) === i;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Show venue ${i + 1}`}
                onClick={() => goTo(i)}
                className="p-2 -m-2 flex items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    activeDot
                      ? "w-5 h-[3px] bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                      : "w-[3px] h-[3px] bg-white/25 hover:bg-white/50"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}