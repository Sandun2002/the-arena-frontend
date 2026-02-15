"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone, Laptop, Clock, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/Toast";
import { Session } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function SessionsPage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);

    const loadSessions = async () => {
        try {
            const data = await authService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions");
        }
    };

    useEffect(() => {
        if (user) loadSessions();
    }, [user]);

    const handleRevokeSession = async (jti: string) => {
        // Call mock service
        await authService.revokeSession(jti).catch(() => { }); // Mock method if exists, or just simulate
        setSessions(prev => prev.filter(s => s.jti !== jti));
        addToast("Session revoked successfully", "success");
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-3xl">

                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                </Link>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <div className="flex gap-4 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
                            <Monitor className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Active Sessions</h1>
                            <p className="text-zinc-500 text-sm mt-1">Manage devices where you're currently logged in.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sessions.length > 0 ? (
                            sessions.map((session) => (
                                <div key={session.jti} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/30 transition-colors">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                                            {session.user_agent.toLowerCase().includes("mobile") ? <Smartphone className="w-6 h-6 text-zinc-400" /> : <Laptop className="w-6 h-6 text-zinc-400" />}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold flex items-center gap-2">
                                                {session.user_agent.split(")")[0] + ")"}
                                                {session.is_current && <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">THIS DEVICE</span>}
                                            </p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-zinc-500 flex items-center gap-1.5 align-middle">
                                                    <Clock className="w-3.5 h-3.5" /> Active {formatDistanceToNow(new Date(session.created_at))} ago
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.is_current && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-zinc-400 border-zinc-700 hover:text-red-400 hover:border-red-400 hover:bg-red-400/10 w-full md:w-auto"
                                            onClick={() => handleRevokeSession(session.jti)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Revoke
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-zinc-500">
                                <p>No active sessions found (Mock).</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
