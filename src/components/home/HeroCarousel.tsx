"use client";

import { Venue } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Autoplay,
  Pagination,
  Keyboard,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import HeroVenueCard from "./HeroVenueCard";
import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface HeroCarouselProps {
  venues: Venue[];
}

const AUTOPLAY_DELAY = 4500; // ms
// Swiper's loop mode clones slides on both edges. Coverflow + centeredSlides
// need enough real slides to clone cleanly — we pad up to this count when
// the venue list is smaller, otherwise loop fails silently (autoplay stalls
// after the last slide with only 2 venues).
const MIN_SLIDES_FOR_LOOP = 6;

export default function HeroCarousel({ venues }: HeroCarouselProps) {
  const [, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );
    }
  }, { scope: containerRef });

  // If there aren't enough real venues for Swiper's loop to clone, repeat
  // the list so the track always has >= MIN_SLIDES_FOR_LOOP slides. Each
  // copy still links to the same venue (clicking either works), and the
  // loop wraps seamlessly so autoplay never stops.
  const loopVenues = useMemo(() => {
    if (venues.length === 0) return venues;
    if (venues.length >= MIN_SLIDES_FOR_LOOP) return venues;
    const copies = Math.ceil(MIN_SLIDES_FOR_LOOP / venues.length);
    return Array.from({ length: copies }, () => venues).flat();
  }, [venues]);

  const enableLoop = loopVenues.length >= 2;
  const initialCenterIdx = loopVenues.length > 0 ? Math.floor(loopVenues.length / 2) : 0;

  // Wire the autoplay progress bar: Swiper reports remaining time each tick,
  // we convert to a 0→1 "filled" ratio and set a CSS var on the active slide.
  const handleAutoplayTimeLeft = (
    _swiper: unknown,
    _time: number,
    progress: number
  ) => {
    if (!containerRef.current) return;
    const activeSlide = containerRef.current.querySelector<HTMLElement>(
      ".swiper-slide-active"
    );
    if (!activeSlide) return;
    // progress is 1 → 0 as the slide elapses; flip it so the bar fills left→right
    activeSlide.style.setProperty("--hero-progress", String(1 - progress));
  };

  return (
    <div ref={containerRef} className="w-full pt-6 pb-2 md:pt-8 md:pb-4 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[80px]" />
      </div>

      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={enableLoop}
        slidesPerView={"auto"}
        initialSlide={initialCenterIdx}
        loopAdditionalSlides={4}
        // Drag anywhere on the card: lower threshold so a small press-and-drag
        // triggers a swipe instead of a click. Swiper's default preventClicks
        // cancels the <Link> click when movement exceeds threshold, so quick
        // taps still navigate to the venue page.
        threshold={6}
        touchRatio={1.2}
        touchStartPreventDefault={false}
        simulateTouch
        coverflowEffect={{
          rotate: 0,
          stretch: 60,
          depth: 140,
          modifier: 1.1,
          slideShadows: false,
        }}
        autoplay={{
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        speed={600}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onAutoplayTimeLeft={handleAutoplayTimeLeft}
        modules={[EffectCoverflow, Autoplay, Pagination, Keyboard]}
        className="hero-carousel touch-pan-y w-full"
      >
        {loopVenues.map((venue, idx) => (
          <SwiperSlide
            key={`${venue.id}-${idx}`}
            className="!w-[280px] md:!w-[400px] py-4"
          >
            {({ isActive }) => (
              <HeroVenueCard
                venue={venue}
                isActive={isActive}
                priority={idx === initialCenterIdx}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}