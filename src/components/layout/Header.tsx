"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, User, LogOut, Calendar, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/services/authContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isLoggedIn, userType, user, logout } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Venues", href: "/venues" },
    { name: "Partner", href: "/partner" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Add My Bookings link for logged-in players
  const playerLinks = [
    { name: "My Bookings", href: "/bookings", icon: Calendar },
    { name: "Profile", href: "/profile", icon: User },
  ];

  // Add Dashboard link for venue owners
  const venueLinks = [
    { name: "Dashboard", href: "/venue-dashboard", icon: LayoutDashboard },
    { name: "Settings", href: "/venue-dashboard/settings", icon: User },
  ];

  const authLinks = userType === "venue" ? venueLinks : playerLinks;

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white">
          THE <span className="text-emerald-500">ARENA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-emerald-400"
            >
              {link.name}
            </Link>
          ))}
          {/* Show additional links for logged-in users */}
          {isLoggedIn && (
            <Link
              href={userType === "venue" ? "/venue-dashboard" : "/bookings"}
              className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              {userType === "venue" ? "Dashboard" : "My Bookings"}
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            // Logged-in user dropdown
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-emerald-500 hover:bg-zinc-800"
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="max-w-[100px] truncate">{user?.name || "User"}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-900 py-2 shadow-xl animate-fade-in">
                  {authLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.name}
                    </Link>
                  ))}
                  <hr className="my-2 border-zinc-800" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Guest - Sign In button
            <Link href="/login">
              <button className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-emerald-500 hover:bg-zinc-800">
                <User className="h-4 w-4" />
                Sign In
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="border-b border-zinc-800 bg-black px-4 py-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-emerald-400"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <hr className="border-zinc-800" />
                {authLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400">
                  <User className="h-4 w-4" /> Sign In
                </button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}