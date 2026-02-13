"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Button from "../ui/Button";
import { Menu, X, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock checking if user is logged in (replace with real auth later)
  const isLoggedIn = true;
  const userType = pathname?.includes("venue-dashboard") ? "venue_owner" : "player";

  // Navigation Links based on Context
  const isVenueContext = pathname?.startsWith("/venue-dashboard");

  const navLinks = isVenueContext ? [
    { name: "Dashboard", href: "/venue-dashboard" },
    { name: "Calendar", href: "/venue-dashboard/calendar" },
    { name: "Bookings", href: "/venue-dashboard/bookings" },
    { name: "Settings", href: "/venue-dashboard/settings" },
  ] : [
    { name: "Home", href: "/" },
    { name: "Venues", href: "/venues" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href={isVenueContext ? "/venue-dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-white/20 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-blue-500 opacity-50"></div>
            <span className="relative font-bold text-white">A</span>
          </div>
          <span className="font-black text-xl text-white tracking-tight">
            ARENA<span className="text-emerald-500">.LK</span>
          </span>
          {isVenueContext && <span className="ml-2 text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">BUSINESS</span>}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-white relative
                ${pathname === link.href ? "text-white" : "text-zinc-400"}
              `}
            >
              {link.name}
              {pathname === link.href && (
                <span className="absolute -bottom-8 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-t-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {!isVenueContext && (
                <Link href="/venue-dashboard">
                  <span className="text-xs font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer mr-2">Manager View</span>
                </Link>
              )}
              <Link href={isVenueContext ? "/venue-dashboard/settings" : "/profile"}>
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:border-emerald-500 transition-colors cursor-pointer">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">
                Log In
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-zinc-200 font-bold">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-black border-b border-zinc-800 p-4 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg font-bold ${pathname === link.href ? "text-white" : "text-zinc-500"}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-zinc-800 my-2"></div>
          {isLoggedIn ? (
            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-400 font-bold">My Profile</Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold">Log In</Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full">Sign Up</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}