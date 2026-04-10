"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, MapPin, Calendar, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/services/authContext";

function NavItem({
  path,
  label,
  icon: Icon,
  pathname,
}: {
  path: string;
  label: string;
  icon: React.ElementType;
  pathname: string | null;
}) {
  const isActive =
    path === "/" ? pathname === path : pathname?.startsWith(path);

  return (
    <Link
      href={path}
      className="flex flex-col items-center justify-center h-full gap-1 group"
    >
      <div
        className={`flex items-center justify-center w-10 h-8 rounded-xl transition-all duration-300 ${
          isActive ? "bg-emerald-500/15" : "group-hover:bg-white/5"
        }`}
      >
        <Icon
          className={`transition-all duration-300 ${
            isActive
              ? "w-[19px] h-[19px] text-emerald-400"
              : "w-[18px] h-[18px] text-zinc-500 group-hover:text-zinc-400"
          }`}
        />
      </div>
      <span
        className={`text-[9.5px] font-semibold tracking-tight transition-colors duration-300 leading-none ${
          isActive
            ? "text-emerald-400"
            : "text-zinc-600 group-hover:text-zinc-500"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isVenueOwner, isVenueManager } = useAuth();

  const isVenueContext = pathname?.startsWith("/venue-dashboard");

  if (isVenueContext) return null;

  const isManager = isVenueOwner || isVenueManager;
  const exploreActive = pathname?.startsWith("/venues");

  return (
    <>
      {/* Manager Quick Access Pill */}
      {isManager && (
        <Link
          href="/venue-dashboard"
          className="fixed bottom-[5.5rem] right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-blue-500/40 text-blue-400 text-xs font-bold shadow-lg hover:border-blue-400/60 hover:text-blue-300 active:scale-95 transition-all md:hidden"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Manager Dashboard
        </Link>
      )}

      {/* Floating Island Nav */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="relative bg-zinc-950/95 backdrop-blur-2xl rounded-2xl border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.04)]">

          {/* Center Explore Button — breaks through the top */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <Link href="/venues" aria-label="Explore venues" className="relative block active:scale-95 transition-transform">
              {/* Ambient glow ring */}
              {exploreActive && (
                <span className="absolute -inset-1.5 rounded-full bg-emerald-500/25 animate-ping" />
              )}
              <span
                className={`absolute -inset-1 rounded-full transition-all duration-500 ${
                  exploreActive
                    ? "bg-emerald-500/20 blur-md"
                    : "bg-emerald-500/10 blur-sm"
                }`}
              />
              <div
                className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center border-[3px] border-zinc-950 transition-all duration-300 ${
                  exploreActive
                    ? "bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 shadow-[0_0_28px_rgba(16,185,129,0.95)]"
                    : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
                }`}
              >
                <MapPin className="w-5 h-5 text-black drop-shadow-sm" strokeWidth={2.5} />
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <div className="grid grid-cols-5 h-[60px] px-1">
            <NavItem path="/" label="Home" icon={Home} pathname={pathname} />
            <NavItem
              path="/challenges"
              label="Challenges"
              icon={Trophy}
              pathname={pathname}
            />
            {/* Center spacer — label sits below the floating button */}
            <div className="flex flex-col items-center justify-end pb-2">
              <span
                className={`text-[9.5px] font-semibold tracking-tight leading-none transition-colors duration-300 ${
                  exploreActive ? "text-emerald-400" : "text-zinc-600"
                }`}
              >
                Explore
              </span>
            </div>
            <NavItem
              path="/bookings"
              label="Bookings"
              icon={Calendar}
              pathname={pathname}
            />
            <NavItem
              path="/profile"
              label="Profile"
              icon={User}
              pathname={pathname}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
