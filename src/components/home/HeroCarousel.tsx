"use client";

import { Venue } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import HeroVenueCard from "./HeroVenueCard";
import { useState, useMemo } from "react";

interface HeroCarouselProps {
  venues: Venue[];
}

export default function HeroCarousel({ venues }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Duplicate data to ensure smooth infinite loop
  const loopedVenues = useMemo(() => {
    if (venues.length === 0) return [];
    return [...venues, ...venues, ...venues, ...venues];
  }, [venues]);

  return (
    <div className="w-full py-0 md:py-2">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={"auto"}
        initialSlide={venues.length}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 2.8,
          slideShadows: false,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        modules={[EffectCoverflow, Autoplay]}
        className="w-full"
      >
        {loopedVenues.map((venue, index) => (
          <SwiperSlide 
            key={`${venue.id}-${index}`} 
            // MOBILE: Show 5 cards on mobile (140px width)
            // DESKTOP: Show 2-3 cards (380px width)
            className="!w-[140px] md:!w-[380px] mx-1.5 md:mx-4"
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