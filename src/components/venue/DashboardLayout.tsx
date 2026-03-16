
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Calendar, CalendarCheck, Users, Settings,
    LogOut, Menu, X, Building2, Image as ImageIcon,
    Hammer, Repeat, ChevronRight, BarChart2, DollarSign,
    PieChart, Activity, Clock
} from "lucide-react";
import { useAuth } from "@/services/authContext";
import { useVenue } from "./VenueContext";
import VenueSwitcher from "./VenueSwitcher";
import FullScreenSpinner from "../ui/FullScreenSpinner";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isVenueManager, isLoggedIn, loading } = useAuth();
    const { currentVenue } = useVenue();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Auth Guard
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace("/login");
        }
    }, [loading, isLoggedIn, router]);

    // Verification Guard Redirect
    useEffect(() => {
        if (!loading && isLoggedIn && currentVenue && !currentVenue.is_verified) {
            const allRoutes = [...routes, ...analyticsRoutes];
            const currentRoute = allRoutes.find(r => r.path === pathname);
            
            if (currentRoute?.verifiedOnly) {
                router.replace("/venue-dashboard");
            }
        }
    }, [currentVenue, pathname, loading, isLoggedIn, router]);

    const sidebarRef = useRef(null);
    const contentRef = useRef(null);

    // GSAP Entry Animations - apply ONLY to content to avoid CSS conflict w/ sidebar translate-x
    useGSAP(() => {
        if (!contentRef.current) return;
        const tl = gsap.timeline();

        tl.from(contentRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out"
        });

    }, []);

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const routes = [
        { name: "Dashboard", path: "/venue-dashboard", icon: LayoutDashboard },
        { name: "Booking Manager", path: "/venue-dashboard/booking-manager", icon: Calendar, verifiedOnly: true },
        { name: "Bookings", path: "/venue-dashboard/bookings", icon: CalendarCheck, verifiedOnly: true },
        { name: "Courts", path: "/venue-dashboard/courts", icon: Building2, verifiedOnly: true },
        { name: "Gallery", path: "/venue-dashboard/gallery", icon: ImageIcon, verifiedOnly: true },
        { name: "Recurring", path: "/venue-dashboard/recurring", icon: Repeat, verifiedOnly: true },
        { name: "Closures", path: "/venue-dashboard/closures", icon: Hammer, verifiedOnly: true },
        { name: "Settings", path: "/venue-dashboard/settings", icon: Settings, verifiedOnly: true },
    ];

    // Analytics Sub-menu
    const analyticsRoutes = [
        { name: "Overview", path: "/venue-dashboard/analytics", icon: BarChart2, verifiedOnly: true },
        { name: "Revenue", path: "/venue-dashboard/analytics/revenue", icon: DollarSign, ownerOnly: true, verifiedOnly: true },
        { name: "Utilization", path: "/venue-dashboard/analytics/utilization", icon: Activity, verifiedOnly: true },
        { name: "Fees", path: "/venue-dashboard/analytics/fees", icon: PieChart, ownerOnly: true, verifiedOnly: true },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    if (loading || !isLoggedIn) {
        return <FullScreenSpinner />;
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex selection:bg-emerald-500/30 overflow-hidden lg:pt-20 pt-0">

            {/* Global Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] lg:hidden cursor-pointer"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed lg:top-20 top-0 left-0 z-[60] lg:z-40 lg:h-[calc(100vh-5rem)] h-[100dvh] w-72 
                    bg-zinc-900/60 border-r border-zinc-800/60 backdrop-blur-xl
                    transition-transform duration-300 ease-in-out
                    flex flex-col
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <VenueSwitcher hideCreateAction={true} />
                        </div>
                        <button className="lg:hidden p-2 text-zinc-400 hover:text-white bg-black/40 rounded-xl" onClick={() => setIsSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                        <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Menu</p>

                        {routes.map((route) => {
                            const isActive = pathname === route.path;
                            const isDisabled = route.verifiedOnly && currentVenue && !currentVenue.is_verified;
                            
                            return (
                                <Link
                                    key={route.path}
                                    href={isDisabled ? "#" : route.path}
                                    onClick={(e) => {
                                        if (isDisabled) {
                                            e.preventDefault();
                                            return;
                                        }
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                        ${isDisabled ? "opacity-40 cursor-not-allowed filter grayscale" : "cursor-pointer"}
                                        ${isActive
                                            ? "text-emerald-400 font-bold bg-zinc-800/50 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                            : isDisabled 
                                                ? "text-zinc-600"
                                                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white border border-transparent"
                                        }
                                    `}
                                >
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />}
                                    <route.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-emerald-400" : isDisabled ? "text-zinc-700" : "text-zinc-500 group-hover:text-emerald-500 transition-colors"}`} />
                                    <span className="relative z-10">{route.name}</span>
                                    {isActive && <ChevronRight className="ml-auto w-4 h-4 text-emerald-500/80 relative z-10" />}
                                    {isDisabled && <Clock className="ml-auto w-3 h-3 text-zinc-600" />}
                                </Link>
                            );
                        })}

                        <div className="pt-8 pb-2">
                            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Analytics</p>
                            {analyticsRoutes.map((route) => {
                                if (isVenueManager && route.ownerOnly) return null; // RBAC Check

                                const isActive = pathname === route.path;
                                const isDisabled = route.verifiedOnly && currentVenue && !currentVenue.is_verified;

                                return (
                                    <Link
                                        key={route.path}
                                        href={isDisabled ? "#" : route.path}
                                        onClick={(e) => {
                                            if (isDisabled) {
                                                e.preventDefault();
                                                return;
                                            }
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`
                                             flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                             ${isDisabled ? "opacity-40 cursor-not-allowed filter grayscale" : "cursor-pointer"}
                                             ${isActive
                                                ? "text-blue-400 font-bold bg-zinc-800/50 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                : isDisabled
                                                    ? "text-zinc-600"
                                                    : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white border border-transparent"
                                            }
                                         `}
                                    >
                                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />}
                                        <route.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-blue-400" : isDisabled ? "text-zinc-700" : "text-zinc-500 group-hover:text-blue-500 transition-colors"}`} />
                                        <span className="relative z-10">{route.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {!isVenueManager && (
                            <div className="pt-2">
                                <Link
                                    href="/venue-dashboard/managers"
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                        ${pathname === "/venue-dashboard/managers"
                                            ? "text-purple-400 font-bold bg-zinc-800/50 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                                            : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white border border-transparent"
                                        }
                                    `}
                                >
                                    {pathname === "/venue-dashboard/managers" && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />}
                                    <Users className={`w-5 h-5 relative z-10 ${pathname === "/venue-dashboard/managers" ? "text-purple-400" : "text-zinc-500 group-hover:text-purple-500 transition-colors"}`} />
                                    <span className="relative z-10">Managers</span>
                                </Link>
                            </div>
                        )}

                        <div className="pt-4 pb-2 mt-4 border-t border-zinc-800/60">
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
                            >
                                <LayoutDashboard className="w-5 h-5 relative z-10 text-zinc-500 group-hover:text-white transition-colors" />
                                <span className="relative z-10 font-medium tracking-wide text-sm">Return to Player View</span>
                            </Link>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md">
                        <div className="flex items-center gap-3 px-2 mb-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 ring-2 ring-zinc-700 flex items-center justify-center text-white font-bold shadow-lg">
                                {user?.full_name?.charAt(0) || "U"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
                                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-500/10 hover:border hover:border-red-500/20 rounded-lg transition-all text-sm font-bold"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen w-full relative z-10 lg:pl-72">
                {/* Floating Action Button for Mobile Sidebar */}
                <button
                    onClick={toggleSidebar}
                    className={`
                        lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 
                        bg-emerald-500 rounded-full flex items-center justify-center 
                        text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]
                        hover:bg-emerald-400 hover:scale-105 transition-all duration-300
                        ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    `}
                >
                    <Menu className="w-6 h-6" />
                </button>

                <main ref={contentRef} className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
