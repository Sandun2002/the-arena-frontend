
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Calendar, CalendarCheck, Users, Settings,
    LogOut, Menu, X, Building2, Image as ImageIcon,
    Hammer, Repeat, ChevronRight, BarChart2, DollarSign,
    PieChart, Activity
} from "lucide-react";
import { useAuth } from "@/services/authContext";
import VenueSwitcher from "./VenueSwitcher";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout, isVenueManager } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const sidebarRef = useRef(null);
    const contentRef = useRef(null);

    // GSAP Entry Animations
    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from(sidebarRef.current, {
            x: -50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        })
            .from(contentRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.4");

    }, []);

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const routes = [
        { name: "Dashboard", path: "/venue-dashboard", icon: LayoutDashboard },
        { name: "Booking Manager", path: "/venue-dashboard/booking-manager", icon: Calendar },
        { name: "Bookings", path: "/venue-dashboard/bookings", icon: CalendarCheck },
        { name: "Courts", path: "/venue-dashboard/courts", icon: Building2 },
        { name: "Gallery", path: "/venue-dashboard/gallery", icon: ImageIcon },
        { name: "Recurring", path: "/venue-dashboard/recurring", icon: Repeat },
        { name: "Closures", path: "/venue-dashboard/closures", icon: Hammer },
        { name: "Settings", path: "/venue-dashboard/settings", icon: Settings },
    ];

    // Analytics Sub-menu
    const analyticsRoutes = [
        { name: "Overview", path: "/venue-dashboard/analytics", icon: BarChart2 },
        { name: "Revenue", path: "/venue-dashboard/analytics/revenue", icon: DollarSign, ownerOnly: true },
        { name: "Utilization", path: "/venue-dashboard/analytics/utilization", icon: Activity },
        { name: "Fees", path: "/venue-dashboard/analytics/fees", icon: PieChart, ownerOnly: true },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex selection:bg-emerald-500/30 overflow-hidden pt-20">

            {/* Global Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed top-20 left-0 z-50 h-[calc(100vh-5rem)] w-72 
                    bg-zinc-900/60 border-r border-zinc-800/60 backdrop-blur-xl
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800/60">
                        <Link href="/" className="block mb-6">
                            <span className="font-black text-2xl text-white tracking-tight">
                                ARENA<span className="text-emerald-500">.LK</span>
                            </span>
                        </Link>
                        <VenueSwitcher />
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                        <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Menu</p>

                        {routes.map((route) => {
                            const isActive = pathname === route.path;
                            return (
                                <Link
                                    key={route.path}
                                    href={route.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                        ${isActive
                                            ? "text-emerald-400 font-bold bg-zinc-800/50 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                            : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white border border-transparent"
                                        }
                                    `}
                                >
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none" />}
                                    <route.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500 transition-colors"}`} />
                                    <span className="relative z-10">{route.name}</span>
                                    {isActive && <ChevronRight className="ml-auto w-4 h-4 text-emerald-500/80 relative z-10" />}
                                </Link>
                            );
                        })}

                        <div className="pt-8 pb-2">
                            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Analytics</p>
                            {analyticsRoutes.map((route) => {
                                if (isVenueManager && route.ownerOnly) return null; // RBAC Check

                                const isActive = pathname === route.path;
                                return (
                                    <Link
                                        key={route.path}
                                        href={route.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
                                             flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                                             ${isActive
                                                ? "text-blue-400 font-bold bg-zinc-800/50 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white border border-transparent"
                                            }
                                         `}
                                    >
                                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />}
                                        <route.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-blue-500 transition-colors"}`} />
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
                {/* Mobile Header */}
                <header className={`lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? "bg-black/60 backdrop-blur-md border-b border-zinc-800/50" : "bg-transparent"}`}>
                    <Link href="/" className="block">
                        <span className="font-black text-xl text-white tracking-tight">
                            ARENA<span className="text-emerald-500">.LK</span>
                        </span>
                    </Link>
                    <button onClick={toggleSidebar} className="p-2 text-white bg-zinc-800/50 border border-zinc-700/50 rounded-lg backdrop-blur-sm">
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </header>

                <main ref={contentRef} className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
