"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/services/authContext";
import HScrollArea from "@/components/ui/HScrollArea";
import TierFrame from "@/components/ui/TierFrame";
import { ArrowRight, Trophy, Lightning, TennisBall, GlobeHemisphereWest, Fire } from "@phosphor-icons/react";
import { getTierConfig } from "@/lib/tierUtils";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const TIER_LADDER = [
  { name: "Rookie", minXp: 0, color: "#71717a" },
  { name: "Contender", minXp: 500, color: "#3b82f6" },
  { name: "Athlete", minXp: 1200, color: "#10b981" },
  { name: "Champion", minXp: 2500, color: "#eab308" },
  { name: "Elite", minXp: 4500, color: "#f97316" },
  { name: "Legend", minXp: 7500, color: "#ef4444" },
  { name: "Icon", minXp: 12000, color: "#a855f7" },
  { name: "Titan", minXp: 25000, color: "#7dd3fc" },
];

// Rarity config - matches challenges page
const RARITY = [
  { key: "mythic", minXp: 350, label: "MYTHIC", border: "rgba(239,68,68,0.6)", glow: "rgba(239,68,68,0.35)", bar: ["#ef4444", "#f97316"], text: "#f87171" },
  { key: "legendary", minXp: 200, label: "LEGENDARY", border: "rgba(245,158,11,0.65)", glow: "rgba(245,158,11,0.4)", bar: ["#f59e0b", "#fde68a"], text: "#fbbf24" },
  { key: "epic", minXp: 125, label: "EPIC", border: "rgba(168,85,247,0.55)", glow: "rgba(168,85,247,0.35)", bar: ["#a855f7", "#c084fc"], text: "#c084fc" },
  { key: "rare", minXp: 75, label: "RARE", border: "rgba(99,102,241,0.5)", glow: "rgba(99,102,241,0.3)", bar: ["#6366f1", "#818cf8"], text: "#818cf8" },
  { key: "common", minXp: 0, label: "COMMON", border: "rgba(148,163,184,0.3)", glow: "rgba(148,163,184,0.15)", bar: ["#64748b", "#94a3b8"], text: "#94a3b8" },
];

function getRarity(xp: number) {
  return RARITY.find((r) => xp >= r.minXp) || RARITY[RARITY.length - 1];
}

// Sample challenges for preview
const SAMPLE_CHALLENGES = [
  {
    icon: <TennisBall weight="duotone" size={24} />,
    title: "Play Your First Game",
    xp: 25,
    rarity: "common",
  },
  {
    icon: <GlobeHemisphereWest weight="duotone" size={24} />,
    title: "Try 3 Different Sports",
    xp: 125,
    rarity: "epic",
  },
  {
    icon: <Fire weight="fill" size={24} />,
    title: "Book 3 Games This Week",
    xp: 50,
    rarity: "rare",
  },
];

