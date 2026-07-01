"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Trophy, MapPin, CalendarBlank, User, SquaresFour } from "@phosphor-icons/react";
import { useAuth } from "@/services/authContext";
import gsap from "gsap";

// 5-column grid. Col 2 = Explore spacer. Centers: 10%, 30%, skip 50%, 70%, 90%
const NAV = [
  { path: "/",           label: "Home",       Icon: House,         center: "10%" },
  { path: "/challenges", label: "Challenges", Icon: Trophy,        center: "30%" },
  { path: "/bookings",   label: "Bookings",   Icon: CalendarBlank, center: "70%" },
  { path: "/profile",    label: "Profile",    Icon: User,          center: "90%" },
] as const;

function NavItem({ item, isActive }: { item: (typeof NAV)[number]; isActive: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [burstKey, setBurstKey] = useState(0);
  const prevActive = useRef(false);

  useEffect(() => {
    const justActivated = isActive && !prevActive.current;
    if (justActivated && containerRef.current) {
      // GSAP elastic spring bounce with slight rotation
      gsap.killTweensOf(containerRef.current);
      gsap.fromTo(
        containerRef.current,
        { scale: 0.5, y: 10, rotate: -10 },
        { scale: 1, y: 0, rotate: 0, duration: 0.7, ease: "elastic.out(1.3, 0.45)", clearProps: "all" }
      );
      // Trigger particle burst by remounting
      setBurstKey(k => k + 1);
    }
    prevActive.current = isActive;
  }, [isActive]);

  const { Icon } = item;

  return (
    <Link
      href={item.path}
      className="relative flex flex-col items-center justify-center h-full gap-1 select-none"
      style={{ overflow: "visible" }}
    >
      {/* Glow bloom */}
      <span className={`absolute top-0 w-12 h-12 rounded-full pointer-events-none transition-all duration-700 blur-xl ${
        isActive ? "bg-emerald-500/35 opacity-100" : "opacity-0"
      }`} />

      {/* Particle burst — remounts on each activation to replay animation */}
      {burstKey > 0 && (
        <div key={burstKey} className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={`nav-particle nav-p${i}`} />
          ))}
        </div>
      )}

      {/* Icon pill */}
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center w-11 h-9 rounded-xl ${isActive ? "bg-emerald-500/15" : ""}`}
      >
        {isActive && <span className="absolute inset-0 rounded-xl nav-pill-shimmer pointer-events-none" />}
        <Icon
          size={isActive ? 22 : 18}
          weight={isActive ? "fill" : "duotone"}
          className={`relative z-10 transition-all duration-300 ${isActive ? "text-emerald-400" : "text-muted"}`}
        />
      </div>

      {/* Label */}
      <span className={`text-[9.5px] font-semibold tracking-tight leading-none transition-all duration-300 ${isActive ? "text-emerald-400" : "text-muted"}`}>
        {item.label}
      </span>

      {/* Active dot */}
      <span className={`absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-400 transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isVenueOwner, isVenueManager } = useAuth();
  const indicatorRef = useRef<HTMLDivElement>(null);

  const isVenueContext = pathname?.startsWith("/venue-dashboard");

  const activeItem = NAV.find(item =>
    item.path === "/" ? pathname === item.path : pathname?.startsWith(item.path)
  );

  // Slide the indicator bar to the active tab
  useEffect(() => {
    if (!indicatorRef.current) return;
    if (!activeItem) { gsap.to(indicatorRef.current, { opacity: 0, duration: 0.2 }); return; }
    gsap.to(indicatorRef.current, {
      left: activeItem.center,
      xPercent: -50,
      opacity: 1,
      duration: 0.55,
      ease: "elastic.out(1, 0.65)",
    });
  }, [activeItem?.path]);

  if (isVenueContext) return null;

  const isManager = isVenueOwner || isVenueManager;
  const exploreActive = pathname?.startsWith("/venues");

  return (
    <>
      {isManager && (
        <a
          href={`https://${process.env.NEXT_PUBLIC_VENUE_DOMAIN || 'centers.thearena.lk'}/venue-dashboard`}
          className="fixed bottom-[5.5rem] right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-glass-bg backdrop-blur-xl border border-blue-500/40 text-blue-400 text-xs font-bold shadow-lg hover:border-blue-400/60 hover:text-blue-300 active:scale-95 transition-all md:hidden"
        >
          <SquaresFour weight="duotone" size={14} />
          Manager Dashboard
        </a>
      )}

      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="relative bg-glass-bg backdrop-blur-2xl rounded-2xl border border-glass-border shadow-[0_8px_32px_var(--shadow-elevation),inset_0_1px_0_var(--glass-highlight)]">

          {/* Sliding glowing indicator bar */}
          <div
            ref={indicatorRef}
            className="absolute top-0 h-[3px] w-8 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300 shadow-[0_0_10px_rgba(80,200,120,0.9),0_0_20px_rgba(80,200,120,0.5)] -translate-x-1/2"
            style={{ left: activeItem?.center ?? "10%", opacity: activeItem ? 1 : 0 }}
          />

          {/* Center floating Explore button */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <Link href="/venues" aria-label="Explore venues" className="relative block active:scale-95 transition-transform duration-150">
              {exploreActive && <span className="absolute -inset-1.5 rounded-full bg-emerald-500/25 animate-ping" />}
              <span className={`absolute -inset-1 rounded-full transition-all duration-500 ${exploreActive ? "bg-emerald-500/25 blur-md" : "bg-emerald-500/10 blur-sm"}`} />
              <div className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center border-[3px] border-surface-base transition-all duration-300 ${
                exploreActive
                  ? "bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 shadow-[0_0_32px_rgba(16,185,129,0.95)]"
                  : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
              }`}>
                <MapPin size={20} weight="fill" className="text-black drop-shadow-sm" />
              </div>
            </Link>
          </div>

          {/* Nav grid */}
          <div className="grid grid-cols-5 h-[62px] px-1" style={{ overflow: "visible" }}>
            {NAV.slice(0, 2).map(item => (
              <NavItem key={item.path} item={item} isActive={item.path === "/" ? pathname === item.path : !!pathname?.startsWith(item.path)} />
            ))}
            {/* Explore spacer */}
            <div className="flex flex-col items-center justify-end pb-2.5">
              <span className={`text-[9.5px] font-semibold tracking-tight leading-none transition-colors duration-300 ${exploreActive ? "text-emerald-400" : "text-muted"}`}>
                Explore
              </span>
            </div>
            {NAV.slice(2).map(item => (
              <NavItem key={item.path} item={item} isActive={!!pathname?.startsWith(item.path)} />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
