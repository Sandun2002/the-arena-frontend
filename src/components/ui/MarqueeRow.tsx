"use client";

import {
  Children,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

interface MarqueeRowProps {
  children: ReactNode;
  /** Pixels per second. Positive = scrolls left (content moves left). Negative = scrolls right. */
  speed?: number;
  /** Pause auto-scroll while pointer is hovering the track. */
  pauseOnHover?: boolean;
  /** Optional classes on the outer wrapper. */
  className?: string;
  /** Show fade masks on left/right edges. */
  fadeEdges?: boolean;
}

const DRAG_THRESHOLD = 5; // px before a pointermove is treated as a drag

/**
 * MarqueeRow — auto-sliding horizontal row with manual drag & click support.
 *
 * - Children are rendered twice for seamless looping; the track translates
 *   via a RAF loop that wraps when it has moved one full copy's width.
 * - Pointer drag offsets the current translateX directly, so it feels instant.
 * - Short taps (movement < DRAG_THRESHOLD px) pass through as normal clicks to
 *   the child (e.g. <Link>), so whole-card navigation still works.
 * - Hover pauses auto-scroll; mouse-leave resumes it.
 * - Respects `prefers-reduced-motion` by disabling auto-scroll (drag still works).
 *
 * Usage:
 *   <MarqueeRow speed={40}>
 *     {items.map(i => <MyCard key={i.id} item={i} />)}
 *   </MarqueeRow>
 */
export default function MarqueeRow({
  children,
  speed = 40,
  pauseOnHover = true,
  className = "",
  fadeEdges = true,
}: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const hoverRef = useRef(false);
  const draggingRef = useRef(false);
  const dragRef = useRef<{
    startX: number;
    startOffset: number;
    moved: boolean;
    pointerId: number;
    captured: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect reduced-motion preference once (mount only — users rarely toggle
  // mid-session, and we'd have to restart the RAF loop anyway).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  // Measure the track's "one copy" width. Because we render children twice,
  // scrollWidth / 2 is the length after which we can wrap without visible jump.
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      halfWidthRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    // Images/fonts may load after mount → remeasure once.
    const t = window.setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [children]);

  // Auto-scroll RAF loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const half = halfWidthRef.current;
      if (half > 0) {
        // Advance only when not dragging and not hovered (+ reduced-motion respects this).
        if (!draggingRef.current && !(pauseOnHover && hoverRef.current) && !reducedMotion) {
          offsetRef.current -= speed * dt;
        }
        // Normalize offset into [-half, 0] range so translate stays bounded
        // regardless of drag direction or how long the loop has been running.
        if (offsetRef.current <= -half) offsetRef.current += half;
        else if (offsetRef.current > 0) offsetRef.current -= half;
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, pauseOnHover, reducedMotion]);

  // Pointer drag (unified mouse + touch via Pointer Events).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    // Do NOT setPointerCapture here — on desktop it can swallow the click
    // event that should reach the inner <Link>. We capture lazily in move.
    dragRef.current = {
      startX: e.clientX,
      startOffset: offsetRef.current,
      moved: false,
      pointerId: e.pointerId,
      captured: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      d.moved = true;
      draggingRef.current = true;
      if (!d.captured) {
        try {
          e.currentTarget.setPointerCapture(d.pointerId);
          d.captured = true;
        } catch {
          // Capture not supported — drag still works without it.
        }
      }
      offsetRef.current = d.startOffset + dx;
    }
  };

  const endDrag = () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    draggingRef.current = false;
    if (d.moved) {
      // Swallow the click browsers fire after a mouse drag so the card's
      // <Link> isn't triggered when the user was just dragging the row.
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const childArray = Children.toArray(children);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        cursor: "grab",
        touchAction: "pan-y",
        ...(fadeEdges
          ? {
              maskImage:
                "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
            }
          : {}),
      }}
      onMouseEnter={() => {
        if (pauseOnHover) hoverRef.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) hoverRef.current = false;
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
    >
      <div
        ref={trackRef}
        className="flex w-max will-change-transform select-none"
      >
        {childArray.map((child, i) => (
          <div key={`a-${i}`} className="flex-shrink-0">
            {child}
          </div>
        ))}
        {/* Second copy — aria-hidden so screen readers don't repeat content. */}
        {childArray.map((child, i) => (
          <div key={`b-${i}`} className="flex-shrink-0" aria-hidden="true">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
