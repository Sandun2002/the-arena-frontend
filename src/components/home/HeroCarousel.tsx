"use client";

import { Venue } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Mousewheel, Pagination } from "swiper/modules";
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

  // Duplicate data to ensure smooth infinite loop
  const loopedVenues = useMemo(() => {
    if (venues.length === 0) return [];
    return [...venues, ...venues, ...venues, ...venues];
  }, [venues]);

  return (
    <div className="w-full pt-4 pb-2 md:py-4 relative">
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
        initialSlide={venues.length}
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
        mousewheel={{
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        speed={500}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        modules={[EffectCoverflow, Autoplay, Mousewheel, Pagination]}
        className="hero-carousel w-full !pb-8 !overflow-visible"
      >
        {loopedVenues.map((venue, index) => (
          <SwiperSlide
            key={`${venue.id}-${index}`}
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