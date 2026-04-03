"use client";

import { Venue } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import HeroVenueCard from "./HeroVenueCard";
import { useState, useMemo } from "react";

interface HeroCarouselProps {
  venues: Venue[];
}

export default function HeroCarousel({ venues }: HeroCarouselProps) {
  const [, setActiveIndex] = useState(0);

  // Ensure enough slides for a smooth loop by duplicating if needed (min 5)
  const slides = useMemo(() => {
    if (venues.length === 0) return [];
    if (venues.length >= 5) return venues;
    // Duplicate the array until we have at least 5 slides
    const repeated = [];
    while (repeated.length < 5) {
      repeated.push(...venues);
    }
    return repeated.slice(0, Math.max(5, venues.length));
  }, [venues]);

  return (
    <div className="w-full pt-4 pb-2 md:py-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[80px]" />
      </div>

      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={"auto"}
        initialSlide={Math.floor(slides.length / 2)}
        loopAdditionalSlides={2}
        coverflowEffect={{
          rotate: 0,
          stretch: 50,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        speed={500}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        modules={[EffectCoverflow, Autoplay, Pagination]}
        className="hero-carousel w-full !pb-8"
      >
        {slides.map((venue, idx) => (
          <SwiperSlide
            key={`${venue.id}-${idx}`}
            className="!w-[280px] md:!w-[400px]"
          >
            {({ isActive }) => (
              <HeroVenueCard venue={venue} isActive={isActive} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}