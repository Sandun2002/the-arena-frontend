
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Button from "../ui/Button";
import { Menu, X, User, LogOut, Calendar, Settings, Shield } from "lucide-react";
import { useAuth } from "@/services/authContext";
import VenueSwitcher from "@/components/venue/VenueSwitcher";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/5 overflow-visible">
      <div className="max-w-7xl w-full mx-auto px-4 h-20 flex items-center justify-between min-w-0">

        {/* Logo Area */}
        <div className="flex items-center gap-6 min-w-0 shrink-0">
          <Link href={isVenueContext ? "/venue-dashboard" : "/"} className="flex items-center gap-3 group">
            <img src="/logo.png" alt="The Arena" className="h-12 md:h-14 w-auto object-contain" />
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
              className={`text-sm font-medium transition-colors hover:text-white relative
                ${pathname === link.path ? "text-white" : "text-zinc-400"}
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

              {/* Context Switcher Link */}
              {!isVenueContext && (isVenueOwner || isVenueManager) && (
                <Link href="/venue-dashboard">
                  <span className="text-xs font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer mr-2 uppercase tracking-wide">Manager View</span>
                </Link>
              )}
              {isVenueContext && (
                <Link href="/">
                  <span className="text-xs font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer mr-2 uppercase tracking-wide">Player View</span>
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 hover:bg-white/5 pr-3 pl-2 py-1.5 rounded-full transition-colors border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white max-w-[100px] truncate">{user?.full_name?.split(' ')[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-3 border-b border-zinc-800">
                        <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link href="/bookings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                          <Calendar className="w-4 h-4" /> My Bookings
                        </Link>
                        <Link href="/settings/sessions" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                          <Shield className="w-4 h-4" /> Security
                        </Link>
                      </div>
                      <div className="p-2 border-t border-zinc-800">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-black/95 backdrop-blur-xl border-t border-zinc-800 p-6 flex flex-col gap-6 animate-fade-in z-40 overflow-y-auto">

          {isLoggedIn && (
            <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-zinc-400 m-auto mt-3" />
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-white">{user?.full_name}</p>
                <p className="text-sm text-zinc-500">{user?.email}</p>
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
                className={`text-2xl font-black uppercase tracking-tight transition-colors ${pathname === link.path ? "text-emerald-500" : "text-zinc-400 hover:text-white"
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}


          </div>

          <div className="mt-auto pt-6 border-t border-zinc-800 flex flex-col gap-3">
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
                  <Button variant="outline" className="w-full justify-center text-white border-zinc-700">Log In</Button>
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