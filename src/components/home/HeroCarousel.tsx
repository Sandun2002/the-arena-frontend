"use client";

import { Venue } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import HeroVenueCard from "./HeroVenueCard";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface HeroCarouselProps {
  venues: Venue[];
}

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

  const enableLoop = venues.length >= 3;

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
        initialSlide={Math.floor(venues.length / 2)}
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
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        speed={500}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        modules={[EffectCoverflow, Autoplay, Pagination]}
        className="hero-carousel touch-pan-y w-full !pb-8"
      >
        {venues.map((venue, idx) => (
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