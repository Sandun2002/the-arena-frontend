
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import Button from "../ui/Button";
import { List, X, User, SignOut, CalendarBlank, Gear, Shield } from "@phosphor-icons/react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { useAuth } from "@/services/authContext";
import VenueSwitcher from "@/components/venue/VenueSwitcher";
import TierFrame from "@/components/ui/TierFrame";
import { getTierFromXp } from "@/lib/tierUtils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(userMenuRef, () => setIsUserMenuOpen(false));

  const { resolvedTheme } = useTheme();
  const { isLoggedIn, user, logout, isVenueOwner, isVenueManager } = useAuth();
  
  // Determine Context
  const isVenueContext = pathname?.startsWith("/venue-dashboard");
  const showVenueSwitcher = isVenueContext && (isVenueOwner || isVenueManager);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Venues", path: "/venues" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 bg-glass-bg backdrop-blur-lg border-b border-glass-border overflow-visible${isVenueContext ? "" : " hidden md:block"}`}>
      <div className="max-w-7xl w-full mx-auto px-4 h-20 flex items-center justify-between min-w-0">

        {/* Logo Area */}
        <div className="flex items-center gap-6 min-w-0 shrink-0">
          <Link href={isVenueContext ? "/venue-dashboard" : "/"} className="flex items-center gap-3 group">
            <Image src={resolvedTheme === "dark" ? "/logo-nav.png" : "/logo-nav-for-light-mode.png"} alt="The Arena" width={82} height={36} priority sizes="82px" className="h-10 md:h-12 w-auto object-contain" />
            {isVenueContext && <span className="ml-2 text-[10px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase tracking-wide">Business</span>}
          </Link>

          {/* Venue Switcher (Desktop) */}
          {showVenueSwitcher && (
            <div className="hidden md:block">
              <VenueSwitcher />
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className={`hidden ${isVenueContext ? 'xl:flex' : 'md:flex'} items-center gap-6 lg:gap-8 min-w-0`}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary relative
                ${pathname === link.path ? "text-primary" : "text-secondary"}
              `}
            >
              {link.name}
              {pathname === link.path && (
                <span className="absolute -bottom-8 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-t-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">

              {/* Notification Bell */}
              <div className="relative">
                <NotificationBell />
                <NotificationPanel />
              </div>

              {/* Context Switcher Link */}
              {!isVenueContext && (isVenueOwner || isVenueManager) && (
                <Link href="/venue-dashboard">
                  <span className="text-xs font-bold text-muted hover:text-primary transition-colors cursor-pointer mr-2 uppercase tracking-wide">Manager View</span>
                </Link>
              )}
              {isVenueContext && (
                <Link href="/">
                  <span className="text-xs font-bold text-muted hover:text-primary transition-colors cursor-pointer mr-2 uppercase tracking-wide">Player View</span>
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 hover:bg-surface-overlay/30 pr-3 pl-2 py-1.5 rounded-full transition-colors border border-transparent hover:border-default"
                >
                  <TierFrame
                    tier={getTierFromXp(user?.xp ?? 0)}
                    level={user?.level ?? 1}
                    src={user?.profile_image}
                    size="sm"
                    alt="Profile"
                  />
                  <span className="text-sm font-medium text-primary max-w-[100px] truncate">{user?.full_name?.split(' ')[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-surface-raised border border-default rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-default">
                      <p className="text-sm font-bold text-primary truncate">{user?.full_name}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-overlay rounded-lg transition-colors">
                        <User size={16} weight="duotone" /> My Profile
                      </Link>
                      <Link href="/bookings" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-overlay rounded-lg transition-colors">
                        <CalendarBlank size={16} weight="duotone" /> My Bookings
                      </Link>
                      <Link href="/settings/sessions" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-overlay rounded-lg transition-colors">
                        <Shield size={16} weight="duotone" /> Security
                      </Link>
                      <Link href="/settings/notifications" className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-overlay rounded-lg transition-colors">
                        <Gear size={16} weight="duotone" /> Notifications
                      </Link>
                    </div>
                    <div className="p-2 border-t border-default">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <SignOut size={16} weight="duotone" /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-primary hover:text-emerald-400 transition-colors">
                Log In
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-inverted hover:opacity-90 font-bold">Sign Up</Button>
              </Link>
            </>
          )}
          {/* Theme toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-primary p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-surface-base/95 backdrop-blur-xl border-t border-default p-6 flex flex-col gap-6 animate-fade-in z-40 overflow-y-auto">

          {isLoggedIn && (
            <div className="flex items-center gap-4 pb-6 border-b border-default">
              <TierFrame
                tier={getTierFromXp(user?.xp ?? 0)}
                level={user?.level ?? 1}
                src={user?.profile_image}
                size="md"
                alt="Profile"
              />
              <div>
                <p className="text-lg font-bold text-primary">{user?.full_name}</p>
                <p className="text-sm text-muted">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <div className="flex flex-col gap-4">
            {/* Global Navigation Links ALWAYS */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-2xl font-black uppercase tracking-tight transition-colors ${pathname === link.path ? "text-emerald-500" : "text-secondary hover:text-primary"
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}


          </div>

          <div className="mt-auto pt-6 border-t border-default flex flex-col gap-3">
            {/* Theme toggle row */}
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-sm font-medium text-secondary">Theme</span>
              <ThemeToggle />
            </div>
            {isLoggedIn ? (
              <>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Profile Settings</Button>
                </Link>
                <Button onClick={logout} className="w-full justify-center bg-red-600 hover:bg-red-700 text-white border-none">
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Log In</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-emerald-500 text-black hover:bg-emerald-400">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}