"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Loader2, MapPinOff } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

export default function MobileTopBar() {
  const pathname = usePathname();
  const { locState, locName, requestLocation } = useLocation();

  if (pathname?.startsWith("/venue-dashboard")) return null;
  if (pathname?.startsWith("/login") || pathname?.startsWith("/signup")) return null;

  // ── Location Pill ─────────────────────────────────────────────────────────
  const LocationPill = () => {
    const base =
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all active:scale-95 max-w-[130px] truncate";

    if (locState === "loading") {
      return (
        <span className={`${base} bg-zinc-800/60 border-zinc-700/40 text-zinc-400 pointer-events-none`}>
          <Loader2 className="w-3 h-3 animate-spin shrink-0" />
          <span className="truncate">Locating…</span>
        </span>
      );
    }

    if (locState === "granted" && locName) {
      return (
        <button
          onClick={requestLocation}
          className={`${base} bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50`}
        >
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{locName}</span>
        </button>
      );
    }

    if (locState === "denied") {
      return (
        <button
          onClick={requestLocation}
          className={`${base} bg-zinc-800/60 border-zinc-700/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300`}
        >
          <MapPinOff className="w-3 h-3 shrink-0" />
          <span className="truncate">No location</span>
        </button>
      );
    }

    // idle
    return (
      <button
        onClick={requestLocation}
        className={`${base} bg-zinc-800/60 border-zinc-700/40 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-500/5`}
      >
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">Set location</span>
      </button>
    );
  };

  return (
    <header className="fixed top-3 left-4 right-4 z-50 md:hidden">
      <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-2xl border border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] h-14 px-4 flex items-center justify-between gap-2">

        {/* Left: Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo-nav.png"
            alt="The Arena"
            width={144}
            height={63}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Right: Location Pill */}
        <LocationPill />
      </div>
    </header>
  );
}
