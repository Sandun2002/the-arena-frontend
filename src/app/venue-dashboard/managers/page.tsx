"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Mail, Shield, User, MoreVertical } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";

// -- Mock Data --
const VENUE_STAFF = [
    {
        id: "s1",
        name: "David Miller",
        email: "david@example.com",
        role: "Admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop",
        status: "Active"
    },
    {
        id: "s2",
        name: "Sarah Jones",
        email: "sarah@example.com",
        role: "Manager",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2670&auto=format&fit=crop",
        status: "Active"
    },
    {
        id: "s3",
        name: "Mike Ross",
        email: "mike@example.com",
        role: "Staff",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2670&auto=format&fit=crop",
        status: "Pending"
    },
];

export default function ManagersPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".page-header",
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
            );
            gsap.fromTo(".staff-row",
                { x: -20, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "Admin": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
            case "Manager": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
            default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
        }
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl relative z-10">

                <div className="page-header flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Team <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text">Management</span>
                        </h1>
                        <p className="text-zinc-400">Control access and permissions for your venue staff.</p>
                    </div>
                    <Button className="bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        <Plus className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] overflow-hidden backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-6 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-5 pl-2">Member</div>
                        <div className="col-span-3">Role</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-zinc-800/50">
                        {VENUE_STAFF.map(staff => (
                            <div key={staff.id} className="staff-row grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors group">
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-700">
                                        <Image src={staff.avatar} alt={staff.name} fill className="object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-base">{staff.name}</h3>
                                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                            <Mail className="h-3 w-3" /> {staff.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(staff.role)}`}>
                                        {staff.role}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`text-xs font-bold ${staff.status === 'Active' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                        ● {staff.status}
                                    </span>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Role Definitions</h3>
                            <p className="text-xs text-zinc-500">Learn about access levels and permissions.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="text-xs border-zinc-700">View Guide</Button>
                </div>

            </div>
        </main>
    );
}
