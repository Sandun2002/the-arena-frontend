"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { api } from "@/services/api";
import { Sport } from "@/types";
import { getSportImage } from "@/services/normalizers";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export default function SportExplorer() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSports = async () => {
      try {
        const data = await api.getSports();
        setSports(data.slice(0, 8)); // Show max 8 sports
      } catch (error) {
        console.error("Failed to load sports:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSports();
  }, []);

  // GSAP tile reveal animation
  useEffect(() => {
    if (!loading && cardsRef.current && sports.length > 0) {
      const cards = cardsRef.current.querySelectorAll(".sport-card");
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
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
    }
  }, [loading, sports.length]);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-black">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Explore by{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text">
              Sport
            </span>
          </h2>
          <p className="text-zinc-400 text-sm">
            Find courts for your favorite game
          </p>
        </div>

        {/* Sports Grid - Horizontal scroll on mobile, grid on desktop */}
        {loading ? (
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[140px] md:w-auto h-[120px] md:h-[140px] rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          >
            {sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/venues?sport_type=${sport.slug}`}
                className="sport-card group relative w-[140px] md:w-auto h-[120px] md:h-[140px] rounded-2xl overflow-hidden flex-shrink-0 snap-start"
              >
                {/* Background Image */}
                <Image
                  src={sport.imageUrl || getSportImage(sport.slug || "")}
                  alt={sport.name}
                  fill
                  sizes="(max-width: 768px) 140px, 200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Active Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-500/50 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(80,200,120,0.35)]" />

                {/* Sport Name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-sm md:text-base font-bold text-white drop-shadow-lg">
                    {sport.name}
                  </h3>
                </div>

                {/* Hover Scale Effect */}
                <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03] pointer-events-none" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