export default function GamificationTeaser() {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll(".animate-in");
      const ctx = gsap.context(() => {
        gsap.fromTo(
          elements,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
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
      className="py-20 bg-gradient-to-b from-surface-raised/40 via-surface-base to-surface-base relative overflow-hidden"
    >
      {/* Hex grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.3v17.3L30 52 0 34.6V17.3L30 0z' fill='none' stroke='%2371717a' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 52px",
        }}
      />

      {/* Decorative orbs */}
      <div
        className="absolute left-0 top-0 h-[20rem] w-[20rem] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.2), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 h-[18rem] w-[18rem] rounded-full pointer-events-none blur-[100px] opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
        }}
      />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div ref={contentRef}>
          {/* Header */}
          <div className="text-center mb-10 animate-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Trophy size={20} weight="duotone" className="text-amber-500" />
              <span className="text-xs font-black tracking-[0.2em] uppercase text-muted">
                Gamification
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-primary uppercase tracking-tight mb-3">
              Level Up Your{" "}
              <span className="text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
                Game
              </span>
            </h2>
            <p className="text-secondary max-w-lg mx-auto">
              Book courts. Earn XP. Climb the ranks. Unlock exclusive rewards
              as you play.
            </p>
          </div>

          {/* Tier Ladder */}
          <div className="mb-12 animate-in">
            <div className="flex items-center gap-2 mb-4">
              <Lightning size={16} weight="fill" className="text-emerald-500" />
              <span className="text-xs font-bold tracking-widest uppercase text-muted">
                8 Tiers to Unlock
              </span>
            </div>

            <HScrollArea className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div
                className="flex gap-3 pb-4 pt-2"
                style={{ width: "max-content" }}
              >
                {/* Connecting line */}
                <div
                  className="absolute left-[60px] right-[60px] top-[14.5rem] h-0.5 hidden md:block"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(63,63,70,0.3), rgba(63,63,70,0.6) 50%, rgba(63,63,70,0.3))",
                  }}
                />

                {TIER_LADDER.map((tier, i) => (
                  <div
                    key={tier.name}
                    className="relative flex w-[130px] shrink-0 flex-col items-center gap-3 rounded-2xl border border-default/70 bg-surface-raised/50 p-4 transition-all duration-300"
                    style={{
                      filter: "grayscale(0.6) brightness(0.4)", // All tiers appear locked for guests
                    }}
                  >
                    {/* Tier Frame */}
                    <TierFrame
                      tier={tier.name}
                      level={1}
                      src={null}
                      size="md"
                      hideBadge
                      placeholder={
                        <span style={{ fontSize: 20 }}>
                          {(() => {
                            const cfg = getTierConfig(tier.name);
                            const IconCmp = cfg.icon;
                            return <IconCmp weight={cfg.iconWeight as any} />;
                          })()}
                        </span>
                      }
                    />

                    {/* Tier Name */}
                    <div className="text-center">
                      <div
                        className="text-sm font-bold"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        {tier.minXp.toLocaleString()} XP
                      </div>
                    </div>

                    {/* Arrow (except last) */}
                    {i < TIER_LADDER.length - 1 && (
                      <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 text-faint">
                        <span className="text-xs">→</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </HScrollArea>
          </div>

          {/* Sample Challenges */}
          <div className="mb-12 animate-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-muted">
                Sample Challenges
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {SAMPLE_CHALLENGES.map((challenge, idx) => {
                const rarity = getRarity(challenge.xp);
                return (
                  <div
                    key={idx}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border cursor-default transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "var(--surface-raised)",
                      borderColor: rarity.border,
                      boxShadow: `0 6px 20px var(--shadow-elevation)`,
                    }}
                  >
                    {/* Top accent strip */}
                    <div
                      className="h-[3px] w-full shrink-0"
                      style={{
                        background: `linear-gradient(90deg, ${rarity.bar[0]}, ${rarity.bar[1]})`,
                        boxShadow: `0 0 10px ${rarity.glow}`,
                      }}
                    />

                    <div className="relative flex flex-col gap-3 p-4">
                      {/* Icon + XP */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl"
                          style={{
                            background: `${rarity.text}18`,
                            borderColor: rarity.border,
                          }}
                        >
                          {challenge.icon}
                        </div>

                        <span
                          className="rounded-full px-2.5 py-0.5 text-[12px] font-black"
                          style={{
                            color: rarity.text,
                            background: rarity.glow,
                            border: `1px solid ${rarity.text}44`,
                            boxShadow: `0 0 14px ${rarity.glow}`,
                          }}
                        >
                          +{challenge.xp} XP
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-black leading-snug text-primary">
                        {challenge.title}
                      </h3>

                      {/* Rarity Label */}
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.2em] uppercase self-start"
                        style={{
                          color: rarity.text,
                          background: rarity.glow,
                          border: `1px solid ${rarity.text}33`,
                        }}
                      >
                        {rarity.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center animate-in">
            <Link
              href={user ? "/challenges" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:shadow-[0_0_30px_rgba(80,200,120,0.4)] hover:scale-105 transition-all duration-300 group"
            >
              {user ? "Start Earning XP" : "Start Earning XP"}
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-muted text-xs mt-3">
              {user
                ? "Complete challenges to climb the leaderboard"
                : "Sign up to track your progress and earn rewards"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
