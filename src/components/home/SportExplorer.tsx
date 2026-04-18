"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { api } from "@/services/api";
import { Sport } from "@/types";
import SportCard from "./SportCard";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/**
 * SportExplorer — dual infinite marquee.
 *
 * Desktop/tablet: two rows scroll in opposite directions at different speeds
 *   (asymmetric = alive). Each row's content is duplicated inline to create
 *   the seamless loop (translateX 0 → -50% over the row width).
 *
 * Mobile: single row. No hover states; tap navigates.
 *
 * Hover on any card pauses the row that contains it (CSS :has()); opposite
 * row keeps scrolling → psychological contrast draws eye to the paused card.
 *
 * Respects prefers-reduced-motion (see globals.css).
 */
export default function SportExplorer() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadSports = async () => {
      try {
        const data = await api.getSports();
        setSports(data);
      } catch (error) {
        console.error("Failed to load sports:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSports();
  }, []);

  // GSAP section reveal on scroll-in
  useEffect(() => {
    if (!loading && sectionRef.current && sports.length > 0) {
      const header = sectionRef.current.querySelector(".sport-header");
      const marquees = sectionRef.current.querySelectorAll(".marquee-row");
      const ctx = gsap.context(() => {
        if (header) {
          gsap.fromTo(
            header,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        }
        if (marquees.length > 0) {
          gsap.fromTo(
            marquees,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    }
  }, [loading, sports.length]);

  // Split sports alphabetically: first half top row, second half bottom row
  const sortedSports = [...sports].sort((a, b) => a.name.localeCompare(b.name));
  const mid = Math.ceil(sortedSports.length / 2);
  const topRow = sortedSports.slice(0, mid);
  const bottomRow = sortedSports.slice(mid);

  // Duplicate content 4x so the row always exceeds viewport width → no visible
  // seam/gap even on ultra-wide screens. Animation still runs 0 → -50%, which
  // equals two copies sliding off (the remaining two match the starting state).
  const topRowDuped = [...topRow, ...topRow, ...topRow, ...topRow];
  const bottomRowDuped = [...bottomRow, ...bottomRow, ...bottomRow, ...bottomRow];
  const mobileRowDuped = [...sortedSports, ...sortedSports, ...sortedSports, ...sortedSports];

  return (
    <section ref={sectionRef} className="py-10 md:py-14 bg-black overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header — unchanged, clean */}
        <div className="sport-header mb-6 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-1.5">
            Explore by{" "}
            <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text">
              Sport
            </span>
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm">
            Find courts for your favorite game
          </p>
        </div>
      </div>

      {/* Marquee rows — full-bleed (escape container max-width for cinematic feel) */}
      {loading ? (
        <div className="px-4 flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-[150px] h-[190px] md:w-[200px] md:h-[260px] rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      ) : sports.length === 0 ? null : (
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Mobile: single row with all sports scrolling right → left */}
          <div className="marquee-row relative md:hidden">
            <div className="marquee-track marquee-left">
              {mobileRowDuped.map((sport, idx) => (
                <SportCard
                  key={`m-${sport.id}-${idx}`}
                  sport={sport}
                  priority={idx < 2}
                />
              ))}
            </div>
          </div>

          {/* Desktop/tablet: dual rows in opposite directions */}
          <div className="marquee-row relative hidden md:block">
            <div className="marquee-track marquee-left">
              {topRowDuped.map((sport, idx) => (
                <SportCard
                  key={`top-${sport.id}-${idx}`}
                  sport={sport}
                  priority={idx < 2}
                />
              ))}
            </div>
          </div>

          {bottomRow.length > 0 && (
            <div className="marquee-row relative hidden md:block">
              <div className="marquee-track marquee-right">
                {bottomRowDuped.map((sport, idx) => (
                  <SportCard
                    key={`bot-${sport.id}-${idx}`}
                    sport={sport}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
