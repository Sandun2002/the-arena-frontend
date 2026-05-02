"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Trophy, MapPin, CalendarBlank, User, SquaresFour } from "@phosphor-icons/react";
import LordIcon from "@/components/ui/LordIcon";
import { useAuth } from "@/services/authContext";

function NavItem({
  path,
  label,
  icon: FallbackIcon,
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
          isActive ? "bg-emerald-500/15" : "group-hover:bg-surface-overlay/40"
        }`}
      >
        <LordIcon
          icon={null} // TODO: Add Lordicon JSON when available
          fallback={FallbackIcon}
          size={isActive ? 20 : 18}
          trigger="morph"
          className={`transition-all duration-300 ${
            isActive
              ? "text-emerald-400"
              : "text-muted group-hover:text-secondary"
          }`}
        />
      </div>
      <span
        className={`text-[9.5px] font-semibold tracking-tight transition-colors duration-300 leading-none ${
          isActive
            ? "text-emerald-400"
            : "text-muted group-hover:text-secondary"
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
          className="fixed bottom-[5.5rem] right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-glass-bg backdrop-blur-xl border border-blue-500/40 text-blue-400 text-xs font-bold shadow-lg hover:border-blue-400/60 hover:text-blue-300 active:scale-95 transition-all md:hidden"
        >
          <SquaresFour weight="duotone" size={14} />
          Manager Dashboard
        </Link>
      )}

      {/* Floating Island Nav */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="relative bg-glass-bg backdrop-blur-2xl rounded-2xl border border-glass-border shadow-[0_8px_32px_var(--shadow-elevation),inset_0_1px_0_var(--glass-highlight)]">

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
                className={`relative w-[52px] h-[52px] rounded-full flex items-center justify-center border-[3px] border-surface-base transition-all duration-300 ${
                  exploreActive
                    ? "bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 shadow-[0_0_28px_rgba(16,185,129,0.95)]"
                    : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
                }`}
              >
                <MapPin size={20} weight="fill" className="text-black drop-shadow-sm" />
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <div className="grid grid-cols-5 h-[60px] px-1">
            <NavItem path="/" label="Home" icon={House} pathname={pathname} />
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
                  exploreActive ? "text-emerald-400" : "text-muted"
                }`}
              >
                Explore
              </span>
            </div>
            <NavItem
              path="/bookings"
              label="Bookings"
              icon={CalendarBlank}
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
