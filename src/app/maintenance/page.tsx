"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Wrench, Clock, Mail } from "lucide-react";

export default function MaintenancePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!rootRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      rootRef.current.querySelectorAll(".m-word"),
      { y: 40, opacity: 0, rotateX: -25 },
      { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.09, ease: "back.out(1.4)" },
      0.2
    )
      .fromTo(
        rootRef.current.querySelector(".m-tagline"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.8
      )
      .fromTo(
        rootRef.current.querySelector(".m-body"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        1.0
      )
      .fromTo(
        rootRef.current.querySelectorAll(".m-card"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        1.2
      )
      .fromTo(
        rootRef.current.querySelector(".m-footer"),
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        1.5
      );

    // Pulsing status dot
    gsap.to(rootRef.current.querySelector(".m-pulse"), {
      scale: 1.6,
      opacity: 0,
      duration: 1.4,
      repeat: -1,
      ease: "power1.out",
    });
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] min-h-screen w-full bg-black overflow-hidden flex flex-col"
    >
      {/* Background blobs (matches Hero) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Diagonal scan lines */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 12px)",
        }}
      />

      {/* Top brand bar */}
      <div className="relative z-10 w-full px-6 md:px-10 pt-6 md:pt-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-black font-black text-sm">A</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wider uppercase">
            The Arena
          </span>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800">
          <div className="relative flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full relative z-10" />
            <div className="m-pulse absolute w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-300">
            Maintenance
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl text-center perspective-[1000px]">
          {/* Icon */}
          <div className="m-card inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <Wrench className="w-9 h-9 md:w-11 md:h-11 text-emerald-400" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white mb-4 flex flex-wrap justify-center gap-x-3 md:gap-x-5 leading-none">
            <span className="m-word inline-block">HALF</span>
            <span className="m-word inline-block text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
              TIME
            </span>
          </h1>

          {/* Tagline */}
          <p className="m-tagline text-zinc-400 text-sm md:text-base uppercase tracking-[0.3em] mb-6 md:mb-8 font-semibold">
            We&apos;ll be back on the court shortly
          </p>

          {/* Body */}
          <p className="m-body text-zinc-500 text-sm md:text-base max-w-xl mx-auto mb-10 md:mb-14 leading-relaxed">
            Our team is upgrading the arena&apos;s infrastructure to bring you an
            even smoother booking experience. Thanks for your patience &mdash;
            game time resumes soon.
          </p>

          {/* Info cards */}
          <div className="grid sm:grid-cols-2 gap-3 md:gap-4 max-w-xl mx-auto">
            <div className="m-card bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-4 md:p-5 text-left hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Status
                </span>
              </div>
              <p className="text-white font-bold text-sm md:text-base">
                In Progress
              </p>
            </div>

            <a
              href="mailto:support@thearena.lk"
              className="m-card bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-4 md:p-5 text-left hover:border-emerald-500/30 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Questions?
                </span>
              </div>
              <p className="text-white font-bold text-sm md:text-base group-hover:text-emerald-400 transition-colors truncate">
                support@thearena.lk
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="m-footer relative z-10 w-full px-6 md:px-10 pb-6 md:pb-8 text-center">
        <p className="text-zinc-600 text-[10px] md:text-xs uppercase tracking-[0.25em]">
          &copy; {new Date().getFullYear()} The Arena &mdash; Sri Lanka&apos;s
          Premium Sports Booking
        </p>
      </div>
    </div>
  );
}
