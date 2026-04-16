"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Users, Star, ArrowRight } from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verified Bookings",
    description: "Only guests who actually played at the venue can leave a review.",
  },
  {
    icon: Users,
    title: "Players Only",
    description: "No fake or incentivized reviews. Every rating comes from real experiences.",
  },
  {
    icon: Star,
    title: "Honest Ratings",
    description: "Star ratings that reflect genuine player experiences at every venue.",
  },
];

export default function ReviewsTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".trust-pillar");
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-zinc-900/20 border-y border-zinc-800/50"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <span className="text-xs font-black tracking-[0.2em] uppercase text-zinc-500">
              Trust & Transparency
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            What Players{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
              Say
            </span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Every review on The Arena comes from verified players who actually
            booked and played. No exceptions.
          </p>
        </div>

        {/* Trust Pillars Grid */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12"
        >
          {TRUST_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="trust-pillar bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(80,200,120,0.1)] transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <pillar.icon className="w-6 h-6 text-emerald-500" />
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-2">
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/venues"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:shadow-[0_0_30px_rgba(80,200,120,0.4)] hover:scale-105 transition-all duration-300 group"
          >
            Book Your First Game & Be the First to Review
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
